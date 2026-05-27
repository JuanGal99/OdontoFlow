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
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
        Nombre del profesional
        <input
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-950"
          name="name"
          required
          type="text"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
        Nombre del consultorio
        <input
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-950"
          name="clinicName"
          required
          type="text"
        />
      </label>

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
        Correo
        <input
          autoComplete="email"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-950"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
        Contrasena
        <input
          autoComplete="new-password"
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-950"
          minLength={8}
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
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        Ya tienes cuenta?{" "}
        <Link className="font-medium text-neutral-950 underline" href="/login">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
