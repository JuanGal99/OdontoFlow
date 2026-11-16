import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { ClinicSettingsModule } from "@/components/clinic/clinic-settings-module";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";
import { getClinicAction } from "@/lib/clinic/actions";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "professional") {
    redirect("/dashboard");
  }

  const clinicResult = await getClinicAction();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/settings" />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Configuracion"
              description="Administra la informacion basica de tu consultorio."
            />

            <ClinicSettingsModule result={clinicResult} />
          </main>
        </div>
      </div>
    </div>
  );
}
