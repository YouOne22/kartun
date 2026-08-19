import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { PRIVATE_ROUTE_PREFIXES, ROLE_RESTRICTED_ROUTES } from "@/lib/auth-constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const isPrivateRoute = PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(session.isDefaultPassword ? "/change-password" : "/dashboard", request.url));
  }

  if (!isPrivateRoute) return NextResponse.next();
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  if (session.isDefaultPassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  const restrictedRoute = ROLE_RESTRICTED_ROUTES.find(({ prefix }) => pathname.startsWith(prefix));
  if (restrictedRoute && !restrictedRoute.roles.some((role) => role === session.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/kegiatan/scan-qr" && request.nextUrl.searchParams.get("mode") === "admin" && !["KETUA", "SEKRETARIS", "PENGURUS"].includes(session.role)) {
    return NextResponse.redirect(new URL("/kegiatan/scan-qr?mode=self", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

