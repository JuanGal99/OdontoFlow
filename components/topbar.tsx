import { Bell, Search } from "lucide-react";

type TopbarProps = {
  clinicName?: string;
  userName?: string;
};

export function Topbar({
  clinicName = "Consultorio Demo",
  userName = "Profesional",
}: TopbarProps) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40 lg:hidden">
          <span className="text-xs font-semibold">OF</span>
        </div>
        <div className="hidden min-w-72 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="size-4" />
          <span>Buscar pacientes, citas o tratamientos</span>
        </div>
        <p className="truncate text-sm text-muted-foreground md:hidden">
          {clinicName}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="size-4" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{clinicName}</p>
          <p className="text-xs text-muted-foreground">{userName}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
          {initials || "OF"}
        </div>
      </div>
    </header>
  );
}
