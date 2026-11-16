"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerProfessional, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerProfessional,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Nombre del profesional
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          name="name"
          required
          type="text"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Nombre del consultorio
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          name="clinicName"
          required
          type="text"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Usuario
        <input
          autoComplete="username"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          name="username"
          required
          type="text"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Correo
        <input
          autoComplete="email"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Contrasena
        <input
          autoComplete="new-password"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>

      <button
        className="mt-2 h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link className="font-medium text-foreground underline" href="/login">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
