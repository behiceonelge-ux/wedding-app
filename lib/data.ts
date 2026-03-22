import { getStorageBucket, getSupabaseAdmin } from "@/lib/supabase";

type EventRow = {
  id: string;
  slug: string;
  name: string;
};

type GuestIdentityInput = {
  eventId: string;
  firstName: string;
  lastName: string;
};

type PhotoRecordInput = {
  eventId: string;
  guestId: string;
  storagePath: string;
};

type UploadPhotoInput = {
  eventSlug: string;
  guestId: string;
  file: File;
};

export async function getEventBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").select("id, slug, name").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as EventRow | null;
}

function normalizeGuestNamePart(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

function getGuestIdentity(firstName: string, lastName: string) {
  return {
    firstName: normalizeGuestNamePart(firstName),
    lastName: normalizeGuestNamePart(lastName)
  };
}

export async function findOrCreateGuest({ eventId, firstName, lastName }: GuestIdentityInput) {
  const supabase = getSupabaseAdmin();
  const identity = getGuestIdentity(firstName, lastName);
  const { data: existingGuest, error: selectError } = await supabase
    .from("guests")
    .select("id")
    .eq("event_id", eventId)
    .eq("first_name", identity.firstName)
    .eq("last_name", identity.lastName)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingGuest) {
    return {
      id: existingGuest.id as string,
      firstName: identity.firstName,
      lastName: identity.lastName
    };
  }

  const guestId = crypto.randomUUID();
  const { data: createdGuest, error: insertError } = await supabase
    .from("guests")
    .insert({
      id: guestId,
      event_id: eventId,
      first_name: identity.firstName,
      last_name: identity.lastName
    })
    .select("id")
    .single();

  if (insertError) {
    const { data: retryGuest, error: retryError } = await supabase
      .from("guests")
      .select("id")
      .eq("event_id", eventId)
      .eq("first_name", identity.firstName)
      .eq("last_name", identity.lastName)
      .maybeSingle();

    if (retryError || !retryGuest) {
      throw new Error(insertError.message);
    }

    return {
      id: retryGuest.id as string,
      firstName: identity.firstName,
      lastName: identity.lastName
    };
  }

  return {
    id: createdGuest.id as string,
    firstName: identity.firstName,
    lastName: identity.lastName
  };
}

export async function countGuestUploads(guestId: string) {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("guest_id", guestId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function ensureGuestAndCountUploads(input: GuestIdentityInput) {
  const guest = await findOrCreateGuest(input);
  const uploadedCount = await countGuestUploads(guest.id);

  return {
    guestId: guest.id,
    uploadedCount
  };
}

export async function uploadPhotoToStorage({ eventSlug, guestId, file }: UploadPhotoInput) {
  const supabase = getSupabaseAdmin();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `${eventSlug}/${guestId}/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(getStorageBucket())
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(getStorageBucket()).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl
  };
}

export async function createPhotoRecord({ eventId, guestId, storagePath }: PhotoRecordInput) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("photos").insert({
    event_id: eventId,
    guest_id: guestId,
    storage_path: storagePath
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAdminPhotosBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photos")
    .select("id, storage_path, created_at, events!inner(slug)")
    .eq("events.slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((photo) => {
    const { data: publicUrlData } = supabase.storage.from(getStorageBucket()).getPublicUrl(photo.storage_path);

    return {
      id: photo.id as string,
      storagePath: photo.storage_path as string,
      publicUrl: publicUrlData.publicUrl
    };
  });
}
