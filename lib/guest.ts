const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
const guestInitializationPromises = new Map<string, Promise<string>>();

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getGuestStorageKey(eventSlug: string) {
  return `guest-id:${eventSlug}`;
}

function getGuestCookieName(eventSlug: string) {
  return `guest_id_${eventSlug}`;
}

function normalizeGuestId(value: string | null | undefined) {
  return (value || "").trim();
}

function isValidGuestId(value: string) {
  return value.length > 0;
}

function readGuestIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizeGuestId(params.get("g"));
}

function readCookie(name: string) {
  const cookieString = document.cookie;

  if (!cookieString) {
    return "";
  }

  const cookies = cookieString.split("; ");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return "";
}

function writeClientCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

function writeGuestIdToLocalStorage(eventSlug: string, guestId: string) {
  window.localStorage.setItem(getGuestStorageKey(eventSlug), guestId);
}

function readGuestIdFromLocalStorage(eventSlug: string) {
  return normalizeGuestId(window.localStorage.getItem(getGuestStorageKey(eventSlug)));
}

function readGuestIdFromCookie(eventSlug: string) {
  return normalizeGuestId(readCookie(getGuestCookieName(eventSlug)));
}

function updateGuestIdInUrl(guestId: string) {
  const url = new URL(window.location.href);

  if (url.searchParams.get("g") === guestId) {
    return;
  }

  url.searchParams.set("g", guestId);
  window.history.replaceState({}, "", url.toString());
}

async function persistGuestCookieOnServer(eventSlug: string, guestId: string) {
  const response = await fetch("/api/guest-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      slug: eventSlug,
      guestId
    }),
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error("Unable to persist guest session.");
  }
}

function resolveGuestId(eventSlug: string) {
  const guestIdFromUrl = readGuestIdFromUrl();

  if (isValidGuestId(guestIdFromUrl)) {
    return guestIdFromUrl;
  }

  const guestIdFromCookie = readGuestIdFromCookie(eventSlug);

  if (isValidGuestId(guestIdFromCookie)) {
    return guestIdFromCookie;
  }

  const guestIdFromLocalStorage = readGuestIdFromLocalStorage(eventSlug);

  if (isValidGuestId(guestIdFromLocalStorage)) {
    return guestIdFromLocalStorage;
  }

  return randomId();
}

export async function initializeGuestId(eventSlug: string) {
  const existingPromise = guestInitializationPromises.get(eventSlug);

  if (existingPromise) {
    return existingPromise;
  }

  const initializationPromise = (async () => {
    const guestId = resolveGuestId(eventSlug);
    const cookieName = getGuestCookieName(eventSlug);

    writeGuestIdToLocalStorage(eventSlug, guestId);
    writeClientCookie(cookieName, guestId);
    updateGuestIdInUrl(guestId);

    try {
      await persistGuestCookieOnServer(eventSlug, guestId);
    } catch {
      // Keep the client-side fallback so Safari resume still has the same guest token.
    }

    writeGuestIdToLocalStorage(eventSlug, guestId);
    writeClientCookie(cookieName, guestId);
    updateGuestIdInUrl(guestId);

    return guestId;
  })();

  guestInitializationPromises.set(eventSlug, initializationPromise);

  try {
    return await initializationPromise;
  } finally {
    guestInitializationPromises.delete(eventSlug);
  }
}
