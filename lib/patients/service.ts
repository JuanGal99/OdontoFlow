import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getPatientById,
  listPatientsByClinic,
  type PatientListResult,
  type PatientRecord,
} from "@/lib/patients/queries";
import {
  createPatientSchema,
  type CreatePatientInput,
  type GetPatientInput,
  type ListPatientsInput,
  type UpdatePatientInput,
  updatePatientSchema,
} from "@/lib/patients/validation";

export class PatientAlreadyExistsError extends Error {
  constructor() {
    super("A patient with this document already exists in this clinic.");
    this.name = "PatientAlreadyExistsError";
  }
}

export async function createPatientForClinic(
  clinicId: string,
  input: CreatePatientInput,
): Promise<PatientRecord> {
  const parsedInput = createPatientSchema.parse(input);

  try {
    return await prisma.patient.create({
      data: {
        clinicId,
        documentType: parsedInput.documentType,
        documentNumber: parsedInput.documentNumber,
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        phone: parsedInput.phone,
        email: parsedInput.email,
        notes: parsedInput.notes,
      },
      select: {
        id: true,
        clinicId: true,
        documentType: true,
        documentNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new PatientAlreadyExistsError();
    }

    throw error;
  }
}

export async function listPatientsForClinic(
  clinicId: string,
  input?: ListPatientsInput,
): Promise<PatientListResult> {
  return listPatientsByClinic(clinicId, input);
}

export async function getPatientForClinic(
  clinicId: string,
  input: GetPatientInput,
): Promise<PatientRecord | null> {
  return getPatientById(clinicId, input);
}

export async function updatePatientForClinic(
  clinicId: string,
  input: UpdatePatientInput,
): Promise<PatientRecord> {
  const parsedInput = updatePatientSchema.parse(input);
  const existingPatient = await getPatientById(clinicId, { id: parsedInput.id });

  if (!existingPatient) {
    throw new Error("Patient not found in this clinic.");
  }

  try {
    const updateResult = await prisma.patient.updateMany({
      where: { id: parsedInput.id, clinicId },
      data: {
        documentType: parsedInput.documentType,
        documentNumber: parsedInput.documentNumber,
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        phone: parsedInput.phone,
        email: parsedInput.email,
        notes: parsedInput.notes,
        isActive: parsedInput.isActive ?? existingPatient.isActive,
      },
    });

    if (updateResult.count !== 1) {
      throw new Error("Patient not found in this clinic.");
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new PatientAlreadyExistsError();
    }

    throw error;
  }

  const updatedPatient = await getPatientById(clinicId, { id: parsedInput.id });

  if (!updatedPatient) {
    throw new Error("Patient not found in this clinic.");
  }

  return updatedPatient;
}
