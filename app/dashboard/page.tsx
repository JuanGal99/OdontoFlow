import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import { getDashboardAction } from "@/lib/dashboard/actions";
import type { DashboardData } from "@/lib/dashboard/queries";
import { LogoutButton } from "./logout-button";

const statusLabels: Record<string, string> = {
  programada: "Programada",
  cancelada: "Cancelada",
  asistio: "Asistio",
  no_asistio: "No asistio",
};

const statusTones: Record<string, "default" | "success" | "warning"> = {
  programada: "default",
  cancelada: "warning",
  asistio: "success",
  no_asistio: "warning",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getDashboardAction();

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <AppSidebar activeHref="/dashboard" />
          <div className="min-w-0 flex-1">
            <Topbar userName={session.user.name ?? session.user.userId} />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
              <EmptyState
                icon={<ClipboardList className="size-5" />}
                title="No pudimos cargar el dashboard"
                description={result.error}
              />
            </main>
          </div>
        </div>
      </div>
    );
  }

  const { stats, todayAppointments, recentPatients } = result.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/dashboard" />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Dashboard"
              description="Resumen del consultorio."
              actions={<LogoutButton />}
            />

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Pacientes activos"
                value={String(stats.activePatients)}
                icon={UsersRound}
              />
              <StatCard
                label="Citas de hoy"
                value={String(stats.todayAppointments)}
                icon={CalendarDays}
              />
              <StatCard
                label="Tratamientos activos"
                value={String(stats.activeTreatments)}
                icon={ClipboardList}
              />
              <StatCard
                label="Balance mensual"
                value={formatCurrency(stats.monthlyBalance)}
                detail={
                  stats.monthlyBalance >= 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-3" />
                      {formatCurrency(stats.monthlyIncome)} ingresos
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                      <TrendingDown className="size-3" />
                      {formatCurrency(stats.monthlyExpenses)} egresos
                    </span>
                  )
                }
                icon={CircleDollarSign}
              />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-md border bg-card">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold">Agenda de hoy</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {todayAppointments.length === 0
                        ? "No hay citas programadas para hoy."
                        : `${todayAppointments.length} cita${todayAppointments.length > 1 ? "s" : ""} programada${todayAppointments.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                {todayAppointments.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={<CalendarDays className="size-5" />}
                      title="Sin citas hoy"
                      description="No hay citas programadas para hoy. Crea una desde la seccion de Agenda."
                    />
                  </div>
                ) : (
                  <div className="divide-y">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="grid gap-3 px-5 py-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                      >
                        <p className="text-sm font-medium">
                          {formatTime(appointment.startAt)}
                        </p>
                        <div>
                          <p className="text-sm font-medium">
                            {appointment.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {appointment.patient.firstName}{" "}
                            {appointment.patient.lastName}
                          </p>
                        </div>
                        <StatusBadge
                          tone={statusTones[appointment.status] ?? "default"}
                        >
                          {statusLabels[appointment.status] ??
                            appointment.status}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-md border bg-card">
                <div className="border-b px-5 py-4">
                  <h2 className="text-base font-semibold">
                    Pacientes recientes
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ultimos pacientes registrados
                  </p>
                </div>

                {recentPatients.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={<UsersRound className="size-5" />}
                      title="Sin pacientes"
                      description="Registra el primer paciente desde la seccion de Pacientes."
                    />
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeDate(patient.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
};

function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      {detail ? (
        <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
      ) : null}
    </article>
  );
}
