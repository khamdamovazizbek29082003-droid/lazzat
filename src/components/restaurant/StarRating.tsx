"use client";

export function StarRating({
  value,
  onChange,
  size = 22,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(s)}
          className={readOnly ? "cursor-default leading-none" : "cursor-pointer leading-none"}
          style={{ fontSize: size, filter: s <= value ? "none" : "grayscale(1) opacity(0.4)" }}
          aria-label={`${s} star`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}
