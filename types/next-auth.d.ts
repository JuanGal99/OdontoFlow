import type { UserRole } from "@/lib/generated/prisma/enums";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      clinicId: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    clinicId: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    clinicId: string;
    role: UserRole;
  }
}
