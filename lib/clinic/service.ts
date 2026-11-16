import { prisma } from "@/lib/prisma";
import { getClinicById, type ClinicRecord } from "./queries";
import { updateClinicSchema, type UpdateClinicInput } from "./validation";

export class ClinicNotFoundError extends Error {
  constructor() {
    super("Clinic not found.");
    this.name = "ClinicNotFoundError";
  }
}

export async function getClinicForUser(
  clinicId: string,
): Promise<ClinicRecord> {
  const clinic = await getClinicById(clinicId);
  if (!clinic) throw new ClinicNotFoundError();
  return clinic;
}

export async function updateClinicSettings(
  clinicId: string,
  input: UpdateClinicInput,
): Promise<ClinicRecord> {
  const parsed = updateClinicSchema.parse(input);

  const existing = await getClinicById(clinicId);
  if (!existing) throw new ClinicNotFoundError();

  await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      name: parsed.name,
      phone: parsed.phone ?? null,
      email: parsed.email ?? null,
      address: parsed.address ?? null,
    },
  });

  const updated = await getClinicById(clinicId);
  if (!updated) throw new ClinicNotFoundError();
  return updated;
}
