import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Plus,
  UsersRound,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";
import { LogoutButton } from "./logout-button";

const overviewCards = [
  {
    label: "Pacientes activos",
    value: "128",
    detail: "Placeholder visual",
    icon: UsersRound,
  },
  {
    label: "Citas de hoy",
    value: "8",
    detail: "Agenda demo",
    icon: CalendarDays,
  },
  {
    label: "Tratamientos",
    value: "24",
    detail: "Seguimiento pendiente",
    icon: ClipboardList,
  },
  {
    label: "Balance mensual",
    value: "$4.2M",
    detail: "Dato ficticio",
    icon: CircleDollarSign,
  },
];

const scheduleItems = [
  {
    time: "09:00",
    title: "Valoracion inicial",
    patient: "Paciente demo",
  },
  {
    time: "11:30",
    title: "Control de tratamiento",
    patient: "Paciente demo",
  },
  {
    time: "15:00",
    title: "Limpieza dental",
    patient: "Paciente demo",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Dashboard"
              description="Vista base del consultorio. Esta pantalla ya esta protegida por autenticacion y mantiene datos visuales de ejemplo."
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="size-4" />
                    Nueva accion
                  </button>
                  <LogoutButton />
                </div>
              }
            />

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewCards.map((card) => (
                <article key={card.label} className="rounded-md border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <card.icon className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.detail}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-md border bg-card">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold">Agenda de hoy</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Citas de ejemplo para validar el layout.
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    Demo
                  </span>
                </div>
                <div className="divide-y">
                  {scheduleItems.map((item) => (
                    <div
                      key={`${item.time}-${item.title}`}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                    >
                      <p className="text-sm font-medium">{item.time}</p>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.patient}
                        </p>
                      </div>
                      <span className="w-fit rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        Programada
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <EmptyState
                icon={<ClipboardList className="size-5" />}
                title="Modulos en preparacion"
                description="Pacientes, citas, tratamientos, finanzas e imagenes se conectaran en siguientes iteraciones sin mezclar logica de negocio en esta base visual."
                action={
                  <span className="inline-flex rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground">
                    Placeholder estatico
                  </span>
                }
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
