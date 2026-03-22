const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

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

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

export function getOrCreateGuestId(eventSlug: string) {
  const storageKey = getGuestStorageKey(eventSlug);
  const cookieName = getGuestCookieName(eventSlug);
  const cookieGuestId = readCookie(cookieName);

  if (cookieGuestId) {
    window.localStorage.setItem(storageKey, cookieGuestId);
    return cookieGuestId;
  }

  const localStorageGuestId = window.localStorage.getItem(storageKey);

  if (localStorageGuestId) {
    writeCookie(cookieName, localStorageGuestId);
    return localStorageGuestId;
  }

  const nextId = randomId();
  window.localStorage.setItem(storageKey, nextId);
  writeCookie(cookieName, nextId);
  return nextId;
}
