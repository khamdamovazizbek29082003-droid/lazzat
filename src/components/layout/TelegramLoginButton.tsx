"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

const BOT_USERNAME = "LazzatUzbot";

export function TelegramLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = (user: TelegramUser) => {
      const payload: Record<string, string> = {};
      for (const [key, value] of Object.entries(user)) payload[key] = String(value);
      signIn("telegram", { ...payload, callbackUrl: "/" });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", BOT_USERNAME);
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-radius", "20");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    containerRef.current?.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  return <div ref={containerRef} />;
}
