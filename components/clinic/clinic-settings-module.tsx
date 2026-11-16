"use client";

import type { ComponentType, ReactNode } from "react";
import { useState, useTransition } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Users,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { updateClinicAction } from "@/lib/clinic/actions";
import type { ClinicRecord } from "@/lib/clinic/queries";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

type Props = {
  result: ActionResult<ClinicRecord>;
};

export function ClinicSettingsModule({ result }: Props) {
  const [clinic, setClinic] = useState(result.ok ? result.data : null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleUpdate(formData: FormData) {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await updateClinicAction({
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setClinic(res.data);
      setSuccess("Configuracion actualizada correctamente.");
    });
  }

  if (!result.ok || !clinic) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={<Building2 className="size-5" />}
          title="No pudimos cargar la configuracion"
          description={result.ok ? "Consultorio no encontrado." : result.error}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <form
        action={handleUpdate}
        className="space-y-4 rounded-md border bg-card p-5"
      >
        <div>
          <h2 className="text-base font-semibold">Informacion del consultorio</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edita los datos basicos de tu consultorio.
          </p>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            {success}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Nombre del consultorio
            <input
              type="text"
              name="name"
              required
              defaultValue={clinic.name}
              className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Telefono
            <input
              type="text"
              name="phone"
              defaultValue={clinic.phone ?? ""}
              placeholder="+57 300 000 0000"
              className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Correo del consultorio
            <input
              type="email"
              name="email"
              defaultValue={clinic.email ?? ""}
              placeholder="consultorio@ejemplo.com"
              className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Direccion
            <textarea
              name="address"
              rows={2}
              defaultValue={clinic.address ?? ""}
              placeholder="Direccion del consultorio"
              className="min-h-16 resize-none rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      <aside className="h-fit space-y-4">
        <div className="rounded-md border bg-card p-5">
          <h2 className="text-base font-semibold">Resumen</h2>
          <div className="mt-4 grid gap-3">
            <DetailItem
              icon={Building2}
              label="Consultorio"
              value={clinic.name}
            />
            <DetailItem
              icon={Phone}
              label="Telefono"
              value={clinic.phone ?? "Sin telefono"}
            />
            <DetailItem
              icon={Mail}
              label="Correo"
              value={clinic.email ?? "Sin correo"}
            />
            <DetailItem
              icon={MapPin}
              label="Direccion"
              value={clinic.address ?? "Sin direccion"}
            />
          </div>
        </div>

        <div className="rounded-md border bg-card p-5">
          <h2 className="text-sm font-semibold">Estadisticas</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard
              icon={<UsersRound className="size-4" />}
              label="Usuarios"
              value={clinic._count.users}
            />
            <StatCard
              icon={<Users className="size-4" />}
              label="Pacientes"
              value={clinic._count.patients}
            />
          </div>
        </div>

        <div className="rounded-md border bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Slug
          </p>
          <p className="mt-1 text-sm font-mono">{clinic.slug}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Identificador unico del consultorio. No se puede cambiar.
          </p>
        </div>
      </aside>
    </div>
  );
}

type DetailItemProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
