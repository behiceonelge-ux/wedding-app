export default function EventNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-line bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Etkinlik bulunamadı</h1>
        <p className="mt-3 text-sm text-ink/70">
          QR kodunu veya etkinlik bağlantısını kontrol edip tekrar deneyin.
        </p>
      </div>
    </main>
  );
}
