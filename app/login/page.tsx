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
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 grid gap-2">
          <p className="text-sm font-medium text-muted-foreground">OdontoFlow</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Inicia sesion
          </h1>
          <p className="text-sm text-muted-foreground">
            Accede con tu usuario y contrasena.
          </p>
        </div>

        <LoginForm registered={params?.registered === "1"} />
      </section>
    </main>
  );
}
