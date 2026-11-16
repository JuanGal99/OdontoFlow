"use server";

import { z } from "zod";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import {
  getClinicForUser,
  updateClinicSettings,
  ClinicNotFoundError,
} from "@/lib/clinic/service";
import type { UpdateClinicInput } from "@/lib/clinic/validation";
import type { ClinicRecord } from "@/lib/clinic/queries";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toActionError(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return "Debes iniciar sesion para continuar.";
  }
  if (error instanceof ClinicNotFoundError) {
    return "No se encontro el consultorio.";
  }
  if (error instanceof z.ZodError) {
    return "Revisa los datos e intenta de nuevo.";
  }
  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

function assertProfessional(role: string) {
  if (role !== "professional") {
    throw new AuthenticationError("Solo los profesionales pueden editar la configuracion.");
  }
}

export async function getClinicAction(): Promise<ActionResult<ClinicRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const clinic = await getClinicForUser(clinicId);
    return { ok: true, data: clinic };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updateClinicAction(
  input: UpdateClinicInput,
): Promise<ActionResult<ClinicRecord>> {
  try {
    const { clinicId, role } = await getAuthenticatedSessionContext();
    assertProfessional(role);
    const clinic = await updateClinicSettings(clinicId, input);
    return { ok: true, data: clinic };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}
