// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DORM_SUMMARY_CARDS } from "../data/dormAttendance.data";

/**
 * YIG'INDI KARTALARI — "nechta qoldi, nechta kelmadi, nechtasi
 * belgilanmagan".
 *
 * ⚠️ Sanoq FILTRDAN OLDIN hisoblangan (server `summary`): "Kelmadi"
 * filtrida turgan tarbiyachi ham kunning umumiy manzarasini ko'rishi
 * kerak.
 *
 * Karta bosilsa — o'sha holat filtri qo'yiladi, qayta bosilsa olinadi
 * ("Ro'yxatda" kartasi filtrni tozalaydi).
 *
 * @param {object} props
 * @param {object} [props.summary]
 * @param {string} props.scopeLabel - "Butun maktab" / sinf nomi
 * @param {string} props.status - joriy holat filtri ("" — hammasi)
 * @param {(status: string) => void} props.onFilter
 */
const DormSummaryCards = ({ summary, scopeLabel, status, onFilter }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {DORM_SUMMARY_CARDS.map(({ key, label, color }) => {
      // "Ro'yxatda" — filtr emas, qamrov: bosilsa filtr tozalanadi
      const filterKey = key === "total" ? "" : key === "stayed" ? "present" : key;
      const active = Boolean(filterKey) && status === filterKey;

      return (
        <button
          key={key}
          type="button"
          onClick={() => onFilter(active ? "" : filterKey)}
          className={cn(
            "rounded-xl px-4 py-3 text-center transition",
            color,
            active ? "ring-2 ring-gray-900/40" : "hover:brightness-95",
          )}
        >
          <p className="text-2xl font-bold">{summary?.[key] ?? 0}</p>
          <p className="mt-0.5 text-xs">{label}</p>
          {key === "total" && (
            <p className="mt-0.5 truncate text-[11px] opacity-70">{scopeLabel}</p>
          )}
        </button>
      );
    })}
  </div>
);

export default DormSummaryCards;
