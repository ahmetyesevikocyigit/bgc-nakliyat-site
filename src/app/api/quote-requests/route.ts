import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { NextResponse } from "next/server";
import { saveQuoteRequest } from "@/lib/quote-requests";
import { createSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function getUploadExtension(file: File) {
  const extension = extname(file.name).toLowerCase();

  if (extension) {
    return extension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

async function saveQuotePhotos(files: FormDataEntryValue[]) {
  const photoUrls: string[] = [];
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const relativeDirectory = `/uploads/quote-requests/${year}/${month}`;
  const absoluteDirectory = join(process.cwd(), "public", "uploads", "quote-requests", year, month);

  for (const fileValue of files.slice(0, 8)) {
    if (!(fileValue instanceof File) || fileValue.size === 0 || !fileValue.type.startsWith("image/")) {
      continue;
    }

    if (fileValue.size > 8_000_000) {
      continue;
    }

    await mkdir(absoluteDirectory, { recursive: true });
    const bytes = Buffer.from(await fileValue.arrayBuffer());
    const safeName = createSlug(fileValue.name.replace(/\.[^.]+$/, "")) || "tasima-fotografi";
    const fileName = `${safeName}-${Date.now()}-${photoUrls.length + 1}${getUploadExtension(fileValue)}`;
    await writeFile(join(absoluteDirectory, fileName), bytes);
    photoUrls.push(`${relativeDirectory}/${fileName}`);
  }

  return photoUrls;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const body =
      contentType.includes("multipart/form-data")
        ? await request.formData()
        : ((await request.json()) as {
            fullName?: string;
            email?: string;
            phone?: string;
            service?: string;
            fromAddress?: string;
            toAddress?: string;
            fromFloor?: string;
            toFloor?: string;
            roomCount?: string;
            moveDate?: string;
            elevatorNeed?: string;
            message?: string;
          });
    const isFormData = body instanceof FormData;
    const photoUrls = isFormData ? await saveQuotePhotos(body.getAll("photos")) : [];

    const quoteRequest = await saveQuoteRequest({
      fullName: isFormData ? cleanText(body.get("fullName")) : body.fullName || "",
      email: isFormData ? cleanText(body.get("email")) : body.email || "",
      phone: isFormData ? cleanText(body.get("phone")) : body.phone || "",
      service: isFormData ? cleanText(body.get("service")) : body.service || "",
      fromAddress: isFormData ? cleanText(body.get("fromAddress")) : body.fromAddress || "",
      toAddress: isFormData ? cleanText(body.get("toAddress")) : body.toAddress || "",
      fromFloor: isFormData ? cleanText(body.get("fromFloor")) : body.fromFloor || "",
      toFloor: isFormData ? cleanText(body.get("toFloor")) : body.toFloor || "",
      roomCount: isFormData ? cleanText(body.get("roomCount")) : body.roomCount || "",
      moveDate: isFormData ? cleanText(body.get("moveDate")) : body.moveDate || "",
      elevatorNeed: isFormData ? cleanText(body.get("elevatorNeed")) : body.elevatorNeed || "",
      photoUrls,
      message: isFormData ? cleanText(body.get("message")) : body.message || "",
    });

    revalidatePath("/admin");

    return NextResponse.json({ ok: true, quoteRequest });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Teklif talebi kaydedilemedi." },
      { status: 400 },
    );
  }
}
