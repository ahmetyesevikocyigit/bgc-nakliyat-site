import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveQuoteRequest } from "@/lib/quote-requests";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      phone?: string;
      service?: string;
      message?: string;
    };

    const quoteRequest = saveQuoteRequest({
      fullName: body.fullName || "",
      email: body.email || "",
      phone: body.phone || "",
      service: body.service || "",
      message: body.message || "",
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
