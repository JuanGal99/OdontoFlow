import { AppSidebar } from "@/components/app-sidebar";

export default function ImagesLoading() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar activeHref="/images" />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            </div>

            {/* Filters skeleton */}
            <div className="flex gap-3">
              <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
            </div>

            {/* Gallery skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-md border">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
