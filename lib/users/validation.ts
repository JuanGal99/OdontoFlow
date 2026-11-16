import { z } from "zod";

export const userIdSchema = z.object({
  id: z.uuid(),
});

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .transform((v) => v.toLowerCase())
    .refine((v) => !/\s/.test(v), "Username must not contain spaces"),
  name: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .email()
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const updateUserSchema = userIdSchema.and(
  z.object({
    name: z.string().trim().min(1).max(100),
    email: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .email()
      .transform((v) => v.toLowerCase()),
    isActive: z.boolean().optional(),
  }),
);

export const resetPasswordSchema = userIdSchema.and(
  z.object({
    password: z.string().min(8).max(128),
  }),
);

export const listUsersSchema = z.object({
  search: z
    .preprocess(
      (v) => {
        if (typeof v !== "string") return v;
        const trimmed = v.trim();
        return trimmed.length > 0 ? trimmed : null;
      },
      z.string().max(100).nullable().optional(),
    )
    .optional(),
  isActive: z.boolean().optional().default(true),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.input<typeof updateUserSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type ListUsersInput = z.input<typeof listUsersSchema>;
