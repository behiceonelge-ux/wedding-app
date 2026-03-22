import { NextRequest, NextResponse } from "next/server";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function getGuestCookieName(slug: string) {
  return `guest_id_${slug}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { slug?: string; guestId?: string };
  const slug = (body.slug || "").trim();
  const guestId = (body.guestId || "").trim();

  if (!slug || !guestId) {
    return NextResponse.json({ error: "Missing slug or guestId" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, guestId });

  response.cookies.set({
    name: getGuestCookieName(slug),
    value: guestId,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  });

  return response;
}
