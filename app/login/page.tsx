import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-2">
          <p className="text-sm font-medium text-neutral-500">OdontoFlow</p>
          <h1 className="text-2xl font-semibold text-neutral-950">
            Inicia sesion
          </h1>
          <p className="text-sm text-neutral-600">
            Accede con tu usuario y contrasena.
          </p>
        </div>

        <LoginForm registered={params?.registered === "1"} />
      </section>
    </main>
  );
}
