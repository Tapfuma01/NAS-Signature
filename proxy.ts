import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthEnabled,
  verifySessionToken,
} from "@/lib/auth/session-token";
import { canAccessOrgSettings } from "@/lib/auth/roles";
import { SECURITY_HEADERS } from "@/lib/security/headers";

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/admin/login")) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (!isAdminAuthEnabled()) {
    return withSecurityHeaders(NextResponse.next());
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    const login = new URL("/", request.url);
    login.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(login));
  }

  if (pathname.startsWith("/admin/settings") && !canAccessOrgSettings(session.role)) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/admin/forbidden", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*"],
};
