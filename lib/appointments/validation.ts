import { z } from "zod";

import { AppointmentStatus } from "@/lib/generated/prisma/enums";

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

const appointmentStatusSchema = z.enum(AppointmentStatus);

const appointmentDateRangeSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  })
  .refine((value) => value.endAt > value.startAt, {
    message: "endAt must be after startAt.",
    path: ["endAt"],
  });

export const appointmentIdSchema = z.object({
  id: z.uuid(),
});

export const createAppointmentSchema = z
  .object({
    patientId: z.uuid(),
    title: z.string().trim().min(1).max(255),
    status: appointmentStatusSchema.optional().default(AppointmentStatus.programada),
    notes: optionalTrimmedString(2_000),
  })
  .and(appointmentDateRangeSchema);

export const updateAppointmentSchema = appointmentIdSchema.and(
  z
    .object({
      patientId: z.uuid().optional(),
      title: z.string().trim().min(1).max(255).optional(),
      startAt: z.coerce.date().optional(),
      endAt: z.coerce.date().optional(),
      status: appointmentStatusSchema.optional(),
      notes: optionalTrimmedString(2_000),
    })
    .refine(
      (value) => {
        if (!value.startAt || !value.endAt) {
          return true;
        }

        return value.endAt > value.startAt;
      },
      {
        message: "endAt must be after startAt.",
        path: ["endAt"],
      },
    ),
);

export const listAppointmentsSchema = z
  .object({
    patientId: z.uuid().optional(),
    status: appointmentStatusSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .refine(
    (value) => {
      if (!value.from || !value.to) {
        return true;
      }

      return value.to >= value.from;
    },
    {
      message: "to must be equal to or after from.",
      path: ["to"],
    },
  );

export type CreateAppointmentInput = z.input<typeof createAppointmentSchema>;
export type GetAppointmentInput = z.infer<typeof appointmentIdSchema>;
export type ListAppointmentsInput = z.input<typeof listAppointmentsSchema>;
export type UpdateAppointmentInput = z.input<typeof updateAppointmentSchema>;
