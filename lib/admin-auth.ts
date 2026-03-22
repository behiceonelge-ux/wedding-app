import { createHash } from "crypto";

export function getAdminCookieName(slug: string) {
  return `admin-${slug}`;
}

export function getAdminCookieValue(slug: string) {
  const password = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update(`${slug}:${password}`).digest("hex");
}
