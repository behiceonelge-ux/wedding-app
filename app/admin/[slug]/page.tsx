import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AdminLoginForm from "@/components/admin-login-form";
import { getAdminCookieName, getAdminCookieValue } from "@/lib/admin-auth";
import { getAdminPhotosBySlug, getEventBySlug } from "@/lib/data";

type AdminPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    error?: string;
  };
};

function formatUploadTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const cookieStore = cookies();
  const cookieName = getAdminCookieName(params.slug);
  const session = cookieStore.get(cookieName)?.value;
  const isAuthenticated = session === getAdminCookieValue(params.slug);

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <AdminLoginForm slug={params.slug} eventName={event.name} hasError={searchParams?.error === "1"} />
      </main>
    );
  }

  const photos = await getAdminPhotosBySlug(params.slug);

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-clay">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{event.name}</h1>
          <p className="mt-2 text-sm text-ink/70">{photos.length} uploaded photos</p>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="flex flex-col rounded-2xl border border-line bg-card shadow-sm">
              <img
                src={photo.publicUrl}
                alt="Wedding guest upload"
                className="aspect-square w-full rounded-t-2xl object-cover"
              />
              <div className="px-3 pt-3">
                <p className="text-sm font-medium text-ink">
                  {photo.firstName} {photo.lastName}
                </p>
                <p className="mt-1 text-xs text-ink/60">{formatUploadTime(photo.createdAt)}</p>
              </div>
              <div className="flex gap-2 p-3">
                <a
                  href={photo.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 flex-1 items-center justify-center rounded-xl border border-line bg-white text-sm font-medium text-ink"
                >
                  View
                </a>
                <a
                  href={`/api/photos/download?path=${encodeURIComponent(photo.storagePath)}`}
                  download
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-ink text-sm font-medium text-white"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </section>

        {photos.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-line bg-card p-6 text-center text-sm text-ink/70">
            No photos uploaded yet.
          </section>
        ) : null}
      </div>
    </main>
  );
}
