"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MAX_UPLOADS_PER_GUEST } from "@/lib/constants";
import { loadGuestName, saveGuestName } from "@/lib/guest";

type UploadCardProps = {
  eventSlug: string;
  eventName: string;
};

export default function UploadCard({ eventSlug, eventName }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [remainingUploads, setRemainingUploads] = useState(MAX_UPLOADS_PER_GUEST);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [status, setStatus] = useState("Lütfen ad ve soyad girin.");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    const savedGuest = loadGuestName(eventSlug);
    setFirstName(savedGuest.firstName);
    setLastName(savedGuest.lastName);

    if (savedGuest.firstName && savedGuest.lastName) {
      void fetchGuestStatus(savedGuest.firstName, savedGuest.lastName);
    }
  }, [eventSlug]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchGuestStatus = async (nextFirstName: string, nextLastName: string) => {
    setIsLoadingStatus(true);
    setStatus("Yükleme hakkı kontrol ediliyor...");

    try {
      const response = await fetch(
        `/api/guest-status?slug=${encodeURIComponent(eventSlug)}&first_name=${encodeURIComponent(nextFirstName)}&last_name=${encodeURIComponent(nextLastName)}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        setStatus("Yükleme bilgisi alınamadı.");
        return;
      }

      const data: { uploadedCount: number; remainingUploads: number } = await response.json();
      setUploadedCount(data.uploadedCount);
      setRemainingUploads(data.remainingUploads);
      setStatus("Hazır");
    } catch {
      setStatus("Yükleme bilgisi alınamadı.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleGuestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setStatus("Ad ve soyad zorunludur.");
      return;
    }

    saveGuestName(eventSlug, {
      firstName: trimmedFirstName,
      lastName: trimmedLastName
    });

    await fetchGuestStatus(trimmedFirstName, trimmedLastName);
  };

  const openCamera = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!file || !trimmedFirstName || !trimmedLastName || isUploading || remainingUploads <= 0) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);

    const formData = new FormData();
    formData.append("slug", eventSlug);
    formData.append("first_name", trimmedFirstName);
    formData.append("last_name", trimmedLastName);
    formData.append("file", file);

    setIsUploading(true);
    setStatus("Fotoğraf yükleniyor...");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data: {
        error?: string;
        uploadedCount?: number;
        remainingUploads?: number;
      } = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Yükleme başarısız.");
        return;
      }

      setUploadedCount(data.uploadedCount ?? uploadedCount);
      setRemainingUploads(data.remainingUploads ?? remainingUploads);
      setStatus("Fotoğraf yüklendi.");
    } catch {
      setStatus("Yükleme başarısız.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-5 shadow-sm">
      <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-ink">
            Ad
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            autoComplete="given-name"
            className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-ink">
            Soyad
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
            autoComplete="family-name"
            className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none"
          />
        </div>

        <p className="text-center text-xs text-ink/60">
          ⚠️ Aynı cihazdan devam etmek için sayfayı tamamen kapatmamaya özen gösterin.
        </p>

        <button
          type="submit"
          disabled={isLoadingStatus || isUploading}
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-line bg-white text-base font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Devam et
        </button>
      </form>

      <div className="rounded-2xl bg-sand p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-clay">Kalan yükleme</p>
        <p className="mt-2 text-4xl font-semibold text-ink">{remainingUploads}</p>
        <p className="mt-2 text-sm text-ink/70">
          {uploadedCount} / {MAX_UPLOADS_PER_GUEST} kullanıldı
        </p>
      </div>

      {previewUrl ? (
        <div className="flex justify-center">
          <div className="w-full max-w-[240px] border border-[#ebe4d8] bg-[#fcfaf6] p-2 pb-5 shadow-sm">
            <img src={previewUrl} alt="" className="aspect-square w-full object-cover" />
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading || remainingUploads <= 0 || !firstName.trim() || !lastName.trim() || isLoadingStatus}
        aria-label={`${eventName} için fotoğraf çek`}
      />

      <button
        type="button"
        onClick={openCamera}
        disabled={isUploading || remainingUploads <= 0 || !firstName.trim() || !lastName.trim() || isLoadingStatus}
        className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-ink text-base font-medium text-white transition disabled:cursor-not-allowed disabled:bg-ink/40"
      >
        {remainingUploads <= 0
          ? "Yükleme limiti doldu"
          : isUploading
            ? "Yükleniyor..."
            : "Fotoğraf çek"}
      </button>

      <p className="mt-3 text-center text-sm text-ink/70">{status}</p>
      <p className="text-center text-xs text-ink/55">Her misafir en fazla 10 fotoğraf yükleyebilir.</p>
      <p className="mt-2 text-center text-xs text-ink/55">
        Desteklenen mobil tarayıcılarda kamera doğrudan açılır.
      </p>
    </section>
  );
}
