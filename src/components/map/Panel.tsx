"use client";

import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  children,
  onClose,
  side = "left",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  side?: "left" | "right";
}) {
  return (
    <div
      className={`animate-drop-in absolute bottom-16 z-50 max-h-[62vh] w-[330px] max-w-[92vw] overflow-y-auto rounded-2xl bg-[var(--surface)] p-4 shadow-2xl ${
        side === "left" ? "left-3.5 sm:left-4" : "right-3.5 sm:right-4"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-base leading-tight font-bold text-[var(--text)]">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs text-[var(--text-sub)]">{subtitle}</div>}
        </div>
        <button
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-sm text-[var(--text-sub)]"
        >
          ✕
        </button>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}
