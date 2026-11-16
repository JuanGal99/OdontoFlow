"use server";

import { z } from "zod";

import {
  AuthenticationError,
  getAuthenticatedSessionContext,
} from "@/lib/auth/session";
import {
  createExpenseForClinic,
  createIncomeForClinic,
  createPurchaseForClinic,
  FinanceRecordNotFoundError,
  listFinancesForClinic,
  updateExpenseForClinic,
  updateIncomeForClinic,
  updatePurchaseForClinic,
} from "./service";
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  CreatePurchaseInput,
  ListFinancesInput,
  UpdateExpenseInput,
  UpdateIncomeInput,
  UpdatePurchaseInput,
} from "./validation";
import type {
  ExpenseRecord,
  FinancesListResult,
  IncomeRecord,
  PurchaseRecord,
} from "./queries";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toActionError(error: unknown): string {
  if (error instanceof AuthenticationError) return "Debes iniciar sesion para continuar.";
  if (error instanceof FinanceRecordNotFoundError) return "No encontramos ese registro en este consultorio.";
  if (error instanceof z.ZodError) return "Revisa los datos e intenta de nuevo.";
  return "No pudimos completar la operacion. Intentalo de nuevo.";
}

// --- Income ---

export async function createIncomeAction(
  input: CreateIncomeInput,
): Promise<ActionResult<IncomeRecord>> {
  try {
    const { clinicId, userId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await createIncomeForClinic(clinicId, userId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updateIncomeAction(
  input: UpdateIncomeInput,
): Promise<ActionResult<IncomeRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await updateIncomeForClinic(clinicId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

// --- Expense ---

export async function createExpenseAction(
  input: CreateExpenseInput,
): Promise<ActionResult<ExpenseRecord>> {
  try {
    const { clinicId, userId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await createExpenseForClinic(clinicId, userId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updateExpenseAction(
  input: UpdateExpenseInput,
): Promise<ActionResult<ExpenseRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await updateExpenseForClinic(clinicId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

// --- Purchase ---

export async function createPurchaseAction(
  input: CreatePurchaseInput,
): Promise<ActionResult<PurchaseRecord>> {
  try {
    const { clinicId, userId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await createPurchaseForClinic(clinicId, userId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updatePurchaseAction(
  input: UpdatePurchaseInput,
): Promise<ActionResult<PurchaseRecord>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await updatePurchaseForClinic(clinicId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

// --- List ---

export async function listFinancesAction(
  input?: ListFinancesInput,
): Promise<ActionResult<FinancesListResult>> {
  try {
    const { clinicId } = await getAuthenticatedSessionContext();
    return { ok: true, data: await listFinancesForClinic(clinicId, input) };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}
