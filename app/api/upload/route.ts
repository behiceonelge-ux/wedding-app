import { NextResponse } from "next/server";
import {
  countGuestUploads,
  createPhotoRecord,
  ensureGuestExists,
  getEventBySlug,
  uploadPhotoToStorage
} from "@/lib/data";
import { MAX_UPLOADS_PER_GUEST } from "@/lib/constants";

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") || "");
  const guestId = String(formData.get("guestId") || "");
  const file = formData.get("file");

  if (!slug || !guestId || !(file instanceof File)) {
    return NextResponse.json({ error: "Geçersiz yükleme isteği" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Sadece görsel yüklenebilir" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  }

  await ensureGuestExists(event.id, guestId);

  const currentCount = await countGuestUploads(event.id, guestId);

  if (currentCount >= MAX_UPLOADS_PER_GUEST) {
    return NextResponse.json(
      {
        error: "Yükleme limiti doldu",
        remainingUploads: 0
      },
      { status: 400 }
    );
  }

  const { storagePath, publicUrl } = await uploadPhotoToStorage({
    eventSlug: event.slug,
    guestId,
    file
  });

  await createPhotoRecord({
    eventId: event.id,
    guestId,
    storagePath
  });

  const uploadedCount = currentCount + 1;

  return NextResponse.json({
    success: true,
    publicUrl,
    uploadedCount,
    remainingUploads: Math.max(0, MAX_UPLOADS_PER_GUEST - uploadedCount)
  });
}
