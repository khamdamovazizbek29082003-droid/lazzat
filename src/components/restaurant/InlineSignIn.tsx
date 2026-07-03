"use client";

import { signIn } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";
import { TelegramLoginButton } from "@/components/layout/TelegramLoginButton";

/** Shown inline when a write action needs auth — keeps the user on the page instead of losing their draft. */
export function InlineSignIn() {
  const t = useT();
  return (
    <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <p className="mb-2 text-xs font-semibold text-[var(--text)]">{t("error_sign_in_required")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => signIn("google", { callbackUrl: typeof window !== "undefined" ? window.location.href : "/" })}
          className="rounded-full bg-cobalt px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-cobalt-deep"
        >
          {t("sign_in")}
        </button>
        <TelegramLoginButton />
      </div>
    </div>
  );
}
