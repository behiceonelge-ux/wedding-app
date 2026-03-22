type GuestFormValues = {
  firstName: string;
  lastName: string;
};

function getGuestNameStorageKey(eventSlug: string) {
  return `guest-name:${eventSlug}`;
}

function normalizeNamePart(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

function slugifyNamePart(value: string) {
  return normalizeNamePart(value)
    .replace(/[^a-z0-9\u00e7\u011f\u0131\u00f6\u015f\u00fc\s-]/gi, "")
    .replace(/\s+/g, "-");
}

export function buildGuestId(eventSlug: string, firstName: string, lastName: string) {
  const normalizedFirstName = slugifyNamePart(firstName);
  const normalizedLastName = slugifyNamePart(lastName);

  return `${eventSlug}:${normalizedFirstName}:${normalizedLastName}`;
}

export function saveGuestName(eventSlug: string, values: GuestFormValues) {
  window.localStorage.setItem(
    getGuestNameStorageKey(eventSlug),
    JSON.stringify({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim()
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
      firstName: (parsed.firstName || "").trim(),
      lastName: (parsed.lastName || "").trim()
    };
  } catch {
    return {
      firstName: "",
      lastName: ""
    };
  }
}
