"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";
import { getMe, setAccountType } from "@/lib/data/client";

export function OnboardingModal() {
  const t = useT();
  const { status, update } = useSession();
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState<"CUSTOMER" | "OWNER" | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    getMe().then((me) => {
      if (active && me && !me.onboarded) setShow(true);
    });
    return () => {
      active = false;
    };
  }, [status]);

  const choose = async (type: "CUSTOMER" | "OWNER") => {
    setSaving(type);
    try {
      await setAccountType(type);
      // The role is baked into the JWT at sign-in and never re-read on its own; update()
      // must be called with a (even empty) argument, or next-auth sends a plain GET instead
      // of the POST that actually triggers the jwt callback's trigger: "update" branch.
      await update({});
      setShow(false);
    } finally {
      setSaving(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-rise-in w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl sm:p-8">
        <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">{t("onboarding_title")}</h2>
        <p className="mt-1.5 text-sm text-[var(--text-sub)]">{t("onboarding_subtitle")}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => choose("CUSTOMER")}
            disabled={saving !== null}
            className="flex flex-col items-start gap-1.5 rounded-2xl border-2 border-[var(--border)] p-4 text-left transition hover:border-cobalt disabled:opacity-60"
          >
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-[var(--text)]">{t("onboarding_customer_title")}</span>
            <span className="text-xs text-[var(--text-sub)]">{t("onboarding_customer_subtitle")}</span>
          </button>
          <button
            onClick={() => choose("OWNER")}
            disabled={saving !== null}
            className="flex flex-col items-start gap-1.5 rounded-2xl border-2 border-[var(--border)] p-4 text-left transition hover:border-saffron disabled:opacity-60"
          >
            <span className="text-2xl">🏪</span>
            <span className="font-bold text-[var(--text)]">{t("onboarding_owner_title")}</span>
            <span className="text-xs text-[var(--text-sub)]">{t("onboarding_owner_subtitle")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
