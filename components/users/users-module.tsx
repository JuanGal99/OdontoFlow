"use client";

import type { ComponentType } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Plus,
  Search,
  Shield,
  UserRound,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  createUserAction,
  updateUserAction,
  resetPasswordAction,
  toggleUserActiveAction,
} from "@/lib/users/actions";
import type { UserRecord, UserListResult } from "@/lib/users/queries";
import { cn } from "@/lib/utils";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

type Props = {
  result: ActionResult<UserListResult>;
};

const roleLabels: Record<string, string> = {
  professional: "Profesional",
  auxiliary: "Auxiliar",
};

const roleTones: Record<string, "default" | "success" | "warning"> = {
  professional: "success",
  auxiliary: "default",
};

export function UsersModule({ result }: Props) {
  const initialUsers = useMemo(
    () => (result.ok ? result.data.users : []),
    [result],
  );
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0]?.id ?? "");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.username, u.email, roleLabels[u.role]]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [users, searchTerm]);

  const selectedUser =
    users.find((u) => u.id === selectedUserId) ?? filteredUsers[0] ?? null;

  function handleCreate(formData: FormData) {
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await createUserAction({
        username: String(formData.get("username") ?? ""),
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setUsers((cur) => [res.data, ...cur]);
      setSelectedUserId(res.data.id);
      setFormSuccess("Usuario auxiliar creado correctamente.");
    });
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await updateUserAction({
        id,
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        isActive: formData.get("isActive") === "on",
      });
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setUsers((cur) => cur.map((u) => (u.id === res.data.id ? res.data : u)));
      setFormSuccess("Usuario actualizado correctamente.");
    });
  }

  function handleResetPassword(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await resetPasswordAction({
        id,
        password: String(formData.get("password") ?? ""),
      });
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setFormSuccess("Contrasena actualizada correctamente.");
    });
  }

  function handleToggleActive(id: string) {
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const res = await toggleUserActiveAction(id);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setUsers((cur) => cur.map((u) => (u.id === res.data.id ? res.data : u)));
      setFormSuccess(
        res.data.isActive
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente.",
      );
    });
  }

  if (!result.ok) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={<UsersRound className="size-5" />}
          title="No pudimos cargar los usuarios"
          description={result.error}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-md border bg-card">
          <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, usuario o correo"
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} de {users.length} usuarios
            </p>
          </div>

          {users.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<UsersRound className="size-5" />}
                title="No hay usuarios auxiliares"
                description="Crea el primer usuario auxiliar para delegar tareas operativas."
              />
            </div>
          ) : filteredUsers.length > 0 ? (
            <UserTable
              users={filteredUsers}
              selectedUserId={selectedUser?.id ?? ""}
              onSelectUser={setSelectedUserId}
            />
          ) : (
            <div className="p-4">
              <EmptyState
                icon={<UsersRound className="size-5" />}
                title="No hay usuarios para esta busqueda"
                description="Prueba con otro nombre, usuario o correo."
              />
            </div>
          )}
        </div>

        <NewUserForm
          error={formError}
          isPending={isPending}
          onCreateUser={handleCreate}
          success={formSuccess}
        />
      </section>

      <UserDetail
        error={formError}
        isPending={isPending}
        onUpdateUser={handleUpdate}
        onResetPassword={handleResetPassword}
        onToggleActive={handleToggleActive}
        success={formSuccess}
        user={selectedUser}
      />
    </div>
  );
}

type UserTableProps = {
  users: UserRecord[];
  selectedUserId: string;
  onSelectUser: (id: string) => void;
};

function UserTable({ users, selectedUserId, onSelectUser }: UserTableProps) {
  return (
    <div className="overflow-hidden">
      <div className="hidden grid-cols-[1.3fr_0.9fr_0.9fr_auto] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Usuario</span>
        <span>Correo</span>
        <span>Rol</span>
        <span>Estado</span>
      </div>
      <div className="divide-y">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onSelectUser(user.id)}
            className={cn(
              "grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 md:grid-cols-[1.3fr_0.9fr_0.9fr_auto] md:items-center",
              selectedUserId === user.id && "bg-muted/50",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {user.name ?? user.username}
              </span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">
                @{user.username}
              </span>
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {user.email}
            </span>
            <StatusBadge tone={roleTones[user.role]}>
              {roleLabels[user.role] ?? user.role}
            </StatusBadge>
            <StatusBadge tone={user.isActive ? "success" : "warning"}>
              {user.isActive ? "Activo" : "Inactivo"}
            </StatusBadge>
          </button>
        ))}
      </div>
    </div>
  );
}

type NewUserFormProps = {
  error: string;
  isPending: boolean;
  onCreateUser: (formData: FormData) => void;
  success: string;
};

function NewUserForm({ error, isPending, onCreateUser, success }: NewUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Nuevo auxiliar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea un usuario auxiliar para tu consultorio.
            </p>
          </div>
        </div>
      </div>

      <form action={onCreateUser} className="grid gap-4 p-5 md:grid-cols-2">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 md:col-span-2">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 md:col-span-2">
            {success}
          </p>
        ) : null}

        <FormField label="Nombre completo" name="name" placeholder="Ej. Maria Lopez" />
        <FormField label="Nombre de usuario" name="username" placeholder="Ej. maria.lopez" />
        <FormField label="Correo electronico" name="email" placeholder="auxiliar@ejemplo.com" type="email" />
        <label className="grid gap-2 text-sm font-medium">
          Contrasena
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={8}
              placeholder="Minimo 8 caracteres"
              className="h-10 w-full rounded-md border bg-background px-3 pr-10 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>

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
            {isPending ? "Guardando..." : "Crear auxiliar"}
          </button>
        </div>
      </form>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
};

function FormField({ label, name, placeholder, required = true, type = "text" }: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-10 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}

type UserDetailProps = {
  error: string;
  isPending: boolean;
  onUpdateUser: (formData: FormData) => void;
  onResetPassword: (formData: FormData) => void;
  onToggleActive: (id: string) => void;
  success: string;
  user: UserRecord | null;
};

function UserDetail({
  error,
  isPending,
  onUpdateUser,
  onResetPassword,
  onToggleActive,
  success,
  user,
}: UserDetailProps) {
  const [showResetPassword, setShowResetPassword] = useState(false);

  if (!user) {
    return (
      <EmptyState
        icon={<UserRound className="size-5" />}
        title="Selecciona un usuario"
        description="El detalle aparecera aqui cuando selecciones un usuario de la lista."
      />
    );
  }

  const isProfessional = user.role === "professional";

  return (
    <aside className="h-fit rounded-md border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">
              {user.name ?? user.username}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <StatusBadge tone={user.isActive ? "success" : "warning"}>
            {user.isActive ? "Activo" : "Inactivo"}
          </StatusBadge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3">
          <DetailItem icon={Mail} label="Correo" value={user.email} />
          <DetailItem
            icon={Shield}
            label="Rol"
            value={roleLabels[user.role] ?? user.role}
          />
          <DetailItem
            icon={UserRound}
            label="Creado"
            value={new Date(user.createdAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </div>

        {isProfessional ? (
          <div className="rounded-md border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              Las cuentas de profesional no se pueden editar desde este panel.
            </p>
          </div>
        ) : (
          <>
            <form action={onUpdateUser} className="grid gap-3 border-t pt-5">
              <input name="id" type="hidden" value={user.id} />
              <p className="text-sm font-medium">Editar usuario</p>
              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  {success}
                </p>
              ) : null}
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                defaultValue={user.name ?? ""}
                name="name"
                placeholder="Nombre"
                required
              />
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                defaultValue={user.email}
                name="email"
                placeholder="Correo"
                required
                type="email"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  defaultChecked={user.isActive}
                  name="isActive"
                  type="checkbox"
                />
                Activo
              </label>
              <button
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>

            <div className="grid gap-3 border-t pt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Contrasena</p>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <KeyRound className="size-3.5" />
                  {showResetPassword ? "Cancelar" : "Restablecer"}
                </button>
              </div>
              {showResetPassword ? (
                <form action={onResetPassword} className="grid gap-3">
                  <input name="id" type="hidden" value={user.id} />
                  <input
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                    name="password"
                    placeholder="Nueva contrasena (min. 8 caracteres)"
                    required
                    minLength={8}
                    type="password"
                  />
                  <button
                    className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? "Guardando..." : "Cambiar contrasena"}
                  </button>
                </form>
              ) : null}
            </div>

            <div className="border-t pt-5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => onToggleActive(user.id)}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60",
                  user.isActive
                    ? "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950",
                )}
              >
                {user.isActive ? "Desactivar usuario" : "Activar usuario"}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

type DetailItemProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm">{value}</p>
      </div>
    </div>
  );
}
