import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";
import { UsersModule } from "@/components/users/users-module";
import { listUsersAction } from "@/lib/users/actions";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "professional") {
    redirect("/dashboard");
  }

  const usersResult = await listUsersAction({
    page: 1,
    pageSize: 100,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/team" />
        <div className="min-w-0 flex-1">
          <Topbar userName={session.user.name ?? session.user.userId} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Equipo"
              description="Gestiona los usuarios auxiliares de tu consultorio."
            />

            <UsersModule result={usersResult} />
          </main>
        </div>
      </div>
    </div>
  );
}
