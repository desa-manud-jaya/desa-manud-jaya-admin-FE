import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, decodeSession } from "@/lib/auth";

const LOGIN_PATH = "/login";

// Silakan sesuaikan kalau nanti akses partner berubah
const PARTNER_ALLOWED_PATHS = [
  "/",
  "/profil-bisnis",
  "/verifikasi-dokumen",
  "/kelola-paket",
  "/pengaturan",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = decodeSession(rawCookie ? decodeURIComponent(rawCookie) : undefined);

  const isLoginPage = pathname === LOGIN_PATH;

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (session?.role === "partner") {
    const isAllowed = PARTNER_ALLOWED_PATHS.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path)
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\..*).*)"],
};