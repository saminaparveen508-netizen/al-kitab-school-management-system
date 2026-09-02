import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// ==========================================================
// This middleware runs before every /dashboard/* request.
// 1. withAuth() first makes sure the user is logged in
//    (redirects to /login otherwise, handled automatically).
// 2. The callback below then checks that the logged-in user's
//    role matches the dashboard section they're trying to open.
//    e.g. a "teacher" cannot open /dashboard/admin/*
// ==========================================================

const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  PARENT: "/dashboard/parent",
  STUDENT: "/dashboard/student",
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Map each dashboard sub-path to the role allowed to see it.
    const roleSection = pathname.split("/")[2]; // "admin" | "teacher" | "parent" | "student"

    if (roleSection && roleSection.toUpperCase() !== role) {
      // Trying to access someone else's section -> bounce to their own home.
      return NextResponse.redirect(new URL(roleHome[role] ?? "/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // must be logged in
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
