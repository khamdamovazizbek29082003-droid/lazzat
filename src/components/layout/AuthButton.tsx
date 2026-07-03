"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";
import { TelegramLoginButton } from "./TelegramLoginButton";

export function AuthButton() {
  const { data: session, status } = useSession();
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-2)]" />;
  }

  if (session?.user) {
    return (
      <div ref={rootRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-1 pr-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span className="grid h-6 w-6 place-items-center rounded-full bg-cobalt text-xs text-white">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          )}
          <span className="hidden sm:inline">{session.user.name?.split(" ")[0]}</span>
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="border-b border-[var(--border)] px-4 py-3">
              <div className="text-xs text-[var(--text-sub)]">{t("signed_in_as")}</div>
              <div className="truncate text-sm font-semibold text-[var(--text)]">
                {session.user.name ?? session.user.email}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-anor transition hover:bg-[var(--surface-2)]"
            >
              {t("sign_out")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => signIn("google")}
        className="rounded-full bg-cobalt px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-cobalt-deep"
      >
        {t("sign_in")}
      </button>
      <TelegramLoginButton />
    </div>
  );
}
