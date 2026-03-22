export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-card p-6 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-clay">Wedding Upload</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Ready to use</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          Open an event page at <code>/event/[slug]</code> for guests or{" "}
          <code>/admin/[slug]</code> for the gallery admin view.
        </p>
      </div>
    </main>
  );
}
