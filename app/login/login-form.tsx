"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type LoginFormProps = {
  registered?: boolean;
};

export function LoginForm({ registered = false }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsPending(false);

    if (result?.error) {
      setError("Usuario o contrasena incorrectos.");
      return;
    }

    router.push(result?.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {registered ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Cuenta creada. Ya puedes iniciar sesion.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
        Usuario
        <input
          autoComplete="username"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-950"
          name="username"
          required
          type="text"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
        Contrasena
        <input
          autoComplete="current-password"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-950"
          name="password"
          required
          type="password"
        />
      </label>

      <button
        className="mt-2 h-10 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Ingresando..." : "Iniciar sesion"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        Aun no tienes cuenta?{" "}
        <Link
          className="font-medium text-neutral-950 underline"
          href="/register"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
