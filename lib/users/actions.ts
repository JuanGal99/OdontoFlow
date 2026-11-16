"use server";

import { z } from "zod";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import {
  createAuxiliaryUser,
  updateAuxiliaryUser,
  resetAuxiliaryUserPassword,
  toggleAuxiliaryUserActive,
  listUsersForClinic,
  UserAlreadyExistsError,
  UserNotFoundError,
  CannotModifySelfError,
} from "@/lib/users/service";
import type {
  CreateUserInput,
  UpdateUserInput,
  ResetPasswordInput,
} from "@/lib/users/validation";
import type { ListUsersInput } from "@/lib/users/validation";
import type { UserRecord, UserListResult } from "@/lib/users/queries";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toActionError(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return "Debes iniciar sesion para continuar.";
  }
  if (error instanceof CannotModifySelfError) {
    return "No puedes modificar tu propia cuenta desde este panel.";
  }
  if (error instanceof UserNotFoundError) {
    return "El usuario no fue encontrado en este consultorio.";
  }
  if (error instanceof UserAlreadyExistsError) {
    return error.field === "username"
      ? "Ese nombre de usuario ya esta registrado."
      : "Ese correo ya esta registrado.";
  }
  if (error instanceof z.ZodError) {
    return "Revisa los datos del usuario e intenta de nuevo.";
  }
  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

function assertProfessional(role: string) {
  if (role !== "professional") {
    throw new AuthenticationError("Solo los profesionales pueden gestionar usuarios.");
  }
}

export async function createUserAction(
  input: CreateUserInput,
): Promise<ActionResult<UserRecord>> {
  try {
    const { clinicId, role } = await getAuthenticatedSessionContext();
    assertProfessional(role);
    const user = await createAuxiliaryUser(clinicId, input);
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updateUserAction(
  input: UpdateUserInput,
): Promise<ActionResult<UserRecord>> {
  try {
    const { clinicId, userId, role } = await getAuthenticatedSessionContext();
    assertProfessional(role);
    const user = await updateAuxiliaryUser(clinicId, userId, input);
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<ActionResult<null>> {
  try {
    const { clinicId, userId, role } = await getAuthenticatedSessionContext();
    assertProfessional(role);
    await resetAuxiliaryUserPassword(clinicId, userId, input);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function toggleUserActiveAction(
  id: string,
): Promise<ActionResult<UserRecord>> {
  try {
    const { clinicId, userId, role } = await getAuthenticatedSessionContext();
    assertProfessional(role);
    const user = await toggleAuxiliaryUserActive(clinicId, userId, id);
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function listUsersAction(
  input?: ListUsersInput,
): Promise<ActionResult<UserListResult>> {
  try {
    const { clinicId, role } = await getAuthenticatedSessionContext();
    assertProfessional(role);
    const result = await listUsersForClinic(clinicId, input);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}
