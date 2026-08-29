"use client";

import { cn } from "@/lib/cn";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface FirmOption {
  id: string;
  name: string;
  url: string;
  current: boolean;
}

/**
 * Move between the firms this person belongs to.
 *
 * Each firm is its own domain, so this navigates rather than swapping state -
 * and because a session cookie cannot cross domains, the other firm asks for a
 * sign-in. The note says so rather than letting the redirect surprise anyone.
 */
export function FirmSwitcher({ firms }: { firms: FirmOption[] }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = firms.find((f) => f.current);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // One firm is not a choice - don't dress it up as one.
  if (firms.length < 2) return null;

  return (
    <div ref={box} className="relative px-2 pb-2">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
      >
        <span className="truncate">{current?.name ?? "Choose a firm"}</span>
        <ChevronDown size={15} className="shrink-0" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute inset-x-2 z-20 mt-1 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-[var(--shadow-pop)]"
        >
          {firms.map((f) => (
            <a
              key={f.id}
              role="menuitem"
              href={f.url}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-2)]",
                f.current ? "text-[var(--color-text)]" : "text-[var(--color-muted)]",
              )}
            >
              <span className="truncate">{f.name}</span>
              {f.current ? (
                <Check size={14} className="shrink-0 text-[var(--color-accent)]" />
              ) : null}
            </a>
          ))}
          <p className="border-t border-[var(--color-border)] px-3 py-2 text-meta text-[var(--color-faint)]">
            Each firm has its own domain, so switching asks you to sign in again.
          </p>
        </div>
      ) : null}
    </div>
  );
}
