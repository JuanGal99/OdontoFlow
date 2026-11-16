import { z } from "zod";

export const updateClinicSchema = z.object({
  name: z.string().trim().min(1).max(150),
  phone: z
    .preprocess(
      (v) => {
        if (typeof v !== "string") return v;
        const trimmed = v.trim();
        return trimmed.length > 0 ? trimmed : null;
      },
      z.string().max(32).nullable().optional(),
    )
    .optional(),
  email: z
    .preprocess(
      (v) => {
        if (typeof v !== "string") return v;
        const trimmed = v.trim().toLowerCase();
        return trimmed.length > 0 ? trimmed : null;
      },
      z.email().max(255).nullable().optional(),
    )
    .optional(),
  address: z
    .preprocess(
      (v) => {
        if (typeof v !== "string") return v;
        const trimmed = v.trim();
        return trimmed.length > 0 ? trimmed : null;
      },
      z.string().max(500).nullable().optional(),
    )
    .optional(),
});

export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;
