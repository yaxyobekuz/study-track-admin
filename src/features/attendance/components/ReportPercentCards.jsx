// Icons
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { getPercentColor } from "../data/attendanceReports.data";

/**
 * O'zgarish yorlig'i — PUNKTDA (p.p.), foizda emas.
 *
 * ⚠️ Davomatning o'zi foiz, uning o'zgarishini yana foizda berish
 * ("93% dan 94% ga, ya'ni +1.1%") rahbarni chalg'itardi: moliya
 * dashboardida ham xuddi shu qaror qabul qilingan.
 */
const Delta = ({ change }) => {
  if (change == null) return null;

  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  const tone =
    change > 0 ? "text-green-700" : change < 0 ? "text-red-600" : "text-gray-400";

  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold", tone)}>
      <Icon className="size-3.5 shrink-0" />
      {change > 0 ? "+" : ""}
      {change} p.p.
    </span>
  );
};

/**
 * Umumiy davomat foizi kartalari: KUNLIK va OYLIK.
 *
 * Foiz = kelganlar / KUTILGAN (jadval bo'yicha bo'lishi kerak bo'lganlar),
 * belgilanganlarga nisbatan emas — shuning uchun "Belgilanmagan" ham
 * ko'rinadi.
 *
 * ⚠️ "Shu hafta" kartasi OLIB TASHLANDI. U doim JORIY haftaga tegishli
 * edi va tanlangan oyga bo'ysunmasdi: avgust tanlanganda ham yonida
 * sentabr haftasining foizi turardi. O'rniga TAQQOSLASH keldi — har
 * kartaning o'z tanlagichi bor va u "yaxshilandimi?" degan savolga
 * javob beradi.
 *
 * @param {Array} items - [{ key, label, percent, came, total, unmarked,
 *   control, compare, change }]
 *   `control` — kartaning o'z tanlagichi (sana yoki oy)
 *   `compare` — { label, percent } yoki null
 */
const ReportPercentCards = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(
        ({ key, label, percent, came, total, unmarked, control, compare, change }) => (
          <div
            key={key}
            className={cn("rounded-xl px-4 py-3", getPercentColor(percent))}
          >
            {/* Sarlavha va tanlagich bitta qatorda: tanlagich kartaning
                O'ZIGA tegishli ekani shundan ko'rinadi */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold">{label}</p>
              {control}
            </div>

            <p className="mt-1 text-center text-2xl font-bold">
              {percent == null ? "-" : `${percent}%`}
            </p>

            <p className="mt-0.5 text-center text-[11px] opacity-80">
              {total ? `Kelgan: ${came} / ${total}` : "Ma'lumot yo'q"}
            </p>
            {total > 0 && (
              <p className="text-center text-[11px] opacity-80">
                Belgilanmagan: {unmarked ?? 0}
              </p>
            )}

            {/* Taqqoslash qatori — faqat tanlanganda chiziladi. Tanlanmagan
                holatda bo'sh joy egallab turishi kartani buzuqdek
                ko'rsatardi */}
            {compare && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-current/15 pt-2 text-[11px]">
                <span className="opacity-80">
                  {compare.label}:{" "}
                  {compare.percent == null ? "—" : `${compare.percent}%`}
                </span>
                <Delta change={change} />
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
};

export default ReportPercentCards;
