import { NextResponse, type NextRequest } from "next/server";

const adminCookieName = "bgc_admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");

  if (!pathname.startsWith("/admin") && request.method === "GET" && acceptsHtml) {
    response.cookies.delete(adminCookieName);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|images|icons|uploads).*)"],
};
