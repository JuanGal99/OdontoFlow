"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Plus,
  Search,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import {
  createIncomeAction,
  createExpenseAction,
  createPurchaseAction,
  listFinancesAction,
} from "@/lib/finances/actions";
import type {
  FinancesListResult,
  IncomeRecord,
  ExpenseRecord,
  PurchaseRecord,
} from "@/lib/finances/queries";
import { cn } from "@/lib/utils";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type FinancesModuleProps = {
  result: ActionResult<FinancesListResult>;
};

type TabId = "income" | "expenses" | "purchases";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "income", label: "Ingresos" },
  { id: "expenses", label: "Egresos" },
  { id: "purchases", label: "Compras" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FinancesModule({ result }: FinancesModuleProps) {
  const [data, setData] = useState<FinancesListResult | null>(
    result.ok ? result.data : null,
  );
  const [activeTab, setActiveTab] = useState<TabId>("income");
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredIncome = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data.income;
    return data.income.filter(
      (r) =>
        r.concept.toLowerCase().includes(q) ||
        r.patient?.firstName.toLowerCase().includes(q) ||
        r.patient?.lastName.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q),
    );
  }, [data, searchTerm]);

  const filteredExpenses = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data.expenses;
    return data.expenses.filter(
      (r) =>
        r.concept.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q),
    );
  }, [data, searchTerm]);

  const filteredPurchases = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data.purchases;
    return data.purchases.filter(
      (r) =>
        r.supplier.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q),
    );
  }, [data, searchTerm]);

  function handleCreateIncome(formData: FormData) {
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await createIncomeAction({
        date: String(formData.get("date") ?? ""),
        concept: String(formData.get("concept") ?? ""),
        amount: String(formData.get("amount") ?? ""),
        patientId: String(formData.get("patientId") ?? "") || null,
        notes: String(formData.get("notes") ?? ""),
      });
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setFormSuccess("Ingreso registrado correctamente.");
      const refreshed = await listFinancesAction();
      if (refreshed.ok) setData(refreshed.data);
    });
  }

  function handleCreateExpense(formData: FormData) {
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await createExpenseAction({
        date: String(formData.get("date") ?? ""),
        concept: String(formData.get("concept") ?? ""),
        amount: String(formData.get("amount") ?? ""),
        category: String(formData.get("category") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setFormSuccess("Egreso registrado correctamente.");
      const refreshed = await listFinancesAction();
      if (refreshed.ok) setData(refreshed.data);
    });
  }

  function handleCreatePurchase(formData: FormData) {
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await createPurchaseAction({
        date: String(formData.get("date") ?? ""),
        supplier: String(formData.get("supplier") ?? ""),
        description: String(formData.get("description") ?? ""),
        amount: String(formData.get("amount") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setFormSuccess("Compra registrada correctamente.");
      const refreshed = await listFinancesAction();
      if (refreshed.ok) setData(refreshed.data);
    });
  }

  if (!result.ok) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={<CreditCard className="size-5" />}
          title="No pudimos cargar las finanzas"
          description={result.error}
        />
      </div>
    );
  }

  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;
  const totalPurchases = data?.totalPurchases ?? 0;
  const balance = totalIncome - totalExpenses - totalPurchases;

  return (
    <div className="mt-6 space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Ingresos"
          amount={totalIncome}
          icon={<TrendingUp className="size-4" />}
          tone="success"
        />
        <SummaryCard
          label="Egresos"
          amount={totalExpenses}
          icon={<TrendingDown className="size-4" />}
          tone="danger"
        />
        <SummaryCard
          label="Compras"
          amount={totalPurchases}
          icon={<ShoppingCart className="size-4" />}
          tone="warning"
        />
        <SummaryCard
          label="Balance"
          amount={balance}
          icon={<CreditCard className="size-4" />}
          tone={balance >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Tabs + search */}
      <div className="rounded-md border bg-card">
        <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                  setFormError("");
                  setFormSuccess("");
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar registros..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        {activeTab === "income" && (
          <IncomeTable records={filteredIncome} />
        )}
        {activeTab === "expenses" && (
          <ExpenseTable records={filteredExpenses} />
        )}
        {activeTab === "purchases" && (
          <PurchaseTable records={filteredPurchases} />
        )}
      </div>

      {/* Create form */}
      {activeTab === "income" && (
        <IncomeForm
          error={formError}
          success={formSuccess}
          isPending={isPending}
          onSubmit={handleCreateIncome}
        />
      )}
      {activeTab === "expenses" && (
        <ExpenseForm
          error={formError}
          success={formSuccess}
          isPending={isPending}
          onSubmit={handleCreateExpense}
        />
      )}
      {activeTab === "purchases" && (
        <PurchaseForm
          error={formError}
          success={formSuccess}
          isPending={isPending}
          onSubmit={handleCreatePurchase}
        />
      )}
    </div>
  );
}

// --- Summary Card ---

type SummaryCardProps = {
  label: string;
  amount: number;
  icon: ReactNode;
  tone: "success" | "danger" | "warning";
};

const toneStyles: Record<SummaryCardProps["tone"], string> = {
  success:
    "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400",
  danger:
    "border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  warning:
    "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
};

function SummaryCard({ label, amount, icon, tone }: SummaryCardProps) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-md border",
            toneStyles[tone],
          )}
        >
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight">
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

// --- Tables ---

function IncomeTable({ records }: { records: IncomeRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<ArrowUpCircle className="size-5" />}
          title="Sin ingresos registrados"
          description="Registra el primer ingreso del consultorio."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="hidden grid-cols-[1fr_0.8fr_0.7fr_0.6fr_auto] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Concepto</span>
        <span>Paciente</span>
        <span>Fecha</span>
        <span className="text-right">Monto</span>
        <span>Creador</span>
      </div>
      <div className="divide-y">
        {records.map((r) => (
          <div
            key={r.id}
            className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_0.8fr_0.7fr_0.6fr_auto] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{r.concept}</p>
              {r.notes && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {r.notes}
                </p>
              )}
            </div>
            <p className="text-muted-foreground">
              {r.patient
                ? `${r.patient.firstName} ${r.patient.lastName}`
                : "—"}
            </p>
            <p className="text-muted-foreground">{formatDate(r.date)}</p>
            <p className="text-right font-medium text-emerald-700 dark:text-emerald-400">
              {formatCurrency(r.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.creator.name ?? r.creator.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseTable({ records }: { records: ExpenseRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<ArrowDownCircle className="size-5" />}
          title="Sin egresos registrados"
          description="Registra el primer egreso del consultorio."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="hidden grid-cols-[1fr_0.7fr_0.6fr_0.6fr_auto] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Concepto</span>
        <span>Categoria</span>
        <span>Fecha</span>
        <span className="text-right">Monto</span>
        <span>Creador</span>
      </div>
      <div className="divide-y">
        {records.map((r) => (
          <div
            key={r.id}
            className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_0.7fr_0.6fr_0.6fr_auto] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{r.concept}</p>
              {r.notes && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {r.notes}
                </p>
              )}
            </div>
            <p className="text-muted-foreground">{r.category ?? "—"}</p>
            <p className="text-muted-foreground">{formatDate(r.date)}</p>
            <p className="text-right font-medium text-red-700 dark:text-red-400">
              {formatCurrency(r.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.creator.name ?? r.creator.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchaseTable({ records }: { records: PurchaseRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<ShoppingCart className="size-5" />}
          title="Sin compras registradas"
          description="Registra la primera compra del consultorio."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="hidden grid-cols-[0.8fr_1fr_0.6fr_0.6fr_auto] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Proveedor</span>
        <span>Descripcion</span>
        <span>Fecha</span>
        <span className="text-right">Monto</span>
        <span>Creador</span>
      </div>
      <div className="divide-y">
        {records.map((r) => (
          <div
            key={r.id}
            className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[0.8fr_1fr_0.6fr_0.6fr_auto] md:items-center md:gap-4"
          >
            <p className="truncate font-medium">{r.supplier}</p>
            <div className="min-w-0">
              <p className="truncate">{r.description}</p>
              {r.notes && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {r.notes}
                </p>
              )}
            </div>
            <p className="text-muted-foreground">{formatDate(r.date)}</p>
            <p className="text-right font-medium text-amber-700 dark:text-amber-400">
              {formatCurrency(r.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.creator.name ?? r.creator.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Forms ---

type FormProps = {
  error: string;
  success: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => void;
};

function FormAlerts({ error, success }: { error: string; success: string }) {
  return (
    <>
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 md:col-span-2">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 md:col-span-2">
          {success}
        </p>
      )}
    </>
  );
}

function FormField({
  label,
  name,
  placeholder,
  required = true,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}

function FormActions({ isPending, label }: { isPending: boolean; label: string }) {
  return (
    <div className="flex items-center justify-end gap-2 md:col-span-2">
      <button
        type="reset"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Limpiar
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Plus className="size-4" />
        {isPending ? "Guardando..." : label}
      </button>
    </div>
  );
}

function IncomeForm({ error, success, isPending, onSubmit }: FormProps) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold">Nuevo ingreso</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra un pago o cobro del consultorio.
        </p>
      </div>
      <form action={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
        <FormAlerts error={error} success={success} />
        <FormField label="Concepto" name="concept" placeholder="Ej. Limpieza dental" />
        <FormField label="Monto" name="amount" placeholder="150000" type="number" />
        <FormField label="Fecha" name="date" placeholder="" type="date" defaultValue={todayISO()} />
        <FormField label="ID Paciente (opcional)" name="patientId" placeholder="UUID del paciente" required={false} />
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            rows={2}
            name="notes"
            placeholder="Detalles adicionales..."
            className="min-h-16 resize-none rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <FormActions isPending={isPending} label="Guardar ingreso" />
      </form>
    </section>
  );
}

function ExpenseForm({ error, success, isPending, onSubmit }: FormProps) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold">Nuevo egreso</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra un gasto operativo del consultorio.
        </p>
      </div>
      <form action={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
        <FormAlerts error={error} success={success} />
        <FormField label="Concepto" name="concept" placeholder="Ej. Alquiler local" />
        <FormField label="Monto" name="amount" placeholder="500000" type="number" />
        <FormField label="Fecha" name="date" placeholder="" type="date" defaultValue={todayISO()} />
        <FormField label="Categoria (opcional)" name="category" placeholder="Ej. Servicios, Nomina" required={false} />
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            rows={2}
            name="notes"
            placeholder="Detalles adicionales..."
            className="min-h-16 resize-none rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <FormActions isPending={isPending} label="Guardar egreso" />
      </form>
    </section>
  );
}

function PurchaseForm({ error, success, isPending, onSubmit }: FormProps) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold">Nueva compra</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra una compra de insumos o materiales.
        </p>
      </div>
      <form action={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
        <FormAlerts error={error} success={success} />
        <FormField label="Proveedor" name="supplier" placeholder="Ej. Dental Supply Co" />
        <FormField label="Monto" name="amount" placeholder="200000" type="number" />
        <FormField label="Fecha" name="date" placeholder="" type="date" defaultValue={todayISO()} />
        <FormField label="Descripcion" name="description" placeholder="Ej. Resinas y composites" />
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            rows={2}
            name="notes"
            placeholder="Detalles adicionales..."
            className="min-h-16 resize-none rounded-md border bg-background px-3 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <FormActions isPending={isPending} label="Guardar compra" />
      </form>
    </section>
  );
}
