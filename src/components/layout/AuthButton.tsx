"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";

export function AuthButton() {
  const { data: session, status } = useSession();
  const t = useT();

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-2)]" />;
  }

  if (session?.user) {
    return (
      <button
        onClick={() => signOut()}
        title={t("sign_out")}
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
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-full bg-cobalt px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-cobalt-deep"
    >
      {t("sign_in")}
    </button>
  );
}
