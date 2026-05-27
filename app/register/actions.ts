"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type RegisterState = {
  error?: string;
};

const MIN_PASSWORD_LENGTH = 8;

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getRawFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function createUniqueClinicSlug(clinicName: string) {
  const baseSlug = createSlug(clinicName) || "consultorio";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix =
      attempt === 0
        ? Math.random().toString(36).slice(2, 8)
        : `${Date.now().toString(36)}-${attempt}`;
    const slug = `${baseSlug}-${suffix}`;
    const existingClinic = await prisma.clinic.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingClinic) {
      return slug;
    }
  }

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function registerProfessional(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = getFormValue(formData, "name");
  const clinicName = getFormValue(formData, "clinicName");
  const username = getFormValue(formData, "username").toLowerCase();
  const email = getFormValue(formData, "email").toLowerCase();
  const password = getRawFormValue(formData, "password");

  if (!name || !clinicName || !username || !email || !password) {
    return { error: "Completa todos los campos para crear tu cuenta." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (/\s/.test(username)) {
    return { error: "El usuario no debe contener espacios." };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
    select: {
      username: true,
      email: true,
    },
  });

  if (existingUser?.username === username) {
    return { error: "Ese usuario ya esta registrado." };
  }

  if (existingUser?.email === email) {
    return { error: "Ese correo ya esta registrado." };
  }

  const passwordHash = await hash(password, 12);
  const slug = await createUniqueClinicSlug(clinicName);

  try {
    await prisma.$transaction(async (transaction) => {
      const clinic = await transaction.clinic.create({
        data: {
          name: clinicName,
          slug,
        },
        select: {
          id: true,
        },
      });

      await transaction.user.create({
        data: {
          clinicId: clinic.id,
          username,
          name,
          email,
          passwordHash,
          role: UserRole.professional,
        },
      });
    });
  } catch {
    return {
      error: "No pudimos crear la cuenta. Intentalo de nuevo.",
    };
  }

  redirect("/login?registered=1");
}
