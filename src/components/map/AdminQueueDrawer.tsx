"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/providers/LocaleProvider";
import { decideSubmission, listSubmissionQueue } from "@/lib/data/client";
import { CATEGORY_EMOJI, type PlaceSubmission } from "@/lib/data/types";

export function AdminQueueDrawer({ onClose, onDecided }: { onClose: () => void; onDecided: () => void }) {
  const t = useT();
  const [items, setItems] = useState<PlaceSubmission[]>([]);

  const refresh = () => listSubmissionQueue().then(setItems);
  useEffect(() => {
    refresh();
  }, []);

  const decide = async (id: string, action: "approve" | "reject") => {
    await decideSubmission(id, action);
    await refresh();
    onDecided();
  };

  return (
    <div className="animate-drop-in absolute top-[72px] right-3.5 z-50 max-h-[70vh] w-[320px] max-w-[92vw] overflow-y-auto rounded-2xl bg-[var(--surface)] p-4 shadow-2xl sm:right-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-bold text-[var(--text)]">🛡 {t("admin_queue")}</div>
        <button
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-full bg-[var(--surface-2)] text-sm text-[var(--text-sub)]"
        >
          ✕
        </button>
      </div>
      {items.length === 0 && <p className="py-4 text-sm text-[var(--text-sub)]">{t("admin_empty")}</p>}
      {items.map((s) => (
        <div key={s.id} className="mb-2.5 rounded-xl border border-[var(--border)] p-3">
          <div className="font-bold text-[var(--text)]">
            {CATEGORY_EMOJI[s.type]} {s.name}
          </div>
          <div className="my-1 text-xs text-[var(--text-sub)]">
            {s.type.replace("_", " ")} · {s.submittedBy}
          </div>
          {s.note && <div className="my-1 text-xs text-[var(--text)]">&ldquo;{s.note}&rdquo;</div>}
          <a href={`tel:${s.ownerPhone}`} className="my-1 block text-sm font-bold text-cobalt">
            📞 {t("call_owner")}: {s.ownerPhone}
          </a>
          <div className="mt-2 flex gap-2">
            <button onClick={() => decide(s.id, "approve")} className="flex-1 rounded-lg bg-turquoise py-1.5 text-xs font-bold text-white">
              ✓ {t("approve")}
            </button>
            <button onClick={() => decide(s.id, "reject")} className="flex-1 rounded-lg bg-anor py-1.5 text-xs font-bold text-white">
              ✕ {t("reject")}
            </button>
          </div>
        </div>
      ))}
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-sub)]">
        Production: this queue reads from{" "}
        <code className="rounded bg-[var(--surface-2)] px-1">/api/v1/admin/queues/submissions</code>; approve runs the
        transactional Restaurant-creation route and writes an audit log.
      </p>
    </div>
  );
}
