type GuestFormValues = {
  firstName: string;
  lastName: string;
};

function getGuestNameStorageKey(eventSlug: string) {
  return `guest-name:${eventSlug}`;
}

function normalizeNamePart(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function saveGuestName(eventSlug: string, values: GuestFormValues) {
  window.localStorage.setItem(
    getGuestNameStorageKey(eventSlug),
    JSON.stringify({
      firstName: normalizeNamePart(values.firstName),
      lastName: normalizeNamePart(values.lastName)
    })
  );
}

export function loadGuestName(eventSlug: string): GuestFormValues {
  const rawValue = window.localStorage.getItem(getGuestNameStorageKey(eventSlug));

  if (!rawValue) {
    return {
      firstName: "",
      lastName: ""
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<GuestFormValues>;

    return {
      firstName: normalizeNamePart(parsed.firstName || ""),
      lastName: normalizeNamePart(parsed.lastName || "")
    };
  } catch {
    return {
      firstName: "",
      lastName: ""
    };
  }
}
