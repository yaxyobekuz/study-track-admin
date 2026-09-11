// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TONES, toneOf, GRADE_LABELS, GRADE_BADGE } from "../data/diagnostics.data";

/**
 * Kichik yorliq. Butun bo'limda BITTA shakl — jadval, karta va grafik
 * yonidagi belgilar bir xil ko'rinadi.
 */
export const Badge = ({ children, className = "", title }) => (
  <span
    title={title}
    className={cn(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
      className,
    )}
  >
    {children}
  </span>
);

/**
 * MAVZU DARAJASI yorlig'i.
 *
 * ⚠️ MATN HAM, RANG HAM BOR. Ma'noni faqat rang bilan berish rang
 * ko'rmaydigan foydalanuvchi uchun ma'lumotni butunlay yo'q qilardi.
 */
export const ToneBadge = ({ score, showScore = true, className = "" }) => {
  const tone = TONES[toneOf(score)];
  const Icon = tone.icon;

  return (
    <Badge className={cn(tone.badge, className)}>
      <Icon className="size-3" strokeWidth={2} />
      {showScore && score != null ? `${Math.round(score)}% · ` : ""}
      {tone.label}
    </Badge>
  );
};

/** NATIJA DARAJASI ("Yaxshi / O'rta / Zaif") — urinishga muhrlangan qiymat. */
export const GradeBadge = ({ grade, className = "" }) => {
  if (!grade) return <span className="text-gray-300">—</span>;
  return (
    <Badge className={cn(GRADE_BADGE[grade] || GRADE_BADGE.BAD, className)}>
      {GRADE_LABELS[grade] || grade}
    </Badge>
  );
};

export default ToneBadge;
