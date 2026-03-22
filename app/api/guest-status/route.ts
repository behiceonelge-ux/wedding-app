import { NextRequest, NextResponse } from "next/server";
import { ensureGuestAndCountUploads, getEventBySlug } from "@/lib/data";
import { MAX_UPLOADS_PER_GUEST } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const firstName = request.nextUrl.searchParams.get("first_name");
  const lastName = request.nextUrl.searchParams.get("last_name");

  if (!slug || !firstName || !lastName) {
    return NextResponse.json({ error: "Eksik ad veya soyad bilgisi" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  }

  const { uploadedCount } = await ensureGuestAndCountUploads({
    eventId: event.id,
    firstName,
    lastName
  });

  return NextResponse.json({
    uploadedCount,
    remainingUploads: Math.max(0, MAX_UPLOADS_PER_GUEST - uploadedCount)
  });
}
