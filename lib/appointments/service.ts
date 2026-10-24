import { prisma } from "@/lib/prisma";
import {
  appointmentSelect,
  getAppointmentById,
  listAppointmentsByClinic,
  type AppointmentListResult,
  type AppointmentRecord,
} from "@/lib/appointments/queries";
import {
  appointmentIdSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  type CreateAppointmentInput,
  type GetAppointmentInput,
  type ListAppointmentsInput,
  type UpdateAppointmentInput,
} from "@/lib/appointments/validation";

export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found in this clinic.");
    this.name = "AppointmentNotFoundError";
  }
}

export class AppointmentPatientMismatchError extends Error {
  constructor() {
    super("Patient does not belong to this clinic.");
    this.name = "AppointmentPatientMismatchError";
  }
}

async function assertPatientBelongsToClinic(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId,
    },
    select: {
      id: true,
    },
  });

  if (!patient) {
    throw new AppointmentPatientMismatchError();
  }
}

async function assertUserBelongsToClinic(clinicId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      clinicId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppointmentPatientMismatchError();
  }
}

export async function createAppointmentForClinic(
  clinicId: string,
  createdBy: string,
  input: CreateAppointmentInput,
): Promise<AppointmentRecord> {
  const parsedInput = createAppointmentSchema.parse(input);

  await assertPatientBelongsToClinic(clinicId, parsedInput.patientId);
  await assertUserBelongsToClinic(clinicId, createdBy);

  return prisma.appointment.create({
    data: {
      clinicId,
      patientId: parsedInput.patientId,
      createdBy,
      title: parsedInput.title,
      startAt: parsedInput.startAt,
      endAt: parsedInput.endAt,
      status: parsedInput.status,
      notes: parsedInput.notes,
    },
    select: appointmentSelect,
  });
}

export async function listAppointmentsForClinic(
  clinicId: string,
  input?: ListAppointmentsInput,
): Promise<AppointmentListResult> {
  return listAppointmentsByClinic(clinicId, input);
}

export async function getAppointmentForClinic(
  clinicId: string,
  input: GetAppointmentInput,
): Promise<AppointmentRecord | null> {
  return getAppointmentById(clinicId, input);
}

export async function updateAppointmentForClinic(
  clinicId: string,
  input: UpdateAppointmentInput,
): Promise<AppointmentRecord> {
  const parsedInput = updateAppointmentSchema.parse(input);
  const { id } = appointmentIdSchema.parse({ id: parsedInput.id });
  const existingAppointment = await getAppointmentById(clinicId, { id });

  if (!existingAppointment) {
    throw new AppointmentNotFoundError();
  }

  const patientId = parsedInput.patientId ?? existingAppointment.patientId;

  await assertPatientBelongsToClinic(clinicId, patientId);

  const startAt = parsedInput.startAt ?? existingAppointment.startAt;
  const endAt = parsedInput.endAt ?? existingAppointment.endAt;

  if (endAt <= startAt) {
    throw new Error("Appointment endAt must be after startAt.");
  }

  const updateResult = await prisma.appointment.updateMany({
    where: {
      id,
      clinicId,
    },
    data: {
      patientId,
      title: parsedInput.title ?? existingAppointment.title,
      startAt,
      endAt,
      status: parsedInput.status ?? existingAppointment.status,
      notes: parsedInput.notes,
    },
  });

  if (updateResult.count !== 1) {
    throw new AppointmentNotFoundError();
  }

  const updatedAppointment = await getAppointmentById(clinicId, { id });

  if (!updatedAppointment) {
    throw new AppointmentNotFoundError();
  }

  return updatedAppointment;
}
