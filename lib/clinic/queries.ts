import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const clinicSelect = {
  id: true,
  name: true,
  slug: true,
  phone: true,
  email: true,
  address: true,
  logoUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      users: true,
      patients: true,
    },
  },
} satisfies Prisma.ClinicSelect;

export type ClinicRecord = Prisma.ClinicGetPayload<{
  select: typeof clinicSelect;
}>;

export async function getClinicById(
  clinicId: string,
): Promise<ClinicRecord | null> {
  return prisma.clinic.findFirst({
    where: { id: clinicId, isActive: true },
    select: clinicSelect,
  });
}
