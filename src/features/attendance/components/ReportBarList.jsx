// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Yorliq + gorizontal ustuncha + qiymat qatorlari (sabablar, hafta kunlari trendi).
 * Ustuncha kengligi eng katta qiymatga nisbatan hisoblanadi.
 * @param {Array} items - [{ label, count, percent }] (percent ixtiyoriy, matnda ko'rsatiladi)
 * @param {string} barColor - ustuncha rangi (tailwind class)
 */
const ReportBarList = ({ items = [], barColor = "bg-blue-500" }) => {
  if (!items.length) {
    return <p className="text-sm text-gray-400 py-4">Ma&apos;lumot topilmadi</p>;
  }

  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span
            title={item.label}
            className="w-28 sm:w-40 shrink-0 text-sm text-gray-600 truncate"
          >
            {item.label || "-"}
          </span>

          <div className="flex-1 h-5 rounded-md bg-gray-100 overflow-hidden">
            <div
              className={cn("h-full rounded-md transition-all", barColor)}
              style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
            />
          </div>

          <span className="w-28 shrink-0 text-right text-sm text-gray-700">
            {item.count} ta
            {item.percent != null && (
              <span className="text-xs text-gray-400"> ({item.percent}%)</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ReportBarList;
