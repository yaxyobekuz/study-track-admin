// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  PILL,
  TONE_STYLES,
  percentText,
  QUICK_STAT_ICONS,
  QUICK_STAT_FALLBACK_ICON,
} from "../../data/staffReport.data";

/**
 * Tezkor statistika — sahifaning "bir qarashda" ustuni.
 *
 * Qaysi qatorlar borligini va ular qanday nomlanishini SERVER hal qiladi:
 * davomat ruxsati bo'lmagan foydalanuvchida bugungi qatorlar umuman
 * kelmaydi, o'tgan oyni ko'rayotganda esa "bugun" ma'nosini yo'qotadi.
 * Shuning uchun bu yerda hech narsa filtrlanmaydi, tartiblanmaydi va
 * qayta nomlanmaydi — frontend faqat ikonka va nishon rangini qo'shadi.
 *
 * Kalit ikonkalar ro'yxatida bo'lmasa (server yangi qator qo'shsa) qator
 * neytral ikonka bilan chiziladi: yangi ko'rsatkich yo'qolib ketgandan
 * ko'ra ikonkasi bir oz umumiy bo'lgani yaxshi.
 *
 * @param {object} props
 * @param {Array} props.quickStats
 */
const StaffQuickStats = ({ quickStats = [] }) => (
  <ReportPanelCard
    title="Tezkor statistika"
    hint="Jami xodimlar soniga nisbatan"
    isEmpty={!quickStats.length}
  >
    <div className="divide-y divide-gray-50">
      {quickStats.map((row) => {
        const Icon = QUICK_STAT_ICONS[row.key] ?? QUICK_STAT_FALLBACK_ICON;

        return (
          <div
            key={row.key}
            className="flex items-center gap-3 rounded-xl px-1 py-2"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <Icon className="size-4 text-gray-500" />
            </span>

            <p className="min-w-0 flex-1 truncate text-sm text-gray-600">
              {row.label}
            </p>

            <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
              {row.value == null ? "—" : row.value}
            </span>

            <span
              className={cn(
                PILL,
                "shrink-0",
                TONE_STYLES[row.tone] ?? TONE_STYLES.neutral,
              )}
            >
              {percentText(row.percent)}
            </span>
          </div>
        );
      })}
    </div>
  </ReportPanelCard>
);

export default StaffQuickStats;
