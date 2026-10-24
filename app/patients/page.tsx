import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { PatientsModule } from "@/components/patients/patients-module";
import { Topbar } from "@/components/topbar";
import { listPatientsAction } from "@/lib/patients/actions";

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const patientsResult = await listPatientsAction({
    page: 1,
    pageSize: 100,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/patients" />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Pacientes"
              description="Gestion del listado, busqueda, registro inicial y detalle de pacientes del consultorio autenticado."
              actions={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  Nuevo paciente
                </button>
              }
            />

            <PatientsModule result={patientsResult} />
          </main>
        </div>
      </div>
    </div>
  );
}
