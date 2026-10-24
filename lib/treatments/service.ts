import { prisma } from "@/lib/prisma";
import { getTreatmentById, listTreatmentsByClinic, treatmentSelect, type TreatmentRecord } from "@/lib/treatments/queries";
import { createTreatmentSchema, treatmentIdSchema, updateTreatmentSchema, type CreateTreatmentInput, type UpdateTreatmentInput } from "@/lib/treatments/validation";

export class TreatmentNotFoundError extends Error {}
export class TreatmentPatientMismatchError extends Error {}

async function assertPatientBelongsToClinic(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isActive: true }, select: { id: true } });
  if (!patient) throw new TreatmentPatientMismatchError();
}

export async function createTreatmentForClinic(clinicId: string, input: CreateTreatmentInput): Promise<TreatmentRecord> {
  const parsedInput = createTreatmentSchema.parse(input);
  await assertPatientBelongsToClinic(clinicId, parsedInput.patientId);
  return prisma.treatment.create({ data: { clinicId, ...parsedInput }, select: treatmentSelect });
}

export async function updateTreatmentForClinic(clinicId: string, input: UpdateTreatmentInput): Promise<TreatmentRecord> {
  const parsedInput = updateTreatmentSchema.parse(input);
  const { id } = treatmentIdSchema.parse({ id: parsedInput.id });
  const treatmentData = {
    patientId: parsedInput.patientId,
    name: parsedInput.name,
    description: parsedInput.description,
    tooth: parsedInput.tooth,
    status: parsedInput.status,
    startedAt: parsedInput.startedAt,
    completedAt: parsedInput.completedAt,
    notes: parsedInput.notes,
  };
  await assertPatientBelongsToClinic(clinicId, parsedInput.patientId);
  const result = await prisma.treatment.updateMany({ where: { id, clinicId }, data: treatmentData });
  if (result.count !== 1) throw new TreatmentNotFoundError();
  const treatment = await getTreatmentById(clinicId, id);
  if (!treatment) throw new TreatmentNotFoundError();
  return treatment;
}

export { getTreatmentById, listTreatmentsByClinic };
