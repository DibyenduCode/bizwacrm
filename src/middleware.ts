import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // If Supabase environment variables are missing (e.g. initial setup), pass through cleanly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

  const pathname = request.nextUrl.pathname;

  // Fetch user profile status and role if authenticated
  let isSuperAdmin = false;
  let userStatus = "pending";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, is_super_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      isSuperAdmin = Boolean(profile.is_super_admin);
      userStatus = profile.status || "pending";
    }
  }

  // ============================================================
  // 1. SUPER ADMIN ROUTES (/admin/*)
  // ============================================================
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // If already logged in as super admin, send to /admin dashboard
      if (user && isSuperAdmin) {
        return withRefreshedCookies(
          NextResponse.redirect(new URL("/admin", request.url))
        );
      }
      return supabaseResponse;
    }

    // All other /admin routes require super admin
    if (!user) {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/admin/login", request.url))
      );
    }

    if (!isSuperAdmin) {
      // Normal user trying to access Super Admin panel
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/dashboard", request.url))
      );
    }

    return supabaseResponse;
  }

  // ============================================================
  // 2. SUPER ADMIN VISITING NON-ADMIN ROUTES
  // (Super admin is dedicated solely to user management)
  // ============================================================
  if (user && isSuperAdmin) {
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/pending-approval" ||
      pathname === "/account-deactivated" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/inbox") ||
      pathname.startsWith("/contacts") ||
      pathname.startsWith("/pipelines") ||
      pathname.startsWith("/broadcasts") ||
      pathname.startsWith("/automations") ||
      pathname.startsWith("/settings")
    ) {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/admin", request.url))
      );
    }
  }

  // ============================================================
  // 3. NOTICE PAGES (/pending-approval & /account-deactivated)
  // ============================================================
  if (pathname === "/pending-approval" || pathname === "/account-deactivated") {
    if (!user) {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/login", request.url))
      );
    }

    if (userStatus === "active") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/dashboard", request.url))
      );
    }

    if (userStatus === "deactivated" && pathname !== "/account-deactivated") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/account-deactivated", request.url))
      );
    }

    if (userStatus === "pending" && pathname !== "/pending-approval") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/pending-approval", request.url))
      );
    }

    return supabaseResponse;
  }

  // ============================================================
  // 4. AUTH PAGES (/login, /signup, /forgot-password)
  // ============================================================
  if (
    user &&
    (pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password")
  ) {
    if (userStatus === "deactivated") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/account-deactivated", request.url))
      );
    }

    if (userStatus === "pending") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/pending-approval", request.url))
      );
    }

    // Active user: check invite token or go to dashboard
    const url = request.nextUrl.clone();
    const inviteToken = request.nextUrl.searchParams.get("invite");
    if (
      inviteToken &&
      (pathname === "/login" || pathname === "/signup")
    ) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`;
      url.search = "";
    } else {
      url.pathname = "/dashboard";
      url.search = "";
    }
    return withRefreshedCookies(NextResponse.redirect(url));
  }

  // ============================================================
  // 5. PROTECTED CRM PAGES
  // ============================================================
  const protectedPaths = [
    "/dashboard",
    "/inbox",
    "/contacts",
    "/pipelines",
    "/broadcasts",
    "/automations",
    "/settings",
  ];

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return withRefreshedCookies(NextResponse.redirect(url));
    }

    if (userStatus === "deactivated") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/account-deactivated", request.url))
      );
    }

    if (userStatus === "pending") {
      return withRefreshedCookies(
        NextResponse.redirect(new URL("/pending-approval", request.url))
      );
    }
  }

  // ============================================================
  // 6. API ROUTES THAT REQUIRE AUTH (Not Webhooks)
  // ============================================================
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/api/whatsapp/") &&
    !request.nextUrl.pathname.includes("/webhook")
  ) {
    return withRefreshedCookies(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
