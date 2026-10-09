// Components
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Data
import { ISSUE_CHART_COLORS, formatRate } from "../../data/issues.data";

/**
 * Kategoriyalar kesimi — "qaysi yo'nalishda ko'p shikoyat qilinyapti".
 *
 * ⚠️ GORIZONTAL USTUN, DIAGRAMMA EMAS: kategoriya nomlari uzun va ular
 * o'qilishi kerak; vertikal ustunda yorliqlar burchak ostida yotib
 * o'qilmay qolardi. Ustun uzunligi — ENG KO'P kategoriyaga nisbatan
 * (jamiga emas): aks holda 8 ta kategoriya bo'lganda hammasi bir xil
 * ingichka chiziqqa aylanardi.
 *
 * ⚠️ `share` SERVERDAN keladi (davrdagi jamidan ulush), ustun kengligi
 * esa ko'rinish uchun — ikkisi boshqa-boshqa narsa va aralashtirilmaydi.
 *
 * @param {{ report: object, className?: string }} props
 */
const IssueCategoryCard = ({ report, className = "" }) => {
  const rows = report?.byCategory || [];
  const max = rows.reduce((m, r) => Math.max(m, r.total), 0);

  return (
    <ReportPanelCard
      title="Kategoriyalar bo'yicha"
      hint="Eng ko'p murojaat kelgan yo'nalishlar"
      className={className}
      isEmpty={rows.length === 0}
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.categoryId}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-gray-900">
                {row.name}
              </p>

              <p className="shrink-0 text-xs tabular-nums text-gray-500">
                <b className="text-gray-900">{row.total}</b> ta ·{" "}
                {formatRate(row.share)}
              </p>
            </div>

            <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
              {/* Yopilgan ulush yashil, qolgani ko'k — bitta ustunda
                  "qancha keldi" va "qanchasi yopildi" birga ko'rinadi */}
              <span
                style={{
                  width: max > 0 ? `${(row.closed / max) * 100}%` : 0,
                  backgroundColor: ISSUE_CHART_COLORS.closed,
                }}
              />
              <span
                style={{
                  width:
                    max > 0 ? `${((row.total - row.closed) / max) * 100}%` : 0,
                  backgroundColor: ISSUE_CHART_COLORS.new,
                }}
              />
            </div>

            <p className="mt-1 text-[11px] text-gray-400">
              {row.closed} yopildi · {row.total - row.closed} javobsiz
            </p>
          </li>
        ))}
      </ul>
    </ReportPanelCard>
  );
};

export default IssueCategoryCard;
