"use client";

import type { ComponentType } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  FileText,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createPatientAction, updatePatientAction } from "@/lib/patients/actions";
import type {
  PatientListResult,
  PatientRecord,
} from "@/lib/patients/queries";
import { cn } from "@/lib/utils";

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

type PatientsModuleProps = {
  result: ActionResult<PatientListResult>;
};

type PatientView = {
  id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentId: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  treatmentSummary: string;
  status: "Activo" | "Inactivo";
  notes: string;
  isActive: boolean;
};

const statusTone: Record<PatientView["status"], "success" | "warning"> = {
  Activo: "success",
  Inactivo: "warning",
};

function toPatientView(patient: PatientRecord): PatientView {
  return {
    id: patient.id,
    documentType: patient.documentType,
    documentNumber: patient.documentNumber,
    firstName: patient.firstName,
    lastName: patient.lastName,
    fullName: `${patient.firstName} ${patient.lastName}`,
    documentId: `${patient.documentType} ${patient.documentNumber}`,
    phone: patient.phone ?? "Sin telefono",
    email: patient.email ?? "Sin correo",
    lastVisit: "Sin visitas registradas",
    nextAppointment: "Sin cita registrada",
    treatmentSummary: "Sin tratamiento registrado",
    status: patient.isActive ? "Activo" : "Inactivo",
    notes: patient.notes ?? "Sin notas registradas.",
    isActive: patient.isActive,
  };
}

export function PatientsModule({ result }: PatientsModuleProps) {
  const initialPatients = useMemo(
    () => (result.ok ? result.data.patients.map(toPatientView) : []),
    [result],
  );
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatients[0]?.id ?? "",
  );
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        patient.fullName,
        patient.documentId,
        patient.phone,
        patient.email,
        patient.treatmentSummary,
        patient.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [patients, searchTerm]);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ??
    filteredPatients[0] ??
    null;

  function handleCreatePatient(formData: FormData) {
    setFormError("");
    setFormSuccess("");

    startTransition(async () => {
      const response = await createPatientAction({
        documentType: String(formData.get("documentType") ?? ""),
        documentNumber: String(formData.get("documentNumber") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });

      if (!response.ok) {
        setFormError(response.error);
        return;
      }

      const createdPatient = toPatientView(response.data);
      setPatients((currentPatients) => [createdPatient, ...currentPatients]);
      setSelectedPatientId(createdPatient.id);
      setFormSuccess("Paciente creado correctamente.");
    });
  }

  function handleUpdatePatient(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    setFormError("");
    setFormSuccess("");

    startTransition(async () => {
      const response = await updatePatientAction({
        id,
        documentType: String(formData.get("documentType") ?? ""),
        documentNumber: String(formData.get("documentNumber") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        isActive: formData.get("isActive") === "on",
      });

      if (!response.ok) {
        setFormError(response.error);
        return;
      }

      const updatedPatient = toPatientView(response.data);
      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          patient.id === updatedPatient.id ? updatedPatient : patient,
        ),
      );
      setFormSuccess("Paciente actualizado correctamente.");
    });
  }

  if (!result.ok) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={<UsersRound className="size-5" />}
          title="No pudimos cargar los pacientes"
          description={result.error}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-md border bg-card">
          <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, documento o tratamiento"
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredPatients.length} de {patients.length} pacientes
            </p>
          </div>

          {patients.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<UsersRound className="size-5" />}
                title="No hay pacientes registrados"
                description="Crea el primer paciente del consultorio para comenzar a construir el historial operativo."
              />
            </div>
          ) : filteredPatients.length > 0 ? (
            <PatientTable
              patients={filteredPatients}
              selectedPatientId={selectedPatient?.id ?? ""}
              onSelectPatient={setSelectedPatientId}
            />
          ) : (
            <div className="p-4">
              <EmptyState
                icon={<UsersRound className="size-5" />}
                title="No hay pacientes para esta busqueda"
                description="Prueba con otro nombre, documento, telefono o correo del paciente."
              />
            </div>
          )}
        </div>

        <NewPatientForm
          error={formError}
          isPending={isPending}
          onCreatePatient={handleCreatePatient}
          success={formSuccess}
        />
      </section>

      <PatientDetail
        error={formError}
        isPending={isPending}
        onUpdatePatient={handleUpdatePatient}
        patient={selectedPatient}
        success={formSuccess}
      />
    </div>
  );
}

type PatientTableProps = {
  patients: PatientView[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
};

function PatientTable({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientTableProps) {
  return (
    <div className="overflow-hidden">
      <div className="hidden grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_auto] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Paciente</span>
        <span>Documento</span>
        <span>Ultima visita</span>
        <span>Proxima cita</span>
        <span>Estado</span>
      </div>
      <div className="divide-y">
        {patients.map((patient) => (
          <button
            key={patient.id}
            type="button"
            onClick={() => onSelectPatient(patient.id)}
            className={cn(
              "grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 md:grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_auto] md:items-center",
              selectedPatientId === patient.id && "bg-muted/50",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {patient.fullName}
              </span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">
                {patient.phone}
              </span>
            </span>
            <span className="text-sm text-muted-foreground">
              {patient.documentId}
            </span>
            <span className="text-sm text-muted-foreground">
              {patient.lastVisit}
            </span>
            <span className="text-sm text-muted-foreground">
              {patient.nextAppointment}
            </span>
            <StatusBadge tone={statusTone[patient.status]}>
              {patient.status}
            </StatusBadge>
          </button>
        ))}
      </div>
    </div>
  );
}

type NewPatientFormProps = {
  error: string;
  isPending: boolean;
  onCreatePatient: (formData: FormData) => void;
  success: string;
};

function NewPatientForm({
  error,
  isPending,
  onCreatePatient,
  success,
}: NewPatientFormProps) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Nuevo paciente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Registra un paciente en el consultorio autenticado.
            </p>
          </div>
          <span className="hidden rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
            Real
          </span>
        </div>
      </div>

      <form action={onCreatePatient} className="grid gap-4 p-5 md:grid-cols-2">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 md:col-span-2">
            {success}
          </p>
        ) : null}
        <FormField label="Nombres" name="firstName" placeholder="Ej. Sofia" />
        <FormField label="Apellidos" name="lastName" placeholder="Ej. Herrera" />
        <FormField
          label="Tipo de documento"
          name="documentType"
          placeholder="CC"
        />
        <FormField
          label="Numero de documento"
          name="documentNumber"
          placeholder="1234567890"
        />
        <FormField
          label="Telefono"
          name="phone"
          placeholder="+57 300 000 0000"
          required={false}
        />
        <FormField
          label="Correo"
          name="email"
          placeholder="paciente@example.com"
          required={false}
          type="email"
        />
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            rows={3}
            name="notes"
            placeholder="Valoracion, limpieza, control..."
            className="min-h-24 resize-none rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 md:col-span-2"
          />
        </label>
        <div className="flex items-center justify-end gap-2 md:col-span-2">
          <button
            type="reset"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Plus className="size-4" />
            {isPending ? "Guardando..." : "Guardar paciente"}
          </button>
        </div>
      </form>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
};

function FormField({
  label,
  name,
  placeholder,
  required = true,
  type = "text",
}: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}

type PatientDetailProps = {
  error: string;
  isPending: boolean;
  onUpdatePatient: (formData: FormData) => void;
  patient: PatientView | null;
  success: string;
};

function PatientDetail({
  error,
  isPending,
  onUpdatePatient,
  patient,
  success,
}: PatientDetailProps) {
  if (!patient) {
    return (
      <EmptyState
        icon={<UserRound className="size-5" />}
        title="Selecciona un paciente"
        description="El detalle aparecera aqui cuando exista una coincidencia en la lista."
      />
    );
  }

  return (
    <aside className="h-fit rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{patient.fullName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {patient.documentId}
            </p>
          </div>
          <StatusBadge tone={statusTone[patient.status]}>
            {patient.status}
          </StatusBadge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3">
          <DetailItem icon={Phone} label="Telefono" value={patient.phone} />
          <DetailItem icon={Mail} label="Correo" value={patient.email} />
          <DetailItem
            icon={CalendarDays}
            label="Proxima cita"
            value={patient.nextAppointment}
          />
          <DetailItem
            icon={FileText}
            label="Tratamiento"
            value={patient.treatmentSummary}
          />
        </div>

        <div className="rounded-md border bg-muted/20 p-4">
          <p className="text-sm font-medium">Resumen clinico</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {patient.notes}
          </p>
        </div>

        <form action={onUpdatePatient} className="grid gap-3 border-t pt-5">
          <input name="id" type="hidden" value={patient.id} />
          <p className="text-sm font-medium">Editar paciente</p>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={patient.firstName} name="firstName" required />
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={patient.lastName} name="lastName" required />
          <div className="grid grid-cols-2 gap-2">
            <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={patient.documentType} name="documentType" required />
            <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={patient.documentNumber} name="documentNumber" required />
          </div>
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={patient.phone === "Sin telefono" ? "" : patient.phone} name="phone" placeholder="Telefono" />
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={patient.email === "Sin correo" ? "" : patient.email} name="email" placeholder="Correo" type="email" />
          <textarea className="min-h-20 rounded-md border bg-background px-2 py-2 text-sm" defaultValue={patient.notes === "Sin notas registradas." ? "" : patient.notes} name="notes" />
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><input defaultChecked={patient.isActive} name="isActive" type="checkbox" /> Activo</label>
          <button className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "Guardando..." : "Guardar cambios"}</button>
        </form>
      </div>
    </aside>
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
