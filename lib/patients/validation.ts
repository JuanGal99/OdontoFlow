import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : null;
    },
    z.string().max(maxLength).nullable().optional(),
  );

export const patientIdSchema = z.object({
  id: z.uuid(),
});

export const createPatientSchema = z.object({
  documentType: z.string().trim().min(1).max(32),
  documentNumber: z.string().trim().min(1).max(64),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: optionalTrimmedString(32),
  email: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmedValue = value.trim().toLowerCase();
      return trimmedValue.length > 0 ? trimmedValue : null;
    },
    z.email().max(255).nullable().optional(),
  ),
  notes: optionalTrimmedString(2_000),
});

export const updatePatientSchema = patientIdSchema.and(
  createPatientSchema.extend({
    isActive: z.boolean().optional(),
  }),
);

export const listPatientsSchema = z.object({
  search: optionalTrimmedString(100),
  isActive: z.boolean().optional().default(true),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type GetPatientInput = z.infer<typeof patientIdSchema>;
export type UpdatePatientInput = z.input<typeof updatePatientSchema>;
export type ListPatientsInput = z.input<typeof listPatientsSchema>;
export type ParsedListPatientsInput = z.infer<typeof listPatientsSchema>;
