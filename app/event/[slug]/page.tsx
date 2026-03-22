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
          <div className="mt-4 space-y-3 text-center">
            <p className="text-2xl font-semibold leading-8 text-ink">📸 O anı yakala, bizimle paylaş!</p>
            <p className="text-sm leading-6 text-ink/70">
              Düğün boyunca çektiğin fotoğrafları buraya yükleyerek anılarımıza katkıda bulunabilirsin.
            </p>
            <p className="text-sm leading-6 text-ink/80">
              💌 Fotoğraf eklemek için lütfen adınızı ve soyadınızı giriniz.
            </p>
          </div>
        </section>

        <UploadCard eventSlug={event.slug} eventName={event.name} />
      </div>
    </main>
  );
}
