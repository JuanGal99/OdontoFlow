import { z } from "zod";

import { TreatmentStatus } from "@/lib/generated/prisma/enums";

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

export const treatmentIdSchema = z.object({ id: z.uuid() });

const treatmentFields = z.object({
  patientId: z.uuid(),
  name: z.string().trim().min(1).max(255),
  description: optionalTrimmedString(2_000),
  tooth: optionalTrimmedString(32),
  status: z.enum(TreatmentStatus).optional().default(TreatmentStatus.planificado),
  startedAt: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  notes: optionalTrimmedString(2_000),
});

export const createTreatmentSchema = treatmentFields.refine(
  (value) => !value.completedAt || !value.startedAt || value.completedAt >= value.startedAt,
  { message: "completedAt must be after startedAt.", path: ["completedAt"] },
);

export const updateTreatmentSchema = treatmentIdSchema.and(createTreatmentSchema);

export type CreateTreatmentInput = z.input<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.input<typeof updateTreatmentSchema>;
