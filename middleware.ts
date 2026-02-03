import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rotasProtegidas = ["/dashboard"];

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  const rotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota)
  );

  if (rotaProtegida && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && token) {
    const url = request.nextUrl.clone();
    const redirect = url.searchParams.get("redirect") || "/dashboard";
    url.pathname = redirect;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
