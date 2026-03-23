"use client";

import { useState } from "react";

type AdminPhotoActionsProps = {
  publicUrl: string;
  storagePath: string;
};

function getBaseFileName(storagePath: string) {
  const fileName = storagePath.split("/").pop() || "photo";
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return fileName;
  }

  return fileName.slice(0, lastDotIndex);
}

function getDownloadMimeType(sourceType: string) {
  if (sourceType === "image/png") {
    return "image/png";
  }

  return "image/jpeg";
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = url;
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

function addSubtleGrain(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const grain = (Math.random() - 0.5) * 6;
    data[index] = Math.max(0, Math.min(255, data[index] + grain));
    data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + grain));
    data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + grain));
  }

  context.putImageData(imageData, 0, 0);
}

export default function AdminPhotoActions({ publicUrl, storagePath }: AdminPhotoActionsProps) {
  const [isGeneratingAnalog, setIsGeneratingAnalog] = useState(false);

  const handleAnalogDownload = async () => {
    if (isGeneratingAnalog) {
      return;
    }

    setIsGeneratingAnalog(true);

    try {
      const response = await fetch(publicUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Image could not be fetched.");
      }

      const sourceBlob = await response.blob();
      const sourceUrl = URL.createObjectURL(sourceBlob);

      try {
        const image = await loadImage(sourceUrl);
        const borderSize = Math.max(10, Math.round(Math.min(image.width, image.height) * 0.035));
        const bottomMargin = Math.max(28, Math.round(Math.min(image.width, image.height) * 0.16));
        const canvas = document.createElement("canvas");
        canvas.width = image.width + borderSize * 2;
        canvas.height = image.height + borderSize * 2 + bottomMargin;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas is not available.");
        }

        context.fillStyle = "#fcfaf6";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.filter = "saturate(0.84) contrast(0.9) brightness(1.04) sepia(0.075) blur(0.45px)";
        context.drawImage(image, borderSize, borderSize, image.width, image.height);
        context.filter = "none";
        addSubtleGrain(context, image.width, image.height);

        const mimeType = getDownloadMimeType(sourceBlob.type);
        const extension = mimeType === "image/png" ? "png" : "jpg";
        const framedBlob = await new Promise<Blob | null>((resolve) => {
          context.canvas.toBlob(resolve, mimeType, 0.95);
        });

        if (!framedBlob) {
          throw new Error("Framed image could not be created.");
        }

        downloadBlob(framedBlob, `${getBaseFileName(storagePath)}-analog-frame.${extension}`);
      } finally {
        URL.revokeObjectURL(sourceUrl);
      }
    } finally {
      setIsGeneratingAnalog(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2 p-3">
      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-10 items-center justify-center rounded-xl border border-line bg-white text-sm font-medium text-ink"
      >
        View
      </a>
      <button
        type="button"
        onClick={handleAnalogDownload}
        disabled={isGeneratingAnalog}
        className="flex h-10 items-center justify-center rounded-xl bg-ink text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-ink/40"
      >
        {isGeneratingAnalog ? "Hazırlanıyor..." : "Analog indir"}
      </button>
      <a
        href={`/api/photos/download?path=${encodeURIComponent(storagePath)}`}
        download
        className="flex h-10 items-center justify-center rounded-xl border border-line bg-white text-sm font-medium text-ink"
      >
        Orijinali indir
      </a>
    </div>
  );
}
