import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "clinical");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No se recibio un archivo." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "El archivo excede el limite de 5 MB." },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, filename), buffer);

  const url = `/uploads/clinical/${filename}`;
  return NextResponse.json({ url });
}
