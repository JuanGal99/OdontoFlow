"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  Camera,
  FileImage,

  Plus,
  Search,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  createImageAction,
  deleteImageAction,
  listImagesAction,
} from "@/lib/clinical-images/actions";
import type { ImageRecord, ImageListResult } from "@/lib/clinical-images/queries";
import type { PatientRecord } from "@/lib/patients/queries";
import type { TreatmentRecord } from "@/lib/treatments/queries";
import { cn } from "@/lib/utils";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

type Props = {
  result: ActionResult<ImageListResult>;
  patients: PatientRecord[];
  treatments: TreatmentRecord[];
};

const typeLabels: Record<string, string> = {
  imagen: "Imagen",
  radiografia: "Radiografia",
};

const typeTones: Record<string, "default" | "success" | "warning"> = {
  imagen: "default",
  radiografia: "warning",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ImagesModule({ result, patients, treatments }: Props) {
  const initialImages = useMemo(
    () => (result.ok ? result.data.images : []),
    [result],
  );
  const [images, setImages] = useState(initialImages);
  const [total, setTotal] = useState(result.ok ? result.data.total : 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterPatient, setFilterPatient] = useState<string>("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");

  const filteredImages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return images;
    return images.filter((img) =>
      [
        img.description,
        img.patient?.firstName,
        img.patient?.lastName,
        img.treatment?.name,
        typeLabels[img.type],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [images, searchTerm]);

  function handleFilterChange(type: string, patient: string) {
    setFilterType(type);
    setFilterPatient(patient);
    startTransition(async () => {
      const res = await listImagesAction({
        type: (type as "imagen" | "radiografia") || undefined,
        patientId: patient || undefined,
      });
      if (res.ok) {
        setImages(res.data.images);
        setTotal(res.data.total);
      }
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
  }

  function handleUpload(formData: FormData) {
    setFormError("");
    setFormSuccess("");
    startTransition(async () => {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setFormError("Selecciona un archivo para subir.");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setFormError(err.error ?? "Error al subir el archivo.");
        return;
      }

      const { url } = await uploadRes.json();

      const patientId = String(formData.get("patientId") ?? "");
      const treatmentId = String(formData.get("treatmentId") ?? "") || undefined;
      const type = String(formData.get("type") ?? "imagen") as "imagen" | "radiografia";
      const description = String(formData.get("description") ?? "") || undefined;
      const takenAtRaw = String(formData.get("takenAt") ?? "");
      const takenAt = takenAtRaw || undefined;

      const res = await createImageAction({
        patientId,
        treatmentId: treatmentId ?? null,
        url,
        type,
        description,
        takenAt,
      });

      if (!res.ok) {
        setFormError(res.error);
        return;
      }

      setImages((prev) => [res.data, ...prev]);
      setTotal((prev) => prev + 1);
      setFormSuccess("Imagen registrada correctamente.");
      setShowUploadForm(false);
      setUploadPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleDelete(id: string) {
    setFormError("");
    startTransition(async () => {
      const res = await deleteImageAction(id);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== id));
      setTotal((prev) => prev - 1);
      if (previewImage?.id === id) setPreviewImage(null);
    });
  }

  if (!result.ok) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        {result.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Imagenes clinicas</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "imagen" : "imagenes"} registradas
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            setFormError("");
            setFormSuccess("");
            setUploadPreview("");
          }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {showUploadForm ? (
            <>
              <X className="size-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="size-4" /> Subir imagen
            </>
          )}
        </button>
      </div>

      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {formError}
        </div>
      )}
      {formSuccess && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          {formSuccess}
        </div>
      )}

      {/* Upload form */}
      {showUploadForm && (
        <div className="rounded-md border bg-background p-4">
          <h2 className="mb-4 text-sm font-semibold">Nueva imagen</h2>
          <form action={handleUpload} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Archivo *
                </label>
                <div className="flex items-center gap-4">
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50",
                      uploadPreview ? "w-fit" : "w-full justify-center",
                    )}
                  >
                    <Upload className="size-5" />
                    <span>{uploadPreview ? "Cambiar archivo" : "Seleccionar imagen (JPG, PNG, WebP, GIF - max 5MB)"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {uploadPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="size-20 rounded-md border object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="img-patient" className="mb-1.5 block text-sm font-medium">
                  Paciente *
                </label>
                <select
                  id="img-patient"
                  name="patientId"
                  required
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="img-treatment" className="mb-1.5 block text-sm font-medium">
                  Tratamiento (opcional)
                </label>
                <select
                  id="img-treatment"
                  name="treatmentId"
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin tratamiento</option>
                  {treatments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.patient.firstName} {t.patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="img-type" className="mb-1.5 block text-sm font-medium">
                  Tipo *
                </label>
                <select
                  id="img-type"
                  name="type"
                  required
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="imagen">Imagen</option>
                  <option value="radiografia">Radiografia</option>
                </select>
              </div>

              <div>
                <label htmlFor="img-takenAt" className="mb-1.5 block text-sm font-medium">
                  Fecha de toma (opcional)
                </label>
                <input
                  id="img-takenAt"
                  type="date"
                  name="takenAt"
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="img-desc" className="mb-1.5 block text-sm font-medium">
                  Descripcion (opcional)
                </label>
                <textarea
                  id="img-desc"
                  name="description"
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ej: Radiografia periapical diente 36"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Camera className="size-4" />
                {isPending ? "Subiendo..." : "Registrar imagen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por paciente, tratamiento, descripcion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value, filterPatient)}
          className="h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los tipos</option>
          <option value="imagen">Imagen</option>
          <option value="radiografia">Radiografia</option>
        </select>
        <select
          value={filterPatient}
          onChange={(e) => handleFilterChange(filterType, e.target.value)}
          className="h-9 max-w-48 rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los pacientes</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Gallery */}
      {filteredImages.length === 0 ? (
        <EmptyState
          icon={<FileImage className="size-5" />}
          title="Sin imagenes"
          description={
            searchTerm || filterType || filterPatient
              ? "No se encontraron imagenes con esos filtros."
              : "Aun no hay imagenes clinicas registradas. Sube la primera."
          }
          action={
            !showUploadForm && !searchTerm && !filterType && !filterPatient ? (
              <button
                type="button"
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" /> Subir imagen
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-md border bg-background transition-shadow hover:shadow-md"
            >
              <div
                className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
                onClick={() => setPreviewImage(img)}
              >
                <Image
                  src={img.url}
                  alt={img.description ?? "Imagen clinica"}
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  <ZoomIn className="size-6 text-white" />
                </div>
              </div>
              <div className="space-y-1.5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge tone={typeTones[img.type]}>
                    {typeLabels[img.type]}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(img.createdAt)}
                  </span>
                </div>
                <p className="truncate text-sm font-medium">
                  {img.patient?.firstName} {img.patient?.lastName}
                </p>
                {img.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {img.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {previewImage.patient?.firstName} {previewImage.patient?.lastName}
                  {previewImage.treatment && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      — {previewImage.treatment.name}
                    </span>
                  )}
                </h3>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(previewImage.id)}
                  disabled={isPending}
                  className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-muted/30 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.description ?? "Imagen clinica"}
                className="max-h-[60vh] rounded-md object-contain"
              />
            </div>
            <div className="border-t px-4 py-3">
              <div className="flex flex-wrap gap-4 text-sm">
                <DetailItem label="Tipo">
                  <StatusBadge tone={typeTones[previewImage.type]}>
                    {typeLabels[previewImage.type]}
                  </StatusBadge>
                </DetailItem>
                {previewImage.description && (
                  <DetailItem label="Descripcion">
                    {previewImage.description}
                  </DetailItem>
                )}
                {previewImage.takenAt && (
                  <DetailItem label="Fecha de toma">
                    {formatDate(previewImage.takenAt)}
                  </DetailItem>
                )}
                <DetailItem label="Registrada">
                  {formatDate(previewImage.createdAt)}
                </DetailItem>
                {previewImage.uploader && (
                  <DetailItem label="Subida por">
                    {previewImage.uploader.name}
                  </DetailItem>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
