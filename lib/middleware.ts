import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, decodeSession } from "@/lib/auth";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/dashboard";

const PROTECTED_PATHS = [
  "/dashboard",
  "/pusat-persetujuan",
  "/verifikasi-eco",
  "/kelola-mitra",
  "/kelola-paket",
  "/pengaturan",
  "/profil-bisnis",
  "/verifikasi-dokumen",
  "/booking-manage",
  "/reviews",
  "/impact-analytics",
  "/eco-verification",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = decodeSession(rawCookie ? decodeURIComponent(rawCookie) : undefined);

  if (pathname === "/") {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (pathname === LOGIN_PATH && session) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};