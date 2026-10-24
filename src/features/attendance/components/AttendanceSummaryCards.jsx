// Utils
import { cn } from "@/shared/utils/cn";

// Components
import BranchSplit from "@/shared/components/ui/BranchSplit";

/**
 * Davomat sahifalaridagi yig'indi kartalari - barcha sahifalarda bir xil dizayn.
 *
 * ⚠️ UMUMIY KO'RINISHDA har kartada FILIALLAR KESIMI ham chiqadi: "25 keldi"
 * degan raqam "qaysi filialda?" degan savolni javobsiz qoldirmasligi kerak,
 * qator bosilganda esa o'sha filialning o'sha sahifasi ochiladi. Kesim
 * serverdan keladi (`meta.aggregate.byBranch` → `shared/api/aggregateMeta.js`),
 * panel uni O'ZI hisoblamaydi.
 *
 * @param {object} props
 * @param {Array} props.cards - [{ key, label, color }]
 * @param {Object} props.summary - { [key]: number }
 * @param {string} [props.className] - grid ustunlarini moslash uchun
 * @param {object} [props.data] - so'rovning TO'LIQ javobi (kesim shunda)
 * @param {string} [props.pathPrefix="summary"] - kesim yo'lining boshi
 * @param {string} [props.to] - filialga o'tgandan keyin ochiladigan sahifa
 */
const AttendanceSummaryCards = ({
  cards = [],
  summary = {},
  className = "",
  data,
  pathPrefix = "summary",
  to,
}) => {
  if (!cards.length) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {cards.map(({ key, label, color }) => (
        <div key={key} className={cn("rounded-xl px-4 py-3", color)}>
          <div className="text-center">
            <p className="text-2xl font-bold">{summary[key] ?? 0}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>

          <BranchSplit
            data={data}
            path={pathPrefix ? `${pathPrefix}.${key}` : key}
            to={to}
            className="border-black/10"
          />
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummaryCards;
