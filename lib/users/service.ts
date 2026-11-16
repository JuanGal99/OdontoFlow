import { hash } from "bcryptjs";
import { Prisma } from "@/lib/generated/prisma/client";
import { UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getUserById, listUsersByClinic, type UserRecord, type UserListResult } from "./queries";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userIdSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type ResetPasswordInput,
  type ListUsersInput,
} from "./validation";

export class UserAlreadyExistsError extends Error {
  field: "username" | "email";
  constructor(field: "username" | "email") {
    super(`A user with this ${field} already exists.`);
    this.name = "UserAlreadyExistsError";
    this.field = field;
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found in this clinic.");
    this.name = "UserNotFoundError";
  }
}

export class CannotModifySelfError extends Error {
  constructor() {
    super("Cannot modify your own account from this panel.");
    this.name = "CannotModifySelfError";
  }
}

export async function createAuxiliaryUser(
  clinicId: string,
  input: CreateUserInput,
): Promise<UserRecord> {
  const parsed = createUserSchema.parse(input);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: parsed.username }, { email: parsed.email }],
    },
    select: { username: true, email: true },
  });

  if (existing?.username === parsed.username) {
    throw new UserAlreadyExistsError("username");
  }
  if (existing?.email === parsed.email) {
    throw new UserAlreadyExistsError("email");
  }

  const passwordHash = await hash(parsed.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        clinicId,
        username: parsed.username,
        name: parsed.name,
        email: parsed.email,
        passwordHash,
        role: UserRole.auxiliary,
      },
      select: {
        id: true,
        clinicId: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[]) ?? [];
      throw new UserAlreadyExistsError(
        target.includes("email") ? "email" : "username",
      );
    }
    throw error;
  }
}

export async function updateAuxiliaryUser(
  clinicId: string,
  actingUserId: string,
  input: UpdateUserInput,
): Promise<UserRecord> {
  const parsed = updateUserSchema.parse(input);

  if (parsed.id === actingUserId) {
    throw new CannotModifySelfError();
  }

  const existing = await getUserById(clinicId, parsed.id);
  if (!existing) {
    throw new UserNotFoundError();
  }

  const emailConflict = await prisma.user.findFirst({
    where: {
      email: parsed.email,
      id: { not: parsed.id },
    },
    select: { id: true },
  });
  if (emailConflict) {
    throw new UserAlreadyExistsError("email");
  }

  try {
    const result = await prisma.user.updateMany({
      where: { id: parsed.id, clinicId },
      data: {
        name: parsed.name,
        email: parsed.email,
        isActive: parsed.isActive ?? existing.isActive,
      },
    });

    if (result.count !== 1) {
      throw new UserNotFoundError();
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new UserAlreadyExistsError("email");
    }
    throw error;
  }

  const updated = await getUserById(clinicId, parsed.id);
  if (!updated) throw new UserNotFoundError();
  return updated;
}

export async function resetAuxiliaryUserPassword(
  clinicId: string,
  actingUserId: string,
  input: ResetPasswordInput,
): Promise<void> {
  const parsed = resetPasswordSchema.parse(input);

  if (parsed.id === actingUserId) {
    throw new CannotModifySelfError();
  }

  const existing = await getUserById(clinicId, parsed.id);
  if (!existing) {
    throw new UserNotFoundError();
  }

  const passwordHash = await hash(parsed.password, 12);

  const result = await prisma.user.updateMany({
    where: { id: parsed.id, clinicId },
    data: { passwordHash },
  });

  if (result.count !== 1) {
    throw new UserNotFoundError();
  }
}

export async function toggleAuxiliaryUserActive(
  clinicId: string,
  actingUserId: string,
  id: string,
): Promise<UserRecord> {
  const { id: validId } = userIdSchema.parse({ id });

  if (validId === actingUserId) {
    throw new CannotModifySelfError();
  }

  const existing = await getUserById(clinicId, validId);
  if (!existing) {
    throw new UserNotFoundError();
  }

  const result = await prisma.user.updateMany({
    where: { id: validId, clinicId },
    data: { isActive: !existing.isActive },
  });

  if (result.count !== 1) {
    throw new UserNotFoundError();
  }

  const updated = await getUserById(clinicId, validId);
  if (!updated) throw new UserNotFoundError();
  return updated;
}

export async function listUsersForClinic(
  clinicId: string,
  input?: ListUsersInput,
): Promise<UserListResult> {
  return listUsersByClinic(clinicId, input);
}
