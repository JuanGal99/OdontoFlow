"use server";

import { z } from "zod";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import {
  AppointmentNotFoundError,
  AppointmentPatientMismatchError,
  createAppointmentForClinic,
  getAppointmentForClinic,
  listAppointmentsForClinic,
  updateAppointmentForClinic,
} from "@/lib/appointments/service";
import type {
  CreateAppointmentInput,
  GetAppointmentInput,
  ListAppointmentsInput,
  UpdateAppointmentInput,
} from "@/lib/appointments/validation";
import type {
  AppointmentListResult,
  AppointmentRecord,
} from "@/lib/appointments/queries";

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

  if (error instanceof AppointmentPatientMismatchError) {
    return "El paciente seleccionado no pertenece a este consultorio.";
  }

  if (error instanceof AppointmentNotFoundError) {
    return "No encontramos esa cita en este consultorio.";
  }

  if (error instanceof z.ZodError) {
    return "Revisa los datos de la cita e intenta de nuevo.";
  }

  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

export async function createAppointmentAction(
  input: CreateAppointmentInput,
): Promise<ActionResult<AppointmentRecord>> {
  try {
    const { clinicId, userId } = await getAuthenticatedSessionContext();
    const appointment = await createAppointmentForClinic(clinicId, userId, input);

    return {
      ok: true,
      data: appointment,
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

export async function listAppointmentsAction(
  input?: ListAppointmentsInput,
): Promise<ActionResult<AppointmentListResult>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const result = await listAppointmentsForClinic(clinicId, input);

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

export async function getAppointmentAction(
  input: GetAppointmentInput,
): Promise<ActionResult<AppointmentRecord | null>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const appointment = await getAppointmentForClinic(clinicId, input);

    return {
      ok: true,
      data: appointment,
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

export async function updateAppointmentAction(
  input: UpdateAppointmentInput,
): Promise<ActionResult<AppointmentRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const appointment = await updateAppointmentForClinic(clinicId, input);

    return {
      ok: true,
      data: appointment,
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}
