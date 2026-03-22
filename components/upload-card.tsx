"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_UPLOADS_PER_GUEST } from "@/lib/constants";
import { initializeGuestId } from "@/lib/guest";

type UploadCardProps = {
  eventSlug: string;
  eventName: string;
};

export default function UploadCard({ eventSlug, eventName }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isInitializingRef = useRef(false);
  const [guestId, setGuestId] = useState("");
  const [remainingUploads, setRemainingUploads] = useState(MAX_UPLOADS_PER_GUEST);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [status, setStatus] = useState("Loading...");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadStatus = async () => {
      if (isInitializingRef.current) {
        return;
      }

      isInitializingRef.current = true;

      const nextGuestId = await initializeGuestId(eventSlug);

      if (!isActive || !nextGuestId) {
        setStatus("Unable to load upload status.");
        isInitializingRef.current = false;
        return;
      }

      setGuestId(nextGuestId);

      const response = await fetch(
        `/api/guest-status?slug=${encodeURIComponent(eventSlug)}&guestId=${encodeURIComponent(nextGuestId)}`,
        { cache: "no-store" }
      );

      if (!isActive || !response.ok) {
        setStatus("Unable to load upload status.");
        isInitializingRef.current = false;
        return;
      }

      const data: { uploadedCount: number; remainingUploads: number } = await response.json();

      if (!isActive) {
        isInitializingRef.current = false;
        return;
      }

      setUploadedCount(data.uploadedCount);
      setRemainingUploads(data.remainingUploads);
      setStatus("Ready");
      isInitializingRef.current = false;
    };

    void loadStatus();

    return () => {
      isActive = false;
      isInitializingRef.current = false;
    };
  }, [eventSlug]);

  const openCamera = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !guestId || isUploading || remainingUploads <= 0) {
      return;
    }

    const formData = new FormData();
    formData.append("slug", eventSlug);
    formData.append("guestId", guestId);
    formData.append("file", file);

    setIsUploading(true);
    setStatus("Uploading...");

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
        setStatus(data.error || "Upload failed.");
        return;
      }

      setUploadedCount(data.uploadedCount ?? uploadedCount);
      setRemainingUploads(data.remainingUploads ?? remainingUploads);
      setStatus("Photo uploaded.");
    } catch {
      setStatus("Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
      <div className="rounded-2xl bg-sand p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-clay">Remaining uploads</p>
        <p className="mt-2 text-4xl font-semibold text-ink">{remainingUploads}</p>
        <p className="mt-2 text-sm text-ink/70">
          {uploadedCount} / {MAX_UPLOADS_PER_GUEST} used
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading || remainingUploads <= 0}
        aria-label={`Take a photo for ${eventName}`}
      />

      <button
        type="button"
        onClick={openCamera}
        disabled={isUploading || remainingUploads <= 0 || status === "Loading..."}
        className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-ink text-base font-medium text-white transition disabled:cursor-not-allowed disabled:bg-ink/40"
      >
        {remainingUploads <= 0 ? "Upload limit reached" : isUploading ? "Uploading..." : "Take photo"}
      </button>

      <p className="mt-3 text-center text-sm text-ink/70">{status}</p>
      <p className="mt-2 text-center text-xs text-ink/55">
        Camera capture is requested directly on supported mobile browsers.
      </p>
    </section>
  );
}
