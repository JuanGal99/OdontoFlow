"use server";

import { z } from "zod";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import {
  createImageForClinic,
  deleteImageForClinic,
  listImagesForClinic,
  ImageNotFoundError,
} from "./service";
import type { CreateImageRawInput, ListImagesInput } from "./validation";
import type { ImageRecord, ImageListResult } from "./queries";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toActionError(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return "Debes iniciar sesion para continuar.";
  }
  if (error instanceof ImageNotFoundError) {
    return "La imagen no fue encontrada en este consultorio.";
  }
  if (error instanceof z.ZodError) {
    return "Revisa los datos e intenta de nuevo.";
  }
  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

export async function createImageAction(
  input: CreateImageRawInput,
): Promise<ActionResult<ImageRecord>> {
  try {
    const { clinicId, userId } = await getAuthenticatedSessionContext();
    const image = await createImageForClinic(clinicId, userId, input);
    return { ok: true, data: image };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function deleteImageAction(
  id: string,
): Promise<ActionResult<null>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    await deleteImageForClinic(clinicId, id);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function listImagesAction(
  input?: ListImagesInput,
): Promise<ActionResult<ImageListResult>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const result = await listImagesForClinic(clinicId, input);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}
