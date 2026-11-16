"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Stethoscope } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createTreatmentAction, updateTreatmentAction } from "@/lib/treatments/actions";
import type { TreatmentRecord } from "@/lib/treatments/queries";
import type { PatientListResult } from "@/lib/patients/queries";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
type Props = { treatmentsResult: ActionResult<TreatmentRecord[]>; patientsResult: ActionResult<PatientListResult> };
type Status = "planificado" | "en_proceso" | "finalizado" | "cancelado";

const labels: Record<Status, string> = { planificado: "Planificado", en_proceso: "En proceso", finalizado: "Finalizado", cancelado: "Cancelado" };
const tones: Record<Status, "default" | "success" | "warning"> = { planificado: "warning", en_proceso: "warning", finalizado: "success", cancelado: "default" };

export function TreatmentsModule({ treatmentsResult, patientsResult }: Props) {
  const initialTreatments = useMemo(() => treatmentsResult.ok ? treatmentsResult.data : [], [treatmentsResult]);
  const [treatments, setTreatments] = useState(initialTreatments);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const patients = patientsResult.ok ? patientsResult.data.patients : [];

  function save(formData: FormData) {
    setError(""); setSuccess("");
    const input = {
      patientId: String(formData.get("patientId") ?? ""), name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""), tooth: String(formData.get("tooth") ?? ""),
      status: String(formData.get("status") ?? "planificado") as Status,
      startedAt: String(formData.get("startedAt") ?? "") || null, completedAt: String(formData.get("completedAt") ?? "") || null,
      notes: String(formData.get("notes") ?? ""),
    };
    startTransition(async () => {
      const id = String(formData.get("id") ?? "");
      const result = id ? await updateTreatmentAction({ id, ...input }) : await createTreatmentAction(input);
      if (!result.ok) { setError(result.error); return; }
      setTreatments((current) => id ? current.map((item) => item.id === result.data.id ? result.data : item) : [result.data, ...current]);
      setSuccess(id ? "Tratamiento actualizado correctamente." : "Tratamiento creado correctamente.");
      if (!id) formData.forEach((_, key) => formData.delete(key));
    });
  }

  if (!treatmentsResult.ok) return <div className="mt-6"><EmptyState icon={<Stethoscope className="size-5" />} title="No pudimos cargar los tratamientos" description={treatmentsResult.error} /></div>;

  return <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
    <section className="space-y-3 rounded-md border bg-card p-4">
      {treatments.length === 0 ? <EmptyState icon={<Stethoscope className="size-5" />} title="No hay tratamientos registrados" description="Crea el primer plan de tratamiento para un paciente." /> : treatments.map((treatment) => (
        <form action={save} className="grid gap-3 rounded-md border p-4 md:grid-cols-2" key={treatment.id}>
          <input name="id" type="hidden" value={treatment.id} />
          <input name="patientId" type="hidden" value={treatment.patientId} />
          <div><p className="font-medium">{treatment.name}</p><p className="text-sm text-muted-foreground">{treatment.patient.firstName} {treatment.patient.lastName}</p></div>
          <div className="flex items-center justify-between gap-2"><StatusBadge tone={tones[treatment.status]}>{labels[treatment.status]}</StatusBadge><select className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={treatment.status} name="status">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={treatment.name} name="name" required />
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={treatment.tooth ?? ""} name="tooth" placeholder="Diente o zona" />
          <textarea className="min-h-20 rounded-md border bg-background px-2 py-2 text-sm md:col-span-2" defaultValue={treatment.notes ?? ""} name="notes" placeholder="Observaciones" />
          <input name="description" type="hidden" value={treatment.description ?? ""} /><input name="startedAt" type="hidden" value={treatment.startedAt ? new Date(treatment.startedAt).toISOString().slice(0, 10) : ""} /><input name="completedAt" type="hidden" value={treatment.completedAt ? new Date(treatment.completedAt).toISOString().slice(0, 10) : ""} />
          <button className="justify-self-end rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60" disabled={isPending} type="submit">Guardar</button>
        </form>))}
    </section>
    <form action={save} className="h-fit space-y-3 rounded-md border bg-card p-5">
      <div><h2 className="font-semibold">Nuevo tratamiento</h2><p className="mt-1 text-sm text-muted-foreground">Disponible para profesionales.</p></div>
      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{error}</p> : null}{success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">{success}</p> : null}
      <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" disabled={!patients.length} name="patientId" required><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}</select>
      <input className="h-10 w-full rounded-md border bg-background px-2 text-sm" name="name" placeholder="Nombre del tratamiento" required />
      <input className="h-10 w-full rounded-md border bg-background px-2 text-sm" name="tooth" placeholder="Diente o zona (opcional)" />
      <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" defaultValue="planificado" name="status">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <textarea className="min-h-24 w-full rounded-md border bg-background px-2 py-2 text-sm" name="notes" placeholder="Observaciones" /><input name="description" type="hidden" value="" /><input name="startedAt" type="hidden" value="" /><input name="completedAt" type="hidden" value="" />
      <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={!patients.length || isPending} type="submit"><Plus className="size-4" />{isPending ? "Guardando..." : "Crear tratamiento"}</button>
    </form>
  </div>;
}
