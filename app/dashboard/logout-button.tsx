"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="h-9 rounded-md border px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      type="button"
    >
      Cerrar sesion
    </button>
  );
}
