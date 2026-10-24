"use client";

import type { ComponentType } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Plus,
  Search,
  Stethoscope,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { createAppointmentAction, updateAppointmentAction } from "@/lib/appointments/actions";
import type {
  AppointmentListResult,
  AppointmentRecord,
} from "@/lib/appointments/queries";
import type { PatientListResult } from "@/lib/patients/queries";
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

type AppointmentStatusLabel =
  | "Programada"
  | "Cancelada"
  | "Asistio"
  | "No asistio";

type AppointmentView = {
  id: string;
  patientId: string;
  patientName: string;
  patientDocument: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  professional: string;
  room: string;
  status: AppointmentStatusLabel;
  notes: string;
};

type PatientOption = {
  id: string;
  name: string;
  document: string;
};

type StatusFilter = AppointmentStatusLabel | "Todas";

type AppointmentsModuleProps = {
  appointmentsResult: ActionResult<AppointmentListResult>;
  patientsResult: ActionResult<PatientListResult>;
};

const statusFilters: StatusFilter[] = [
  "Todas",
  "Programada",
  "Asistio",
  "Cancelada",
  "No asistio",
];

const statusTone: Record<AppointmentStatusLabel, "default" | "success" | "warning"> =
  {
    Programada: "warning",
    Asistio: "success",
    Cancelada: "default",
    "No asistio": "default",
  };

function formatDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTimeValue(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function toAppointmentStatusLabel(
  status: AppointmentRecord["status"],
): AppointmentStatusLabel {
  const labels: Record<AppointmentRecord["status"], AppointmentStatusLabel> = {
    programada: "Programada",
    cancelada: "Cancelada",
    asistio: "Asistio",
    no_asistio: "No asistio",
  };

  return labels[status];
}

function toAppointmentStatusValue(label: AppointmentStatusLabel) {
  const values: Record<AppointmentStatusLabel, AppointmentRecord["status"]> = {
    Programada: "programada",
    Cancelada: "cancelada",
    Asistio: "asistio",
    "No asistio": "no_asistio",
  };

  return values[label];
}

function toAppointmentView(appointment: AppointmentRecord): AppointmentView {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
    patientDocument: `${appointment.patient.documentType} ${appointment.patient.documentNumber}`,
    phone: appointment.patient.phone ?? "Sin telefono registrado",
    date: formatDateInputValue(appointment.startAt),
    startTime: formatTimeValue(appointment.startAt),
    endTime: formatTimeValue(appointment.endAt),
    title: appointment.title,
    professional: appointment.creator.name ?? appointment.creator.username,
    room: "Consultorio principal",
    status: toAppointmentStatusLabel(appointment.status),
    notes: appointment.notes ?? "Sin notas registradas.",
  };
}

function toPatientOptions(result: ActionResult<PatientListResult>): PatientOption[] {
  if (!result.ok) {
    return [];
  }

  return result.data.patients.map((patient) => ({
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
    document: `${patient.documentType} ${patient.documentNumber}`,
  }));
}

function createLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export function AppointmentsModule({
  appointmentsResult,
  patientsResult,
}: AppointmentsModuleProps) {
  const initialAppointments = useMemo(
    () =>
      appointmentsResult.ok
        ? appointmentsResult.data.appointments.map(toAppointmentView)
        : [],
    [appointmentsResult],
  );
  const patientOptions = useMemo(
    () => toPatientOptions(patientsResult),
    [patientsResult],
  );
  const initialDate =
    initialAppointments[0]?.date ?? formatDateInputValue(new Date());

  const [appointments, setAppointments] = useState(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("Todas");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    initialAppointments[0]?.id ?? "",
  );
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch = normalizedSearch
        ? [
            appointment.patientName,
            appointment.patientDocument,
            appointment.phone,
            appointment.title,
            appointment.professional,
            appointment.room,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesDate = appointment.date === selectedDate;
      const matchesStatus =
        selectedStatus === "Todas" || appointment.status === selectedStatus;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [appointments, searchTerm, selectedDate, selectedStatus]);

  const dayAppointments = appointments.filter(
    (appointment) => appointment.date === selectedDate,
  );

  const selectedAppointment =
    appointments.find(
      (appointment) => appointment.id === selectedAppointmentId,
    ) ??
    filteredAppointments[0] ??
    null;

  function handleCreateAppointment(formData: FormData) {
    setFormError("");
    setFormSuccess("");

    const patientId = String(formData.get("patientId") ?? "");
    const title = String(formData.get("title") ?? "");
    const date = String(formData.get("date") ?? "");
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");
    const status = String(formData.get("status") ?? "Programada") as
      | AppointmentStatusLabel
      | "";
    const notes = String(formData.get("notes") ?? "");

    if (!patientId || !title || !date || !startTime || !endTime || !status) {
      setFormError("Completa paciente, motivo, fecha, hora y estado.");
      return;
    }

    startTransition(async () => {
      const response = await createAppointmentAction({
        patientId,
        title,
        startAt: createLocalDateTime(date, startTime),
        endAt: createLocalDateTime(date, endTime),
        status: toAppointmentStatusValue(status),
        notes,
      });

      if (!response.ok) {
        setFormError(response.error);
        return;
      }

      const createdAppointment = toAppointmentView(response.data);
      setAppointments((currentAppointments) =>
        [createdAppointment, ...currentAppointments].sort((left, right) =>
          `${left.date} ${left.startTime}`.localeCompare(
            `${right.date} ${right.startTime}`,
          ),
        ),
      );
      setSelectedDate(createdAppointment.date);
      setSelectedAppointmentId(createdAppointment.id);
      setFormSuccess("Cita creada correctamente.");
    });
  }

  function handleUpdateAppointment(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "Programada") as AppointmentStatusLabel;
    setFormError("");
    setFormSuccess("");

    startTransition(async () => {
      const response = await updateAppointmentAction({
        id,
        patientId: String(formData.get("patientId") ?? ""),
        title: String(formData.get("title") ?? ""),
        startAt: createLocalDateTime(String(formData.get("date") ?? ""), String(formData.get("startTime") ?? "")),
        endAt: createLocalDateTime(String(formData.get("date") ?? ""), String(formData.get("endTime") ?? "")),
        status: toAppointmentStatusValue(status),
        notes: String(formData.get("notes") ?? ""),
      });

      if (!response.ok) {
        setFormError(response.error);
        return;
      }

      const updatedAppointment = toAppointmentView(response.data);
      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment,
        ),
      );
      setFormSuccess("Cita actualizada correctamente.");
    });
  }

  if (!appointmentsResult.ok) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={<CalendarDays className="size-5" />}
          title="No pudimos cargar la agenda"
          description={appointmentsResult.error}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-md border bg-card">
          <AppointmentFilters
            searchTerm={searchTerm}
            selectedDate={selectedDate}
            selectedStatus={selectedStatus}
            totalCount={appointments.length}
            visibleCount={filteredAppointments.length}
            onSearchChange={setSearchTerm}
            onDateChange={setSelectedDate}
            onStatusChange={setSelectedStatus}
          />

          {appointments.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<CalendarDays className="size-5" />}
                title="No hay citas registradas"
                description="Crea la primera cita del consultorio para comenzar a organizar la agenda."
              />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <AppointmentTable
              appointments={filteredAppointments}
              selectedAppointmentId={selectedAppointment?.id ?? ""}
              onSelectAppointment={setSelectedAppointmentId}
            />
          ) : (
            <div className="p-4">
              <EmptyState
                icon={<CalendarDays className="size-5" />}
                title="No hay citas para estos filtros"
                description="Prueba con otro dia, estado, paciente o tratamiento."
              />
            </div>
          )}
        </div>

        <DailyCalendarPlaceholder
          appointments={dayAppointments}
          selectedAppointmentId={selectedAppointment?.id ?? ""}
          onSelectAppointment={setSelectedAppointmentId}
        />

        <NewAppointmentForm
          error={formError}
          isPending={isPending}
          onCreateAppointment={handleCreateAppointment}
          patients={patientOptions}
          patientsError={patientsResult.ok ? "" : patientsResult.error}
          success={formSuccess}
        />
      </section>

      <AppointmentDetailPanel
        appointment={selectedAppointment}
        error={formError}
        isPending={isPending}
        onUpdateAppointment={handleUpdateAppointment}
        success={formSuccess}
      />
    </div>
  );
}

type AppointmentFiltersProps = {
  searchTerm: string;
  selectedDate: string;
  selectedStatus: StatusFilter;
  totalCount: number;
  visibleCount: number;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
};

function AppointmentFilters({
  searchTerm,
  selectedDate,
  selectedStatus,
  totalCount,
  visibleCount,
  onSearchChange,
  onDateChange,
  onStatusChange,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem] lg:max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar paciente, profesional o tratamiento"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <select
          value={selectedStatus}
          onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
        >
          {statusFilters.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-muted-foreground">
        {visibleCount} de {totalCount} citas
      </p>
    </div>
  );
}

type AppointmentTableProps = {
  appointments: AppointmentView[];
  selectedAppointmentId: string;
  onSelectAppointment: (appointmentId: string) => void;
};

function AppointmentTable({
  appointments,
  selectedAppointmentId,
  onSelectAppointment,
}: AppointmentTableProps) {
  return (
    <div className="overflow-hidden">
      <div className="hidden grid-cols-[0.7fr_1.2fr_1fr_1fr_auto] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Hora</span>
        <span>Paciente</span>
        <span>Motivo</span>
        <span>Profesional</span>
        <span>Estado</span>
      </div>
      <div className="divide-y">
        {appointments.map((appointment) => (
          <button
            key={appointment.id}
            type="button"
            onClick={() => onSelectAppointment(appointment.id)}
            className={cn(
              "grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 md:grid-cols-[0.7fr_1.2fr_1fr_1fr_auto] md:items-center",
              selectedAppointmentId === appointment.id && "bg-muted/50",
            )}
          >
            <span className="text-sm font-medium">
              {appointment.startTime}
              <span className="block text-xs font-normal text-muted-foreground">
                {appointment.endTime}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {appointment.patientName}
              </span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">
                {appointment.patientDocument}
              </span>
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {appointment.title}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {appointment.professional}
            </span>
            <StatusBadge tone={statusTone[appointment.status]}>
              {appointment.status}
            </StatusBadge>
          </button>
        ))}
      </div>
    </div>
  );
}

type DailyCalendarPlaceholderProps = {
  appointments: AppointmentView[];
  selectedAppointmentId: string;
  onSelectAppointment: (appointmentId: string) => void;
};

function DailyCalendarPlaceholder({
  appointments,
  selectedAppointmentId,
  onSelectAppointment,
}: DailyCalendarPlaceholderProps) {
  const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  return (
    <section className="rounded-md border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Vista diaria</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Calendario base para revisar la agenda del consultorio.
          </p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          Dia
        </span>
      </div>
      <div className="divide-y">
        {hours.map((hour) => {
          const hourAppointments = appointments.filter((appointment) =>
            appointment.startTime.startsWith(hour.slice(0, 2)),
          );

          return (
            <div
              key={hour}
              className="grid min-h-16 gap-3 px-5 py-3 md:grid-cols-[4rem_1fr]"
            >
              <p className="text-sm font-medium text-muted-foreground">{hour}</p>
              <div className="grid gap-2">
                {hourAppointments.length > 0 ? (
                  hourAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelectAppointment(appointment.id)}
                      className={cn(
                        "rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-muted/50",
                        selectedAppointmentId === appointment.id &&
                          "border-ring bg-muted/50",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">
                          {appointment.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {appointment.startTime}-{appointment.endTime}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {appointment.patientName}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
                    Disponible
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type NewAppointmentFormProps = {
  error: string;
  isPending: boolean;
  patients: PatientOption[];
  patientsError: string;
  success: string;
  onCreateAppointment: (formData: FormData) => void;
};

function NewAppointmentForm({
  error,
  isPending,
  patients,
  patientsError,
  success,
  onCreateAppointment,
}: NewAppointmentFormProps) {
  const hasPatients = patients.length > 0;

  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Nueva cita</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Agenda una cita para un paciente del consultorio autenticado.
            </p>
          </div>
          <span className="hidden rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
            Real
          </span>
        </div>
      </div>

      <form action={onCreateAppointment} className="grid gap-4 p-5 md:grid-cols-2">
        {patientsError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
            {patientsError}
          </p>
        ) : null}
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

        <label className="grid gap-2 text-sm font-medium">
          Paciente
          <select
            name="patientId"
            required
            disabled={!hasPatients || isPending}
            className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <option value="">
              {hasPatients ? "Selecciona un paciente" : "No hay pacientes"}
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - {patient.document}
              </option>
            ))}
          </select>
        </label>
        <FormField label="Motivo" name="title" placeholder="Ej. Limpieza dental" />
        <FormField label="Fecha" name="date" type="date" />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Inicio" name="startTime" type="time" />
          <FormField label="Fin" name="endTime" type="time" />
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Estado
          <select
            name="status"
            defaultValue="Programada"
            className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            {statusFilters
              .filter((status) => status !== "Todas")
              .map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>
        </label>
        <FormField label="Consultorio" name="room" placeholder="Consultorio principal" />
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            rows={3}
            name="notes"
            placeholder="Indicaciones, preparacion o detalles de la cita..."
            className="min-h-24 resize-none rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
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
            disabled={!hasPatients || isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Plus className="size-4" />
            {isPending ? "Guardando..." : "Guardar cita"}
          </button>
        </div>
      </form>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
};

function FormField({
  label,
  name,
  placeholder,
  type = "text",
}: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        required={type !== "text" || Boolean(placeholder)}
        placeholder={placeholder}
        className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}

type AppointmentDetailPanelProps = {
  appointment: AppointmentView | null;
  error: string;
  isPending: boolean;
  onUpdateAppointment: (formData: FormData) => void;
  success: string;
};

function AppointmentDetailPanel({
  appointment,
  error,
  isPending,
  onUpdateAppointment,
  success,
}: AppointmentDetailPanelProps) {
  if (!appointment) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-5" />}
        title="Selecciona una cita"
        description="El detalle aparecera aqui cuando exista una coincidencia en la agenda."
      />
    );
  }

  return (
    <aside className="h-fit rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">
              {appointment.patientName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {appointment.title}
            </p>
          </div>
          <StatusBadge tone={statusTone[appointment.status]}>
            {appointment.status}
          </StatusBadge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3">
          <DetailItem
            icon={CalendarDays}
            label="Fecha"
            value={appointment.date}
          />
          <DetailItem
            icon={Clock}
            label="Horario"
            value={`${appointment.startTime} - ${appointment.endTime}`}
          />
          <DetailItem icon={Phone} label="Telefono" value={appointment.phone} />
          <DetailItem
            icon={Stethoscope}
            label="Profesional"
            value={appointment.professional}
          />
          <DetailItem icon={MapPin} label="Consultorio" value={appointment.room} />
        </div>

        <div className="rounded-md border bg-muted/20 p-4">
          <p className="text-sm font-medium">Notas de la cita</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {appointment.notes}
          </p>
        </div>

        <form action={onUpdateAppointment} className="grid gap-3 border-t pt-5">
          <input name="id" type="hidden" value={appointment.id} />
          <input name="patientId" type="hidden" value={appointment.patientId} />
          <p className="text-sm font-medium">Actualizar cita</p>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={appointment.title} name="title" required />
          <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={appointment.date} name="date" required type="date" />
          <div className="grid grid-cols-2 gap-2">
            <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={appointment.startTime} name="startTime" required type="time" />
            <input className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={appointment.endTime} name="endTime" required type="time" />
          </div>
          <select className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={appointment.status} name="status">
            {statusFilters.filter((status) => status !== "Todas").map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <textarea className="min-h-20 rounded-md border bg-background px-2 py-2 text-sm" defaultValue={appointment.notes === "Sin notas registradas." ? "" : appointment.notes} name="notes" />
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
