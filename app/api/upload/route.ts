import { NextResponse } from "next/server";
import {
  countGuestUploads,
  createPhotoRecord,
  findOrCreateGuest,
  getEventBySlug,
  uploadPhotoToStorage
} from "@/lib/data";
import { MAX_UPLOADS_PER_GUEST } from "@/lib/constants";

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") || "");
  const firstName = String(formData.get("first_name") || "");
  const lastName = String(formData.get("last_name") || "");
  const file = formData.get("file");

  if (!slug || !firstName || !lastName || !(file instanceof File)) {
    return NextResponse.json({ error: "Geçersiz yükleme isteği" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Sadece görsel yüklenebilir" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  }

  const guest = await findOrCreateGuest({
    eventId: event.id,
    firstName,
    lastName
  });
  const currentCount = await countGuestUploads(guest.id);

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
    guestId: guest.id,
    file
  });

  await createPhotoRecord({
    eventId: event.id,
    guestId: guest.id,
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
