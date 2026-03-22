import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieName, getAdminCookieValue } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") || "");
  const password = String(formData.get("password") || "");

  if (!slug) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.redirect(new URL(`/admin/${slug}?error=1`, request.url), 303);
  }

  const response = NextResponse.redirect(new URL(`/admin/${slug}`, request.url), 303);

  response.cookies.set({
    name: getAdminCookieName(slug),
    value: getAdminCookieValue(slug),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/admin/${slug}`,
    maxAge: 60 * 60 * 12
  });

  return response;
}
