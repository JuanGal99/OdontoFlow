import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listFinancesSchema, type ListFinancesInput } from "./validation";

const incomeSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  date: true,
  concept: true,
  amount: true,
  notes: true,
  createdBy: true,
  createdAt: true,
  patient: { select: { id: true, firstName: true, lastName: true } },
  creator: { select: { id: true, name: true, username: true } },
} satisfies Prisma.IncomeSelect;

const expenseSelect = {
  id: true,
  clinicId: true,
  date: true,
  concept: true,
  amount: true,
  category: true,
  notes: true,
  createdBy: true,
  createdAt: true,
  creator: { select: { id: true, name: true, username: true } },
} satisfies Prisma.ExpenseSelect;

const purchaseSelect = {
  id: true,
  clinicId: true,
  date: true,
  supplier: true,
  description: true,
  amount: true,
  notes: true,
  createdBy: true,
  createdAt: true,
  creator: { select: { id: true, name: true, username: true } },
} satisfies Prisma.PurchaseSelect;

type RawIncomeRecord = Prisma.IncomeGetPayload<{ select: typeof incomeSelect }>;
type RawExpenseRecord = Prisma.ExpenseGetPayload<{ select: typeof expenseSelect }>;
type RawPurchaseRecord = Prisma.PurchaseGetPayload<{ select: typeof purchaseSelect }>;

export type IncomeRecord = Omit<RawIncomeRecord, "amount" | "date" | "createdAt"> & {
  amount: number;
  date: string;
  createdAt: string;
};
export type ExpenseRecord = Omit<RawExpenseRecord, "amount" | "date" | "createdAt"> & {
  amount: number;
  date: string;
  createdAt: string;
};
export type PurchaseRecord = Omit<RawPurchaseRecord, "amount" | "date" | "createdAt"> & {
  amount: number;
  date: string;
  createdAt: string;
};

export function serializeIncomeRaw(r: RawIncomeRecord): IncomeRecord {
  return { ...r, amount: Number(r.amount), date: r.date.toISOString(), createdAt: r.createdAt.toISOString() };
}
export function serializeExpenseRaw(r: RawExpenseRecord): ExpenseRecord {
  return { ...r, amount: Number(r.amount), date: r.date.toISOString(), createdAt: r.createdAt.toISOString() };
}
export function serializePurchaseRaw(r: RawPurchaseRecord): PurchaseRecord {
  return { ...r, amount: Number(r.amount), date: r.date.toISOString(), createdAt: r.createdAt.toISOString() };
}

export type FinancesListResult = {
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  purchases: PurchaseRecord[];
  totalIncome: number;
  totalExpenses: number;
  totalPurchases: number;
};

function buildDateRange(input: { from?: Date; to?: Date }) {
  if (!input.from && !input.to) return undefined;
  return {
    ...(input.from ? { gte: input.from } : {}),
    ...(input.to ? { lte: input.to } : {}),
  };
}

export async function listFinancesByClinic(
  clinicId: string,
  input: ListFinancesInput = {},
): Promise<FinancesListResult> {
  const parsed = listFinancesSchema.parse(input);
  const dateRange = buildDateRange(parsed);

  const incomeWhere: Prisma.IncomeWhereInput = { clinicId, ...(dateRange ? { date: dateRange } : {}) };
  const expenseWhere: Prisma.ExpenseWhereInput = { clinicId, ...(dateRange ? { date: dateRange } : {}) };
  const purchaseWhere: Prisma.PurchaseWhereInput = { clinicId, ...(dateRange ? { date: dateRange } : {}) };

  const [income, expenses, purchases, incomeAgg, expenseAgg, purchaseAgg] = await prisma.$transaction([
    prisma.income.findMany({
      where: incomeWhere,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: parsed.pageSize,
      skip: (parsed.page - 1) * parsed.pageSize,
      select: incomeSelect,
    }),
    prisma.expense.findMany({
      where: expenseWhere,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: parsed.pageSize,
      skip: (parsed.page - 1) * parsed.pageSize,
      select: expenseSelect,
    }),
    prisma.purchase.findMany({
      where: purchaseWhere,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: parsed.pageSize,
      skip: (parsed.page - 1) * parsed.pageSize,
      select: purchaseSelect,
    }),
    prisma.income.aggregate({ where: incomeWhere, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
    prisma.purchase.aggregate({ where: purchaseWhere, _sum: { amount: true } }),
  ]);

  return {
    income: income.map(serializeIncomeRaw),
    expenses: expenses.map(serializeExpenseRaw),
    purchases: purchases.map(serializePurchaseRaw),
    totalIncome: Number(incomeAgg._sum.amount ?? 0),
    totalExpenses: Number(expenseAgg._sum.amount ?? 0),
    totalPurchases: Number(purchaseAgg._sum.amount ?? 0),
  };
}

export async function getIncomeById(clinicId: string, id: string): Promise<IncomeRecord | null> {
  const r = await prisma.income.findFirst({ where: { id, clinicId }, select: incomeSelect });
  return r ? serializeIncomeRaw(r) : null;
}

export async function getExpenseById(clinicId: string, id: string): Promise<ExpenseRecord | null> {
  const r = await prisma.expense.findFirst({ where: { id, clinicId }, select: expenseSelect });
  return r ? serializeExpenseRaw(r) : null;
}

export async function getPurchaseById(clinicId: string, id: string): Promise<PurchaseRecord | null> {
  const r = await prisma.purchase.findFirst({ where: { id, clinicId }, select: purchaseSelect });
  return r ? serializePurchaseRaw(r) : null;
}

export { incomeSelect, expenseSelect, purchaseSelect };
