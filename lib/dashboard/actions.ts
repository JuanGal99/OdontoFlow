"use server";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import { getDashboardData, type DashboardData } from "./queries";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getDashboardAction(): Promise<ActionResult<DashboardData>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    const data = await getDashboardData(clinicId);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { ok: false, error: "Debes iniciar sesion para continuar." };
    }
    return { ok: false, error: "No pudimos cargar el dashboard." };
  }
}
