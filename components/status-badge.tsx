import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning";
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium",
        tone === "default" && "bg-background text-muted-foreground",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      {children}
    </span>
  );
}
