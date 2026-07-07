import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { saveQuoteRequest } from "@/lib/quote-requests";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";
import { createSlug } from "@/lib/slug";
import { maxQuoteImageUploadSize, readValidatedImageUpload } from "@/lib/upload-validation";

export const dynamic = "force-dynamic";

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

async function saveQuotePhotos(files: FormDataEntryValue[]) {
  const photoUrls: string[] = [];
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const relativeDirectory = `/uploads/quote-requests/${year}/${month}`;
  const absoluteDirectory = join(process.cwd(), "public", "uploads", "quote-requests", year, month);

  for (const fileValue of files.slice(0, 8)) {
    if (!(fileValue instanceof File) || fileValue.size === 0) {
      continue;
    }

    const imageUpload = await readValidatedImageUpload(fileValue, maxQuoteImageUploadSize);

    if (!imageUpload.ok) {
      throw new Error(imageUpload.error);
    }

    await mkdir(absoluteDirectory, { recursive: true });
    const safeName = createSlug(fileValue.name.replace(/\.[^.]+$/, "")) || "tasima-fotografi";
    const fileName = `${safeName}-${Date.now()}-${photoUrls.length + 1}.webp`;
    const webpBytes = await sharp(imageUpload.bytes)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(join(absoluteDirectory, fileName), webpBytes);
    photoUrls.push(`${relativeDirectory}/${fileName}`);
  }

  return photoUrls;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIpFromHeaders(request.headers);
    const rateLimit = checkRateLimit({
      key: `quote:${clientIp}`,
      limit: 12,
      windowMs: 10 * 60 * 1000,
      blockMs: 20 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, message: "Çok fazla teklif talebi gönderildi. Lütfen biraz sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

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
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Teklif talebi kaydedilemedi." },
      { status: 400 },
    );
  }
}
