// Router
import { Link } from "react-router-dom";

// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  RANK_DEFAULT,
  RANK_STYLES,
  PANEL_ROW_LIMIT,
  getRateBar,
  initialsOf,
  percentText,
} from "../../data/staffReport.data";

/**
 * Qaysi ko'rsatkich bo'yicha reyting tuzilishini hal qiladi.
 * Hech qaysi manba yetarli bo'lmasa `null` qaytaradi.
 *
 * Ikkala manba ham serverda REYTING sifatida tayyorlanadi — bu yerda qayta
 * saralash yo'q. `.slice()` faqat himoya uchun: server allaqachon beshtadan
 * ko'p qator qaytarmaydi.
 */
const buildRanking = (attendance, tasks) => {
  if (attendance?.top?.length) {
    return {
      title: "Eng yuqori davomat",
      hint: "Tanlangan oydagi davomat foizi bo'yicha",
      hasAction: true,
      rows: attendance.top
        .slice(0, PANEL_ROW_LIMIT)
        .map((row) => ({ ...row, metric: row.percent })),
    };
  }

  if (tasks?.best?.length) {
    return {
      title: "Topshiriqni eng yaxshi bajarganlar",
      hint: "Topshiriq soni yetarli bo'lgan xodimlar orasida",
      hasAction: false,
      rows: tasks.best
        .slice(0, PANEL_ROW_LIMIT)
        .map((row) => ({ ...row, metric: row.rate })),
    };
  }

  return null;
};

/**
 * Panel bitta savolga javob beradi: "shu oyda kim eng yaxshi ishladi?".
 *
 * Ko'rsatkich MAVJUD ma'lumotga qarab tanlanadi. Davomat ruxsati bo'lsa
 * davomat foizi eng ishonchli o'lchov — u har kuni belgilanadi. Ruxsat
 * bo'lmasa (yoki oyda davomat yozuvi yo'q bo'lsa) topshiriq bajarilishiga
 * o'tiladi. Ikkalasi ham bo'lmasa panel bo'sh holatda qoladi: ikki xil
 * ko'rsatkichni bitta ro'yxatda aralashtirish o'rinlarni ma'nosiz qilardi.
 *
 * ⚠️ Topshiriq reytingi `tasks.best` dan olinadi, `tasks.top` dan EMAS:
 * `tasks.top` — berilgan topshiriq soni bo'yicha kesilgan ro'yxat, uni
 * foiz bo'yicha qayta saralash "eng ko'p topshiriq olgan o'ntalik ichidagi
 * eng yaxshi foiz" degani bo'lardi. `tasks.best` da hajm chegarasi ham bor,
 * shuning uchun 1/1 = 100% 41/42 = 97.6% dan yuqori turmaydi.
 *
 * @param {object} props
 * @param {object|null} [props.attendance] - davomat kesimi (ruxsat bo'lmasa null)
 * @param {object} [props.tasks] - topshiriqlar kesimi
 */
const StaffTopPerformers = ({ attendance, tasks }) => {
  const ranking = buildRanking(attendance, tasks);

  if (!ranking) {
    return (
      <ReportPanelCard
        title="Eng yaxshi xodimlar"
        isEmpty
        emptyText="Bu oyda reyting uchun ma'lumot yo'q"
      />
    );
  }

  return (
    <ReportPanelCard
      title={ranking.title}
      hint={ranking.hint}
      action={
        ranking.hasAction ? (
          <Link
            to="/attendance/reports/staff"
            className="text-xs font-medium text-primary hover:underline"
          >
            Batafsil
          </Link>
        ) : null
      }
    >
      <div className="space-y-3">
        {ranking.rows.map((row, index) => (
          <div key={row.userId} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1",
                RANK_STYLES[index + 1] ?? RANK_DEFAULT,
              )}
            >
              {index + 1}
            </span>

            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {initialsOf(row.name)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {row.name}
              </p>
              <p className="truncate text-xs text-gray-500">{row.roleLabel}</p>

              {/* Foiz `null` bo'lsa chiziq umuman chizilmaydi: nol
                  kenglikdagi chiziq haqiqiy 0% dan farq qilmasdi
                  (`StaffTasksCard` bilan bir xil qoida). */}
              <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                {row.metric != null && (
                  <div
                    className={cn("h-1.5 rounded-full", getRateBar(row.metric))}
                    style={{ width: `${row.metric}%` }}
                  />
                )}
              </div>
            </div>

            <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
              {percentText(row.metric)}
            </span>
          </div>
        ))}
      </div>
    </ReportPanelCard>
  );
};

export default StaffTopPerformers;
