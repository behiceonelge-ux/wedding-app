import { notFound } from "next/navigation";
import UploadCard from "@/components/upload-card";
import { getEventBySlug } from "@/lib/data";

type EventPageProps = {
  params: {
    slug: string;
  };
};

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-clay">Etkinlik</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{event.name}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Fotoğrafınızı çekip hemen yükleyin. Her misafir için en fazla 30 fotoğraf yüklenebilir.
          </p>
        </section>

        <UploadCard eventSlug={event.slug} eventName={event.name} />
      </div>
    </main>
  );
}
