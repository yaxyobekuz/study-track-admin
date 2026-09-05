// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

/**
 * Diagramma tooltip'i — summani TO'LIQ ko'rsatadi.
 *
 * O'q yorlig'i qisqartirilgan ("538 mln"), lekin sichqoncha ustiga
 * kelganda aniq raqam kerak: "shu oy 538 170 000 so'm" degan javob
 * dashboardning butun mohiyati.
 *
 * `unitByKey` — bitta diagrammada pul ham, foiz ham bo'lsa, qaysi
 * qatorni qanday formatlashni aytadi (masalan "Ulush 24%").
 */
const MoneyTooltip = ({ active, payload, label, unitByKey = {} }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-900">
        {payload[0]?.payload?.monthLabel || label}
      </p>

      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.fill }}
            />
            <span className="text-gray-500">{entry.name}</span>
            <span className="ml-auto pl-3 font-medium text-gray-900">
              {unitByKey[entry.dataKey] === "percent"
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
