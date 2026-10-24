"use server";

import { z } from "zod";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import {
  createPatientForClinic,
  getPatientForClinic,
  listPatientsForClinic,
  PatientAlreadyExistsError,
  updatePatientForClinic,
} from "@/lib/patients/service";
import type {
  CreatePatientInput,
  GetPatientInput,
  ListPatientsInput,
  UpdatePatientInput,
} from "@/lib/patients/validation";
import type {
  PatientListResult,
  PatientRecord,
} from "@/lib/patients/queries";

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

function toActionError(error: unknown) {
  if (error instanceof AuthenticationError) {
    return "Debes iniciar sesion para continuar.";
  }

  if (error instanceof PatientAlreadyExistsError) {
    return "Ya existe un paciente con ese documento en este consultorio.";
  }

  if (error instanceof z.ZodError) {
    return "Revisa los datos del paciente e intenta de nuevo.";
  }

  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

export async function createPatientAction(
  input: CreatePatientInput,
): Promise<ActionResult<PatientRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const patient = await createPatientForClinic(clinicId, input);

    return {
      ok: true,
      data: patient,
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

export async function listPatientsAction(
  input?: ListPatientsInput,
): Promise<ActionResult<PatientListResult>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const result = await listPatientsForClinic(clinicId, input);

    return {
      ok: true,
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

export async function getPatientAction(
  input: GetPatientInput,
): Promise<ActionResult<PatientRecord | null>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const patient = await getPatientForClinic(clinicId, input);

    return {
      ok: true,
      data: patient,
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

export async function updatePatientAction(
  input: UpdatePatientInput,
): Promise<ActionResult<PatientRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const patient = await updatePatientForClinic(clinicId, input);

    return { ok: true, data: patient };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}
