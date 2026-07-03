"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useT } from "@/components/providers/LocaleProvider";

export type UploadedMedia = { url: string; type: "PHOTO" | "VIDEO" };

/** Uploads directly from the browser to Vercel Blob storage via a short-lived client token. */
export function MediaUploader({
  value,
  onChange,
  maxPhotos = 6,
  maxVideos = 2,
}: {
  value: UploadedMedia[];
  onChange: (media: UploadedMedia[]) => void;
  maxPhotos?: number;
  maxVideos?: number;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoCount = value.filter((m) => m.type === "PHOTO").length;
  const videoCount = value.filter((m) => m.type === "VIDEO").length;
  const canAddMore = photoCount < maxPhotos || videoCount < maxVideos;

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    const uploaded: UploadedMedia[] = [];
    try {
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        const currentPhotos = photoCount + uploaded.filter((m) => m.type === "PHOTO").length;
        const currentVideos = videoCount + uploaded.filter((m) => m.type === "VIDEO").length;
        if (isVideo && currentVideos >= maxVideos) continue;
        if (!isVideo && currentPhotos >= maxPhotos) continue;

        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        uploaded.push({ url: blob.url, type: isVideo ? "VIDEO" : "PHOTO" });
      }
      onChange([...value, ...uploaded]);
    } catch {
      setError(t("error_generic"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((m, i) => (
          <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg bg-[var(--surface-2)]">
            {m.type === "VIDEO" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={m.url} className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-[10px] text-white"
            >
              ✕
            </button>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="grid h-16 w-16 place-items-center rounded-lg border-2 border-dashed border-[var(--border)] text-xl text-[var(--text-sub)] disabled:opacity-60"
          >
            {uploading ? "…" : "+"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {error && <p className="mt-1 text-xs font-semibold text-anor">{error}</p>}
    </div>
  );
}
