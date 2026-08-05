export function Stamp({
  label,
  color,
  bg,
  className = "",
}: {
  label: string;
  color: string;
  bg: string;
  className?: string;
}) {
  return (
    <span
      className={`stamp px-2.5 py-1 text-[11px] ${className}`}
      style={{ color, backgroundColor: bg, borderColor: color }}
    >
      {label}
    </span>
  );
}
