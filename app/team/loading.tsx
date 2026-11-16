import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";

export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/team" />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Equipo"
              description="Cargando usuarios del consultorio..."
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
              <section className="min-w-0 space-y-4">
                <div className="rounded-md border bg-card">
                  <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="h-10 w-full rounded-md bg-muted md:max-w-md" />
                    <div className="h-4 w-36 rounded-md bg-muted" />
                  </div>
                  <div className="divide-y">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="grid gap-3 px-4 py-4 md:grid-cols-[1.3fr_0.9fr_0.9fr_auto] md:items-center"
                      >
                        <div className="space-y-2">
                          <div className="h-4 w-40 rounded-md bg-muted" />
                          <div className="h-4 w-28 rounded-md bg-muted" />
                        </div>
                        <div className="h-4 w-32 rounded-md bg-muted" />
                        <div className="h-7 w-20 rounded-md bg-muted" />
                        <div className="h-7 w-16 rounded-md bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="h-72 rounded-md border bg-card p-5">
                <div className="h-5 w-40 rounded-md bg-muted" />
                <div className="mt-3 h-4 w-24 rounded-md bg-muted" />
                <div className="mt-8 space-y-3">
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
