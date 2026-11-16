import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listImagesSchema, type ListImagesInput } from "./validation";

const imageSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  treatmentId: true,
  url: true,
  type: true,
  description: true,
  takenAt: true,
  uploadedBy: true,
  createdAt: true,
  patient: { select: { id: true, firstName: true, lastName: true } },
  treatment: { select: { id: true, name: true } },
  uploader: { select: { id: true, name: true, username: true } },
} satisfies Prisma.ClinicalImageSelect;

type RawImageRecord = Prisma.ClinicalImageGetPayload<{
  select: typeof imageSelect;
}>;

export type ImageRecord = Omit<RawImageRecord, "takenAt" | "createdAt"> & {
  takenAt: string | null;
  createdAt: string;
};

export type ImageListResult = {
  images: ImageRecord[];
  total: number;
  page: number;
  pageSize: number;
};

function serializeImage(r: RawImageRecord): ImageRecord {
  return {
    ...r,
    takenAt: r.takenAt ? r.takenAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listImagesByClinic(
  clinicId: string,
  input: ListImagesInput = {},
): Promise<ImageListResult> {
  const parsed = listImagesSchema.parse(input);

  const where: Prisma.ClinicalImageWhereInput = { clinicId };
  if (parsed.patientId) where.patientId = parsed.patientId;
  if (parsed.treatmentId) where.treatmentId = parsed.treatmentId;
  if (parsed.type) where.type = parsed.type;

  const [images, total] = await prisma.$transaction([
    prisma.clinicalImage.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
      select: imageSelect,
    }),
    prisma.clinicalImage.count({ where }),
  ]);

  return {
    images: images.map(serializeImage),
    total,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
}

export async function getImageById(
  clinicId: string,
  id: string,
): Promise<ImageRecord | null> {
  const r = await prisma.clinicalImage.findFirst({
    where: { id, clinicId },
    select: imageSelect,
  });
  return r ? serializeImage(r) : null;
}

export { imageSelect, serializeImage };
