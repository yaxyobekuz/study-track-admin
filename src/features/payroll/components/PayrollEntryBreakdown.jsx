// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { buildEntryBreakdownLines } from "../data/payroll.data";

const TONE_CLASS = {
  base: "text-gray-600",
  plus: "text-amber-600",
  minus: "text-red-500",
};

/**
 * OYLIK TARKIBI — muhrlangan majburiyat summasi nimalardan yig'ilgani:
 * asosiy maosh, dars soati, har bir ustama (tyutor sinfi, sertifikat...) va
 * ushlab qolish. "Nega shuncha?" degan savolga shu yerda javob bor.
 *
 * ⚠️ Summalar ustida arifmetika QILINMAYDI — har qator va jami serverdan
 * tayyor keladi (majburiyatga muhrlangan qiymatlar).
 *
 * @param {object} props
 * @param {object} props.entry - `serializeEntry` natijasi
 * @param {boolean} [props.showTotal] - oxirida "Jami" qatori
 * @param {string} [props.className]
 */
const PayrollEntryBreakdown = ({ entry, showTotal = false, className }) => {
  const lines = buildEntryBreakdownLines(entry);
  if (lines.length === 0) return null;

  return (
    <ul className={cn("space-y-0.5 text-xs font-normal", className)}>
      {lines.map((line) => (
        <li key={line.key} className={cn("flex justify-between gap-3", TONE_CLASS[line.tone])}>
          <span className="min-w-0 break-words">{line.label}</span>
          <span className="shrink-0 whitespace-nowrap">
            {line.tone === "plus" ? "+ " : line.tone === "minus" ? "− " : ""}
            {formatMoney(line.amount)}
          </span>
        </li>
      ))}

      {showTotal && (
        <li className="mt-1 flex justify-between gap-3 border-t border-gray-100 pt-1 font-semibold text-gray-900">
          <span>Jami</span>
          <span className="whitespace-nowrap">{formatMoney(entry.amount)}</span>
        </li>
      )}
    </ul>
  );
};

export default PayrollEntryBreakdown;
