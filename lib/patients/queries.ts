import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listPatientsSchema, patientIdSchema } from "@/lib/patients/validation";
import type {
  GetPatientInput,
  ListPatientsInput,
} from "@/lib/patients/validation";

const patientSelect = {
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
} satisfies Prisma.PatientSelect;

export type PatientRecord = Prisma.PatientGetPayload<{
  select: typeof patientSelect;
}>;

export type PatientListResult = {
  patients: PatientRecord[];
  total: number;
  page: number;
  pageSize: number;
};

function buildPatientSearchWhere(
  clinicId: string,
  input: ReturnType<typeof listPatientsSchema.parse>,
): Prisma.PatientWhereInput {
  const where: Prisma.PatientWhereInput = {
    clinicId,
    isActive: input.isActive,
  };

  if (!input.search) {
    return where;
  }

  where.OR = [
    { firstName: { contains: input.search, mode: "insensitive" } },
    { lastName: { contains: input.search, mode: "insensitive" } },
    { documentNumber: { contains: input.search, mode: "insensitive" } },
    { phone: { contains: input.search, mode: "insensitive" } },
    { email: { contains: input.search, mode: "insensitive" } },
  ];

  return where;
}

export async function listPatientsByClinic(
  clinicId: string,
  input: ListPatientsInput = {},
): Promise<PatientListResult> {
  const parsedInput = listPatientsSchema.parse(input);
  const where = buildPatientSearchWhere(clinicId, parsedInput);

  const [patients, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (parsedInput.page - 1) * parsedInput.pageSize,
      take: parsedInput.pageSize,
      select: patientSelect,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    patients,
    total,
    page: parsedInput.page,
    pageSize: parsedInput.pageSize,
  };
}

export async function getPatientById(
  clinicId: string,
  input: GetPatientInput,
): Promise<PatientRecord | null> {
  const { id } = patientIdSchema.parse(input);

  return prisma.patient.findFirst({
    where: {
      id,
      clinicId,
    },
    select: patientSelect,
  });
}
