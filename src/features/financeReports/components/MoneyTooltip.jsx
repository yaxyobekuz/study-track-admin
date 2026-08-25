// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

/**
 * Diagramma tooltip'i — summani TO'LIQ ko'rsatadi.
 *
 * O'q yorlig'i qisqartirilgan ("538 mln"), lekin sichqoncha ustiga
 * kelganda aniq raqam kerak: "bu oy 538 170 000 so'm" degan javob
 * hisobotning butun mohiyati.
 */
const MoneyTooltip = ({ active, payload, label, suffix = "" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-900">{label}</p>

      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.fill }}
            />
            <span className="text-gray-500">{entry.name}</span>
            <span className="ml-auto font-medium text-gray-900">
              {suffix === "%"
                ? `${entry.value}%`
                : formatMoney(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoneyTooltip;
