import { isRedirectError } from "next/dist/client/components/redirect-error";
import { NextResponse } from "next/server";
import { saveAdminContentAction } from "@/app/admin/actions";

export async function POST(request: Request) {
  try {
    await saveAdminContentAction(await request.formData());
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Admin content save failed", error);

    return NextResponse.redirect(new URL("/admin?error=content&section=overview", request.url), {
      status: 303,
    });
  }

  return NextResponse.redirect(new URL("/admin?saved=1", request.url), { status: 303 });
}
