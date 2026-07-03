"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.5 3.5 2.7 10.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.8-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.8-.8l3.2-15c.3-1.2-.4-1.7-1.5-1.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

type Status = "idle" | "waiting" | "signing-in" | "expired";

export function TelegramLoginButton() {
  const [status, setStatus] = useState<Status>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = useT();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function start() {
    setStatus("waiting");
    const res = await fetch("/api/telegram/start", { method: "POST" });
    const { token, deepLink } = (await res.json()) as { token: string; deepLink: string };
    window.open(deepLink, "_blank", "noopener,noreferrer");

    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/telegram/poll?token=${token}`);
      const data = (await r.json()) as { status: "pending" | "confirmed" | "expired" };
      if (data.status === "confirmed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("signing-in");
        await signIn("telegram", { token, callbackUrl: "/" });
      } else if (data.status === "expired") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("expired");
      }
    }, 2000);
  }

  return (
    <button
      onClick={start}
      disabled={status === "waiting" || status === "signing-in"}
      className="flex items-center gap-1.5 rounded-full bg-[#26A5E4] px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
    >
      <TelegramIcon />
      <span className="hidden sm:inline">
        {status === "idle" && t("sign_in_telegram")}
        {status === "waiting" && t("telegram_waiting")}
        {status === "signing-in" && "…"}
        {status === "expired" && t("sign_in_telegram")}
      </span>
    </button>
  );
}
