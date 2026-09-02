// Router
import { Link } from "react-router-dom";

// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  PILL,
  getRateColor,
  initialsOf,
  percentText,
} from "../../data/staffReport.data";

/**
 * "Eng yaxshi xodimlar" panelining teskarisi: shu oyda davomati eng past
 * bo'lgan xodimlar.
 *
 * Bu ro'yxat tizimda boshqa hech qayerda yo'q — davomat modulining o'z
 * hisoboti faqat eng yaxshilarni saralaydi. Aynan shuning uchun panel shu
 * yerda o'z o'rniga ega: rahbar reytingning yuqorisidan ko'ra pastini
 * ko'rib chora ko'radi.
 *
 * Davomat ruxsati yo'q ko'ruvchida `attendance` umuman `null` bo'ladi —
 * unda panel chizilmaydi (`null` qaytadi), toki panjarada bo'sh, hech
 * qachon to'lmaydigan qobiq osilib qolmasin.
 *
 * @param {object} props
 * @param {object|null} [props.attendance] - davomat kesimi (ruxsat bo'lmasa null)
 */
const StaffAttentionList = ({ attendance }) => {
  if (!attendance) return null;

  const rows = attendance.lowest ?? [];

  return (
    <ReportPanelCard
      title="E'tibor talab qiladi"
      hint="Yozuvlari yetarli xodimlar orasida eng past davomat"
      action={
        <Link
          to="/attendance/reports/staff"
          className="text-xs font-medium text-primary hover:underline"
        >
          Davomat hisoboti
        </Link>
      }
      isEmpty={!rows.length}
      emptyText="Bu oyda past davomatli xodim yo'q"
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.userId} className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {initialsOf(row.name)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {row.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {row.absent
                  ? `${row.roleLabel} · ${row.absent} kun kelmagan`
                  : row.roleLabel}
              </p>
            </div>

            <span className={cn(PILL, "shrink-0", getRateColor(row.percent))}>
              {percentText(row.percent)}
            </span>
          </div>
        ))}
      </div>
    </ReportPanelCard>
  );
};

export default StaffAttentionList;
