import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    },
    z.string().max(maxLength).nullable().optional(),
  );

const amountSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, "").trim();
      return cleaned.length > 0 ? Number(cleaned) : undefined;
    }
    return value;
  },
  z.number().positive("El monto debe ser mayor a cero.").max(999_999_999_999),
);

export const incomeIdSchema = z.object({ id: z.uuid() });

export const createIncomeSchema = z.object({
  patientId: z.uuid().nullable().optional(),
  date: z.coerce.date(),
  concept: z.string().trim().min(1).max(255),
  amount: amountSchema,
  notes: optionalTrimmedString(2_000),
});

export const updateIncomeSchema = incomeIdSchema.and(createIncomeSchema);

export const expenseIdSchema = z.object({ id: z.uuid() });

export const createExpenseSchema = z.object({
  date: z.coerce.date(),
  concept: z.string().trim().min(1).max(255),
  amount: amountSchema,
  category: optionalTrimmedString(100),
  notes: optionalTrimmedString(2_000),
});

export const updateExpenseSchema = expenseIdSchema.and(createExpenseSchema);

export const purchaseIdSchema = z.object({ id: z.uuid() });

export const createPurchaseSchema = z.object({
  date: z.coerce.date(),
  supplier: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(500),
  amount: amountSchema,
  notes: optionalTrimmedString(2_000),
});

export const updatePurchaseSchema = purchaseIdSchema.and(createPurchaseSchema);

export const listFinancesSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateIncomeInput = z.input<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.input<typeof updateIncomeSchema>;
export type CreateExpenseInput = z.input<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.input<typeof updateExpenseSchema>;
export type CreatePurchaseInput = z.input<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.input<typeof updatePurchaseSchema>;
export type ListFinancesInput = z.input<typeof listFinancesSchema>;
