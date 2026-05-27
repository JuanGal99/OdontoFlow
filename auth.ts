import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const username = credentials.username.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { username },
          include: {
            clinic: {
              select: {
                isActive: true,
              },
            },
          },
        });

        if (!user?.isActive || !user.clinic.isActive) {
          return null;
        }

        const isValidPassword = await compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email,
          clinicId: user.clinicId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? token.sub ?? "";
        token.clinicId = user.clinicId;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
        session.user.userId = token.userId ?? token.sub ?? "";
        session.user.user_id = token.userId ?? token.sub ?? "";
        session.user.clinicId = token.clinicId ?? "";
        session.user.clinic_id = token.clinicId ?? "";
        session.user.role = token.role;
      }

      return session;
    },
  },
};
