import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listUsersSchema } from "@/lib/users/validation";
import type { ListUsersInput } from "@/lib/users/validation";

const userSelect = {
  id: true,
  clinicId: true,
  username: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

export type UserListResult = {
  users: UserRecord[];
  total: number;
  page: number;
  pageSize: number;
};

function buildUserSearchWhere(
  clinicId: string,
  input: ReturnType<typeof listUsersSchema.parse>,
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    clinicId,
    isActive: input.isActive,
  };

  if (!input.search) {
    return where;
  }

  where.OR = [
    { name: { contains: input.search, mode: "insensitive" } },
    { username: { contains: input.search, mode: "insensitive" } },
    { email: { contains: input.search, mode: "insensitive" } },
  ];

  return where;
}

export async function listUsersByClinic(
  clinicId: string,
  input: ListUsersInput = {},
): Promise<UserListResult> {
  const parsedInput = listUsersSchema.parse(input);
  const where = buildUserSearchWhere(clinicId, parsedInput);

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { name: "asc" }],
      skip: (parsedInput.page - 1) * parsedInput.pageSize,
      take: parsedInput.pageSize,
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page: parsedInput.page,
    pageSize: parsedInput.pageSize,
  };
}

export async function getUserById(
  clinicId: string,
  id: string,
): Promise<UserRecord | null> {
  return prisma.user.findFirst({
    where: { id, clinicId },
    select: userSelect,
  });
}
