import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const treatmentSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  name: true,
  description: true,
  tooth: true,
  status: true,
  startedAt: true,
  completedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  patient: { select: { id: true, firstName: true, lastName: true, documentNumber: true } },
} satisfies Prisma.TreatmentSelect;

export type TreatmentRecord = Prisma.TreatmentGetPayload<{ select: typeof treatmentSelect }>;

export async function listTreatmentsByClinic(clinicId: string): Promise<TreatmentRecord[]> {
  return prisma.treatment.findMany({
    where: { clinicId },
    orderBy: [{ updatedAt: "desc" }],
    select: treatmentSelect,
  });
}

export async function getTreatmentById(clinicId: string, id: string): Promise<TreatmentRecord | null> {
  return prisma.treatment.findFirst({ where: { id, clinicId }, select: treatmentSelect });
}

export { treatmentSelect };
