import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  appointmentIdSchema,
  listAppointmentsSchema,
  type GetAppointmentInput,
  type ListAppointmentsInput,
} from "@/lib/appointments/validation";

const appointmentSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  createdBy: true,
  title: true,
  startAt: true,
  endAt: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      documentType: true,
      documentNumber: true,
      phone: true,
    },
  },
  creator: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

export type AppointmentRecord = Prisma.AppointmentGetPayload<{
  select: typeof appointmentSelect;
}>;

export type AppointmentListResult = {
  appointments: AppointmentRecord[];
  total: number;
  page: number;
  pageSize: number;
};

function buildAppointmentWhere(
  clinicId: string,
  input: ReturnType<typeof listAppointmentsSchema.parse>,
): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = {
    clinicId,
  };

  if (input.patientId) {
    where.patientId = input.patientId;
  }

  if (input.status) {
    where.status = input.status;
  }

  if (input.from || input.to) {
    where.startAt = {
      ...(input.from ? { gte: input.from } : {}),
      ...(input.to ? { lte: input.to } : {}),
    };
  }

  return where;
}

export async function listAppointmentsByClinic(
  clinicId: string,
  input: ListAppointmentsInput = {},
): Promise<AppointmentListResult> {
  const parsedInput = listAppointmentsSchema.parse(input);
  const where = buildAppointmentWhere(clinicId, parsedInput);

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
      skip: (parsedInput.page - 1) * parsedInput.pageSize,
      take: parsedInput.pageSize,
      select: appointmentSelect,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments,
    total,
    page: parsedInput.page,
    pageSize: parsedInput.pageSize,
  };
}

export async function getAppointmentById(
  clinicId: string,
  input: GetAppointmentInput,
): Promise<AppointmentRecord | null> {
  const { id } = appointmentIdSchema.parse(input);

  return prisma.appointment.findFirst({
    where: {
      id,
      clinicId,
    },
    select: appointmentSelect,
  });
}

export { appointmentSelect };
