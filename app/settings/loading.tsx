import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Topbar } from "@/components/topbar";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AppSidebar activeHref="/settings" />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <PageHeader
              title="Configuracion"
              description="Cargando configuracion del consultorio..."
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
              <div className="space-y-4 rounded-md border bg-card p-5">
                <div className="h-5 w-48 rounded-md bg-muted" />
                <div className="h-4 w-64 rounded-md bg-muted" />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="h-10 rounded-md bg-muted md:col-span-2" />
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-16 rounded-md bg-muted md:col-span-2" />
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-md border bg-card p-5">
                  <div className="h-5 w-24 rounded-md bg-muted" />
                  <div className="mt-4 space-y-3">
                    <div className="h-10 rounded-md bg-muted" />
                    <div className="h-10 rounded-md bg-muted" />
                    <div className="h-10 rounded-md bg-muted" />
                  </div>
                </div>
                <div className="rounded-md border bg-card p-5">
                  <div className="h-4 w-24 rounded-md bg-muted" />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-md bg-muted" />
                    <div className="h-16 rounded-md bg-muted" />
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
