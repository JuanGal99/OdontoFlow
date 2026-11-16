import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 grid gap-2">
          <p className="text-sm font-medium text-muted-foreground">OdontoFlow</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Crea tu consultorio
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra tu usuario profesional y crearemos el consultorio
            automaticamente.
          </p>
        </div>

        <RegisterForm />
      </section>
    </main>
  );
}
