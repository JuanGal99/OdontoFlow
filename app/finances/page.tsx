import { CreditCard } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { FinancesModule } from "@/components/finances/finances-module";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";
import { listFinancesAction } from "@/lib/finances/actions";

export default async function FinancesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const financesResult = await listFinancesAction();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/finances" />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Finanzas"
              description="Gestion de ingresos, egresos y compras del consultorio."
              actions={
                <span className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  <CreditCard className="size-4" />
                  Resumen financiero
                </span>
              }
            />

            <FinancesModule result={financesResult} />
          </main>
        </div>
      </div>
    </div>
  );
}
