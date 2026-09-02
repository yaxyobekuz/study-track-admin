// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import {
  PILL,
  SEVERITY_DEFAULT,
  SEVERITY_STYLES,
  STAT_CELL_TONES,
  PANEL_ROW_LIMIT,
  PENALTY_STAT_CELLS,
} from "../../data/staffReport.data";

/**
 * Jarima intizomi — tanlangan oyda TASDIQLANGAN jarimalar.
 *
 * Kutilayotgan jarima hisobga kirmaydi: u hali fakt emas, ko'rib chiqishda
 * rad etilishi mumkin. Kamaytirishlar esa jarima emas, uning teskarisi —
 * shuning uchun ular umumiy ballga qo'shilmay, alohida yashil katakda
 * turadi; bir ustunga qo'shilsa, "ballar kamaydi" degan yaxshi xabar
 * "jarima ko'paydi" ga o'xshab qolardi.
 *
 * Panel jarima bo'lmaganda ham bo'sh holatga tushmaydi: nol jarima —
 * ma'lumot yo'qligi emas, aynan javobning o'zi, shu sababli uchta raqam
 * har doim chiziladi va faqat ro'yxat o'rni izoh bilan almashadi.
 *
 * Qatorda pul summasi bo'lsa, u "necha marta" o'rniga ko'rsatiladi:
 * intizom masalasida ikkinchi eng kuchli signal — soni emas, summasi.
 *
 * @param {object} props
 * @param {object} props.penalties
 */
const StaffPenaltiesCard = ({ penalties }) => {
  // Serverdan o'ntagacha qator keladi, panelda esa beshtasi ko'rsatiladi:
  // qatorlar yonidagi panellardan uzun bo'lib ketsa, uch ustunli tor ham
  // buziladi. Qolganini xodimning o'z sahifasidan ko'rish mumkin.
  const top = (penalties.top ?? []).slice(0, PANEL_ROW_LIMIT);

  return (
    <ReportPanelCard
      title="Jarimalar"
      hint="Tanlangan oyda tasdiqlangan jarimalar"
    >
      <div className="space-y-4">
        {/* Oyning uchta raqami: nechta yozilgan, necha ball, qanchasi qaytarilgan */}
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-3">
          {PENALTY_STAT_CELLS.map((cell) => (
            <div
              key={cell.key}
              className={cn(
                "rounded-xl px-3 py-2.5 text-center",
                STAT_CELL_TONES[cell.tone],
              )}
            >
              <p className="text-xl font-bold">{penalties[cell.key] ?? "—"}</p>
              <p className="break-words text-[11px] opacity-80">{cell.label}</p>
            </div>
          ))}
        </div>

        {/* Summa faqat pul jarimasi bo'lganda — nol so'm qator joyni behuda egallaydi */}
        {penalties.fine > 0 && (
          <p className="text-xs text-gray-500">
            Jami jarima summasi:{" "}
            <span className="font-medium text-gray-900">
              {formatMoney(penalties.fine)}
            </span>
          </p>
        )}

        {top.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            Bu oyda xodimlarga jarima yozilmagan
          </p>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs text-gray-500">
              Eng ko&apos;p jarima olganlar
            </p>

            {top.map((row, index) => (
              <div key={row.userId} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1",
                    SEVERITY_STYLES[index + 1] ?? SEVERITY_DEFAULT,
                  )}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {row.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {row.roleLabel}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className={cn(PILL, "bg-rose-100 text-rose-700")}>
                    {row.points} ball
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {row.fine > 0
                      ? formatMoney(row.fine)
                      : `${row.count} marta`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ReportPanelCard>
  );
};

export default StaffPenaltiesCard;
