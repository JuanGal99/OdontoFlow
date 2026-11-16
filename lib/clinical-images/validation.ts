import { z } from "zod";

export const imageIdSchema = z.object({
  id: z.uuid(),
});

export const createImageSchema = z.object({
  patientId: z.uuid(),
  treatmentId: z.uuid().nullable().optional(),
  url: z.string().min(1).max(500),
  type: z.enum(["imagen", "radiografia"]),
  description: z
    .preprocess(
      (v) => {
        if (typeof v !== "string") return v;
        const trimmed = v.trim();
        return trimmed.length > 0 ? trimmed : null;
      },
      z.string().max(500).nullable().optional(),
    )
    .optional(),
  takenAt: z
    .preprocess(
      (v) => {
        if (typeof v !== "string" || v.trim() === "") return null;
        return new Date(v);
      },
      z.date().nullable().optional(),
    )
    .optional(),
});

export const listImagesSchema = z.object({
  patientId: z.uuid().optional(),
  treatmentId: z.uuid().optional(),
  type: z.enum(["imagen", "radiografia"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateImageInput = z.infer<typeof createImageSchema>;
export type CreateImageRawInput = z.input<typeof createImageSchema>;
export type ListImagesInput = z.input<typeof listImagesSchema>;
