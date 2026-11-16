import { prisma } from "@/lib/prisma";
import {
  getIncomeById,
  getExpenseById,
  getPurchaseById,
  listFinancesByClinic,
  incomeSelect,
  expenseSelect,
  purchaseSelect,
  serializeIncomeRaw,
  serializeExpenseRaw,
  serializePurchaseRaw,
  type IncomeRecord,
  type ExpenseRecord,
  type PurchaseRecord,
  type FinancesListResult,
} from "./queries";
import {
  createIncomeSchema,
  updateIncomeSchema,
  incomeIdSchema,
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdSchema,
  createPurchaseSchema,
  updatePurchaseSchema,
  purchaseIdSchema,
  type CreateIncomeInput,
  type UpdateIncomeInput,
  type CreateExpenseInput,
  type UpdateExpenseInput,
  type CreatePurchaseInput,
  type UpdatePurchaseInput,
  type ListFinancesInput,
} from "./validation";

export class FinanceRecordNotFoundError extends Error {
  constructor(type: string) {
    super(`${type} not found in this clinic.`);
    this.name = "FinanceRecordNotFoundError";
  }
}

async function assertPatientBelongsToClinic(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId, isActive: true },
    select: { id: true },
  });
  if (!patient) throw new Error("Patient does not belong to this clinic.");
}

// --- Income ---

export async function createIncomeForClinic(
  clinicId: string,
  createdBy: string,
  input: CreateIncomeInput,
): Promise<IncomeRecord> {
  const parsed = createIncomeSchema.parse(input);
  if (parsed.patientId) await assertPatientBelongsToClinic(clinicId, parsed.patientId);

  const record = await prisma.income.create({
    data: {
      clinicId,
      createdBy,
      patientId: parsed.patientId ?? null,
      date: parsed.date,
      concept: parsed.concept,
      amount: parsed.amount,
      notes: parsed.notes,
    },
    select: incomeSelect,
  });
  return serializeIncomeRaw(record);
}

export async function updateIncomeForClinic(
  clinicId: string,
  input: UpdateIncomeInput,
): Promise<IncomeRecord> {
  const parsed = updateIncomeSchema.parse(input);
  const { id } = incomeIdSchema.parse({ id: parsed.id });
  const existing = await getIncomeById(clinicId, id);
  if (!existing) throw new FinanceRecordNotFoundError("Income");
  if (parsed.patientId) await assertPatientBelongsToClinic(clinicId, parsed.patientId);

  const result = await prisma.income.updateMany({
    where: { id, clinicId },
    data: {
      patientId: parsed.patientId ?? null,
      date: parsed.date,
      concept: parsed.concept,
      amount: parsed.amount,
      notes: parsed.notes,
    },
  });
  if (result.count !== 1) throw new FinanceRecordNotFoundError("Income");

  const updated = await getIncomeById(clinicId, id);
  if (!updated) throw new FinanceRecordNotFoundError("Income");
  return updated;
}

// --- Expense ---

export async function createExpenseForClinic(
  clinicId: string,
  createdBy: string,
  input: CreateExpenseInput,
): Promise<ExpenseRecord> {
  const parsed = createExpenseSchema.parse(input);

  const record = await prisma.expense.create({
    data: {
      clinicId,
      createdBy,
      date: parsed.date,
      concept: parsed.concept,
      amount: parsed.amount,
      category: parsed.category,
      notes: parsed.notes,
    },
    select: expenseSelect,
  });
  return serializeExpenseRaw(record);
}

export async function updateExpenseForClinic(
  clinicId: string,
  input: UpdateExpenseInput,
): Promise<ExpenseRecord> {
  const parsed = updateExpenseSchema.parse(input);
  const { id } = expenseIdSchema.parse({ id: parsed.id });
  const existing = await getExpenseById(clinicId, id);
  if (!existing) throw new FinanceRecordNotFoundError("Expense");

  const result = await prisma.expense.updateMany({
    where: { id, clinicId },
    data: {
      date: parsed.date,
      concept: parsed.concept,
      amount: parsed.amount,
      category: parsed.category,
      notes: parsed.notes,
    },
  });
  if (result.count !== 1) throw new FinanceRecordNotFoundError("Expense");

  const updated = await getExpenseById(clinicId, id);
  if (!updated) throw new FinanceRecordNotFoundError("Expense");
  return updated;
}

// --- Purchase ---

export async function createPurchaseForClinic(
  clinicId: string,
  createdBy: string,
  input: CreatePurchaseInput,
): Promise<PurchaseRecord> {
  const parsed = createPurchaseSchema.parse(input);

  const record = await prisma.purchase.create({
    data: {
      clinicId,
      createdBy,
      date: parsed.date,
      supplier: parsed.supplier,
      description: parsed.description,
      amount: parsed.amount,
      notes: parsed.notes,
    },
    select: purchaseSelect,
  });
  return serializePurchaseRaw(record);
}

export async function updatePurchaseForClinic(
  clinicId: string,
  input: UpdatePurchaseInput,
): Promise<PurchaseRecord> {
  const parsed = updatePurchaseSchema.parse(input);
  const { id } = purchaseIdSchema.parse({ id: parsed.id });
  const existing = await getPurchaseById(clinicId, id);
  if (!existing) throw new FinanceRecordNotFoundError("Purchase");

  const result = await prisma.purchase.updateMany({
    where: { id, clinicId },
    data: {
      date: parsed.date,
      supplier: parsed.supplier,
      description: parsed.description,
      amount: parsed.amount,
      notes: parsed.notes,
    },
  });
  if (result.count !== 1) throw new FinanceRecordNotFoundError("Purchase");

  const updated = await getPurchaseById(clinicId, id);
  if (!updated) throw new FinanceRecordNotFoundError("Purchase");
  return updated;
}

// --- List ---

export async function listFinancesForClinic(
  clinicId: string,
  input?: ListFinancesInput,
): Promise<FinancesListResult> {
  return listFinancesByClinic(clinicId, input);
}
