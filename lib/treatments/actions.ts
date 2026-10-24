"use server";

import { z } from "zod";

import { getAuthenticatedSessionContext, AuthenticationError } from "@/lib/auth/session";
import { UserRole } from "@/lib/generated/prisma/enums";
import { createTreatmentForClinic, listTreatmentsByClinic, TreatmentNotFoundError, TreatmentPatientMismatchError, updateTreatmentForClinic } from "@/lib/treatments/service";
import type { TreatmentRecord } from "@/lib/treatments/queries";
import type { CreateTreatmentInput, UpdateTreatmentInput } from "@/lib/treatments/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function toActionError(error: unknown) {
  if (error instanceof AuthenticationError) return "Debes iniciar sesion para continuar.";
  if (error instanceof TreatmentPatientMismatchError) return "El paciente seleccionado no pertenece a este consultorio o esta inactivo.";
  if (error instanceof TreatmentNotFoundError) return "No encontramos ese tratamiento en este consultorio.";
  if (error instanceof z.ZodError) return "Revisa los datos del tratamiento e intenta de nuevo.";
  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

async function requireProfessional() {
  const context = await getAuthenticatedSessionContext();
  if (context.role !== UserRole.professional) throw new AuthenticationError("Professional role required.");
  return context;
}

export async function listTreatmentsAction(): Promise<ActionResult<TreatmentRecord[]>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await listTreatmentsByClinic(clinicId) };
  } catch (error) { return { ok: false, error: toActionError(error) }; }
}

export async function createTreatmentAction(input: CreateTreatmentInput): Promise<ActionResult<TreatmentRecord>> {
  try {
    const { clinicId } = await requireProfessional();
    return { ok: true, data: await createTreatmentForClinic(clinicId, input) };
  } catch (error) { return { ok: false, error: toActionError(error) }; }
}

export async function updateTreatmentAction(input: UpdateTreatmentInput): Promise<ActionResult<TreatmentRecord>> {
  try {
    const { clinicId } = await requireProfessional();
    return { ok: true, data: await updateTreatmentForClinic(clinicId, input) };
  } catch (error) { return { ok: false, error: toActionError(error) }; }
}
