import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";
import { TreatmentsModule } from "@/components/treatments/treatments-module";
import { listPatientsAction } from "@/lib/patients/actions";
import { listTreatmentsAction } from "@/lib/treatments/actions";

export default async function TreatmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [treatmentsResult, patientsResult] = await Promise.all([
    listTreatmentsAction(),
    listPatientsAction({ page: 1, pageSize: 100 }),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/treatments" />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader title="Tratamientos" description="Planifica, actualiza el estado y conserva observaciones por paciente." />
            <TreatmentsModule patientsResult={patientsResult} treatmentsResult={treatmentsResult} />
          </main>
        </div>
      </div>
    </div>
  );
}
