"use client";

import { useRef, useState } from "react";

export function FileUpload({
  accept = "application/pdf",
  onUploaded
}: {
  accept?: string;
  onUploaded: (file: { url: string; name: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
      const data = await res.json();
      setFileName(file.name);
      onUploaded({ url: data.url, name: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-card border border-dashed border-ink/25 dark:border-paper/25 px-4 py-6 text-center text-sm text-ink/60 dark:text-paper/60 hover:border-amber hover:text-amber-dark transition-colors"
      >
        {uploading ? "Uploading…" : fileName ? `Selected: ${fileName}` : "Click to upload a PDF"}
      </button>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      {error && <p className="mt-1 text-xs text-pen-rose">{error}</p>}
    </div>
  );
}
