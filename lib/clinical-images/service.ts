import { prisma } from "@/lib/prisma";
import {
  getImageById,
  listImagesByClinic,
  imageSelect,
  serializeImage,
  type ImageRecord,
  type ImageListResult,
} from "./queries";
import {
  createImageSchema,
  imageIdSchema,
  type CreateImageRawInput,
  type ListImagesInput,
} from "./validation";

export class ImageNotFoundError extends Error {
  constructor() {
    super("Image not found in this clinic.");
    this.name = "ImageNotFoundError";
  }
}

async function assertPatientBelongsToClinic(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId, isActive: true },
    select: { id: true },
  });
  if (!patient) throw new Error("Patient does not belong to this clinic.");
}

export async function createImageForClinic(
  clinicId: string,
  uploadedBy: string,
  input: CreateImageRawInput,
): Promise<ImageRecord> {
  const parsed = createImageSchema.parse(input);
  await assertPatientBelongsToClinic(clinicId, parsed.patientId);

  if (parsed.treatmentId) {
    const treatment = await prisma.treatment.findFirst({
      where: { id: parsed.treatmentId, clinicId },
      select: { id: true },
    });
    if (!treatment) throw new Error("Treatment does not belong to this clinic.");
  }

  const record = await prisma.clinicalImage.create({
    data: {
      clinicId,
      uploadedBy,
      patientId: parsed.patientId,
      treatmentId: parsed.treatmentId ?? null,
      url: parsed.url,
      type: parsed.type,
      description: parsed.description ?? null,
      takenAt: parsed.takenAt ?? null,
    },
    select: imageSelect,
  });
  return serializeImage(record);
}

export async function deleteImageForClinic(
  clinicId: string,
  id: string,
): Promise<void> {
  const { id: validId } = imageIdSchema.parse({ id });
  const existing = await getImageById(clinicId, validId);
  if (!existing) throw new ImageNotFoundError();

  await prisma.clinicalImage.deleteMany({
    where: { id: validId, clinicId },
  });
}

export async function listImagesForClinic(
  clinicId: string,
  input?: ListImagesInput,
): Promise<ImageListResult> {
  return listImagesByClinic(clinicId, input);
}
