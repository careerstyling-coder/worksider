// @TASK P1-R1-T3 - Auth middleware with protected route guards
// @SPEC docs/planning/02-trd.md#Auth-Guards

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication (redirect to /signup if unauthenticated)
const PROTECTED_ROUTES = ["/my-dna", "/suggest"];

// Routes that require admin role (redirect to / if not admin)
const ADMIN_ROUTES = ["/admin"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// Admin login page is public
const ADMIN_PUBLIC = ["/admin/login"];

function isAdminRoute(pathname: string): boolean {
  if (ADMIN_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return false;
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // prelaunch 및 공개 경로는 인증 불필요 — 바로 통과
  if (
    pathname.startsWith('/prelaunch') ||
    pathname.startsWith('/api/') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 — getUser()는 항상 서버에서 auth 토큰을 검증
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호 라우트: 미인증 시 /signup으로 리다이렉트
  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    return NextResponse.redirect(url);
  }

  // 관리자 라우트: 미인증 시 /admin/login, 비관리자 시 /로 리다이렉트
  if (isAdminRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // 미들웨어에서 DB 조회로 admin 역할 확인
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
