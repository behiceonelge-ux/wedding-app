import { NextRequest, NextResponse } from "next/server";
import { ensureGuestAndCountUploads, getEventBySlug } from "@/lib/data";
import { MAX_UPLOADS_PER_GUEST } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const guestId = request.nextUrl.searchParams.get("guestId");

  if (!slug || !guestId) {
    return NextResponse.json({ error: "Missing slug or guestId" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const uploadedCount = await ensureGuestAndCountUploads(event.id, guestId);

  return NextResponse.json({
    uploadedCount,
    remainingUploads: Math.max(0, MAX_UPLOADS_PER_GUEST - uploadedCount)
  });
}
