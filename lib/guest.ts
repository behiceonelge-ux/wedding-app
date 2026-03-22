function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateGuestId(eventSlug: string) {
  const key = `guest-id:${eventSlug}`;
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const nextId = randomId();
  window.localStorage.setItem(key, nextId);
  return nextId;
}
