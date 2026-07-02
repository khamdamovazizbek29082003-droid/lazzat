export function Ikat({ size = 18, color = "currentColor", bg = "#0e3068" }: { size?: number; color?: string; bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className="shrink-0">
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color} />
      <path d="M5 3 L7 5 L5 7 L3 5 Z" fill={bg} />
    </svg>
  );
}
