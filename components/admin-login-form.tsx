type AdminLoginFormProps = {
  slug: string;
  eventName: string;
  hasError: boolean;
};

export default function AdminLoginForm({ slug, eventName, hasError }: AdminLoginFormProps) {
  return (
    <section className="w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-clay">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{eventName}</h1>
      <p className="mt-2 text-sm text-ink/70">Enter the admin password to view uploaded photos.</p>

      <form action="/api/admin/login" method="post" className="mt-5 flex flex-col gap-3">
        <input type="hidden" name="slug" value={slug} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none ring-0 placeholder:text-ink/35"
        />
        <button
          type="submit"
          className="h-12 rounded-2xl bg-ink text-base font-medium text-white transition hover:bg-ink/95"
        >
          Open gallery
        </button>
      </form>

      {hasError ? <p className="mt-3 text-sm text-red-700">Incorrect password.</p> : null}
    </section>
  );
}
