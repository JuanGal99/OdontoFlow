import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import type { UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export type AuthenticatedSessionContext = {
  userId: string;
  clinicId: string;
  role: UserRole;
};

export async function getAuthenticatedSessionContext(): Promise<AuthenticatedSessionContext> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId ?? session?.user?.id;
  const clinicId = session?.user?.clinicId;
  const role = session?.user?.role;

  if (!userId || !clinicId || !role) {
    throw new AuthenticationError();
  }

  const activeUser = await prisma.user.findFirst({
    where: {
      id: userId,
      clinicId,
      role,
      isActive: true,
      clinic: { isActive: true },
    },
    select: {
      id: true,
    },
  });

  if (!activeUser) {
    throw new AuthenticationError("Session is no longer valid.");
  }

  return {
    userId,
    clinicId,
    role,
  };
}
