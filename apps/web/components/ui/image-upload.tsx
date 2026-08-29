"use client";

import { HostAvatar } from "@/components/host-avatar";
import { useToast } from "@/components/ui/toast";
import { useRef, useState } from "react";

/**
 * Upload a picture and keep showing it.
 *
 * Uploading writes straight through to the record - there is no "save" step to
 * forget - so the preview is the stored state rather than a local draft.
 */
export function ImageUpload({
  kind,
  label,
  hint,
  initial,
  fallbackName,
  round = true,
}: {
  kind: "avatar" | "logo";
  label: string;
  hint: string;
  initial?: string | null;
  /** Drawn as an initial while no picture is set. */
  fallbackName: string;
  round?: boolean;
}) {
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initial ?? null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Upload failed", variant: "error" });
        return;
      }
      setUrl(data.url);
      toast({ title: "Picture updated", variant: "success" });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">{label}</p>
      <div className="flex items-center gap-4">
        {round ? (
          <HostAvatar name={fallbackName} image={url} size={56} />
        ) : url ? (
          <img src={url} alt="" className="h-14 w-auto max-w-[160px] rounded-md object-contain" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-[var(--color-border-strong)] text-meta text-[var(--color-faint)]">
            none
          </span>
        )}
        <div>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            id={`upload-${kind}`}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          <label
            htmlFor={`upload-${kind}`}
            className="inline-flex h-8 cursor-pointer items-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm transition-colors hover:bg-[var(--color-surface-2)]"
          >
            {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          </label>
          <p className="mt-1.5 text-meta text-[var(--color-faint)]">{hint}</p>
        </div>
      </div>
    </div>
  );
}
