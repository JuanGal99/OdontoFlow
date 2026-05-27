import Link from "next/link";
import type { ComponentType } from "react";
import {
  CalendarDays,
  CreditCard,
  FileImage,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Pacientes",
    href: "#patients",
    icon: UsersRound,
  },
  {
    label: "Agenda",
    href: "#appointments",
    icon: CalendarDays,
  },
  {
    label: "Tratamientos",
    href: "#treatments",
    icon: Stethoscope,
  },
  {
    label: "Imagenes",
    href: "#images",
    icon: FileImage,
  },
  {
    label: "Finanzas",
    href: "#finances",
    icon: CreditCard,
  },
];

const adminItems = [
  {
    label: "Equipo",
    href: "#team",
    icon: UserRound,
  },
  {
    label: "Configuracion",
    href: "#settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-muted/30 px-3 py-4 lg:flex lg:flex-col">
      <Link
        href="/"
        className="mb-6 flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          OF
        </span>
        <span className="flex flex-col leading-tight">
          <span>OdontoFlow</span>
          <span className="text-xs font-normal text-muted-foreground">
            Consultorio dental
          </span>
        </span>
      </Link>

      <nav className="space-y-6">
        <SidebarSection title="Principal" items={navigationItems} />
        <SidebarSection title="Administracion" items={adminItems} />
      </nav>

      <div className="mt-auto rounded-md border bg-background p-3">
        <p className="text-sm font-medium">MVP visual</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Base estatica lista para conectar permisos y datos en siguientes
          iteraciones.
        </p>
      </div>
    </aside>
  );
}

type SidebarSectionProps = {
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    active?: boolean;
  }>;
};

function SidebarSection({ title, items }: SidebarSectionProps) {
  return (
    <div>
      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              item.active && "bg-background text-foreground shadow-sm",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
