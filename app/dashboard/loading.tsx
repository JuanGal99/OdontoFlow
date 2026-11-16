import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/dashboard" />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Dashboard"
              description="Cargando resumen del consultorio..."
            />

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-md border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 rounded-md bg-muted" />
                    <div className="size-4 rounded-md bg-muted" />
                  </div>
                  <div className="mt-4 h-7 w-20 rounded-md bg-muted" />
                  <div className="mt-2 h-3 w-32 rounded-md bg-muted" />
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-md border bg-card">
                <div className="border-b px-5 py-4">
                  <div className="h-5 w-32 rounded-md bg-muted" />
                  <div className="mt-2 h-4 w-48 rounded-md bg-muted" />
                </div>
                <div className="divide-y">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                    >
                      <div className="h-4 w-10 rounded-md bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 rounded-md bg-muted" />
                        <div className="h-4 w-28 rounded-md bg-muted" />
                      </div>
                      <div className="h-6 w-20 rounded-md bg-muted" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border bg-card">
                <div className="border-b px-5 py-4">
                  <div className="h-5 w-40 rounded-md bg-muted" />
                  <div className="mt-2 h-4 w-48 rounded-md bg-muted" />
                </div>
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="h-4 w-36 rounded-md bg-muted" />
                      <div className="h-3 w-12 rounded-md bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
