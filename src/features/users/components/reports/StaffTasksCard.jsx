// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  PILL,
  getRateBar,
  initialsOf,
  percentText,
  getRateColor,
  STAT_CELL_TONES,
  TASK_STAT_CELLS,
  PANEL_ROW_LIMIT,
} from "../../data/staffReport.data";

/**
 * Topshiriq intizomi — tanlangan oyda BERILGAN topshiriqlar taqdiri.
 *
 * Kesim topshiriq yaratilgan sana bo'yicha olinadi (bajarilgan sana emas):
 * shunda "shu oyda berilgan ishning qanchasi bajarildi" degan savolga javob
 * bo'ladi va bitta topshiriq ikki oyda ikki marta sanalmaydi.
 *
 * ⚠️ Tepadagi to'rt katak BO'LINISH EMAS: "muddati o'tgan" — "jarayonda" ning
 * ichidagi qism (server yakunlanmagan topshiriqlarning muddati o'tganini
 * sanaydi), shuning uchun kataklarni qo'shib bo'lmaydi. Haqiqiy bo'linish:
 * berilgan = bajarilgan + jarayonda + to'xtatilgan.
 *
 * Bajarilish foizi to'xtatilgan topshiriqlarsiz hisoblanadi — ularni admin
 * bekor qilgan, ya'ni xodimning intizomi haqida hech narsa aytmaydi. To'xtatilgan
 * soni shu sababli maxrajdan chiqarilib, ro'yxat ostida alohida izoh sifatida
 * qoladi: raqamni butunlay yashirsak, "berilgan" bilan "bajarilgan + jarayonda"
 * farqi tushunarsiz bo'lib qolardi.
 *
 * Jadval o'rniga progress chizig'i: bu yerda aniq son emas, "kim orqada
 * qolyapti" ko'rinishi kerak — ko'z bir ustunni pastga yugurib chiqadi.
 *
 * @param {object} props
 * @param {object} props.tasks - topshiriqlar kesimi (`/users/reports` payload'idan)
 */
const StaffTasksCard = ({ tasks }) => {
  const rows = (tasks.top ?? []).slice(0, PANEL_ROW_LIMIT);

  return (
    <ReportPanelCard
      title="Topshiriqlar"
      hint="Tanlangan oyda berilgan topshiriqlar"
      action={
        <span className={cn(PILL, getRateColor(tasks.completionRate))}>
          Bajarilish: {percentText(tasks.completionRate)}
        </span>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TASK_STAT_CELLS.map((cell) => (
            <div
              key={cell.key}
              className={cn(
                "rounded-xl px-3 py-2.5 text-center",
                STAT_CELL_TONES[cell.tone],
              )}
            >
              <p className="text-xl font-bold">{tasks[cell.key] ?? "—"}</p>
              <p className="break-words text-[11px]">{cell.label}</p>
            </div>
          ))}
        </div>

        {tasks.stopped > 0 && (
          <p className="text-xs text-gray-500">
            Yana {tasks.stopped} ta topshiriq to&apos;xtatilgan — bajarilish
            foiziga kirmaydi
          </p>
        )}

        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            Bu oyda topshiriq berilmagan
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Xodimlar kesimida</p>

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
                    {row.completed}/{row.assigned} bajarilgan
                    {row.overdue > 0 && (
                      <span className="text-rose-600">
                        {" "}
                        · {row.overdue} muddati o&apos;tgan
                      </span>
                    )}
                  </p>

                  {/* Foiz `null` bo'lsa (hamma topshiriq to'xtatilgan) chiziq
                      umuman chizilmaydi: nol kenglikdagi chiziq haqiqiy 0% dan
                      farq qilmasdi. */}
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                    {row.rate != null && (
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          getRateBar(row.rate),
                        )}
                        style={{ width: `${row.rate}%` }}
                      />
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                  {percentText(row.rate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ReportPanelCard>
  );
};

export default StaffTasksCard;
