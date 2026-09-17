// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { initialsOf } from "../data/tasks.data";

// Ism bo'yicha barqaror rang: bir odam har ekranda bir xil rangda
const PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

/**
 * Bosh harflardan avatar.
 * @param {{ name: string, size?: "xs"|"sm"|"md"|"lg", className?: string }} props
 */
const UserAvatar = ({ name = "", size = "sm", className = "" }) => {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        PALETTE[hash % PALETTE.length],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
};

export default UserAvatar;
