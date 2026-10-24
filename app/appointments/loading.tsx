import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";

export default function AppointmentsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/appointments" />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Agenda"
              description="Cargando agenda del consultorio..."
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
              <section className="min-w-0 space-y-4">
                <div className="rounded-md border bg-card">
                  <div className="grid gap-3 border-b px-4 py-4 md:grid-cols-[1fr_10rem_10rem]">
                    <div className="h-10 rounded-md bg-muted" />
                    <div className="h-10 rounded-md bg-muted" />
                    <div className="h-10 rounded-md bg-muted" />
                  </div>
                  <div className="divide-y">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="grid gap-3 px-4 py-4 md:grid-cols-[0.7fr_1.2fr_1fr_1fr_auto] md:items-center"
                      >
                        <div className="h-8 w-16 rounded-md bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-40 rounded-md bg-muted" />
                          <div className="h-4 w-28 rounded-md bg-muted" />
                        </div>
                        <div className="h-4 w-28 rounded-md bg-muted" />
                        <div className="h-4 w-32 rounded-md bg-muted" />
                        <div className="h-7 w-24 rounded-md bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-80 rounded-md border bg-card p-5">
                  <div className="h-5 w-36 rounded-md bg-muted" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-10 rounded-md bg-muted" />
                    ))}
                  </div>
                </div>
              </section>

              <aside className="h-96 rounded-md border bg-card p-5">
                <div className="h-5 w-40 rounded-md bg-muted" />
                <div className="mt-3 h-4 w-28 rounded-md bg-muted" />
                <div className="mt-8 space-y-3">
                  <div className="h-10 rounded-md bg-muted" />
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
