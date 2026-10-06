// Icons
import { CheckCheck, LockOpen } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { CHIP, SURFACE, T } from "../data/ledger.tokens";
import { MISSED_LESSONS_HINT, UNLOCK_STATUS_META } from "../data/lessonHours.data";

/** "2026-09-12T00:00:00.000Z" → "2026-09-12" (sana `@db.Date`, UTC yarim tuni). */
const dayKeyOf = (value) => String(value).slice(0, 10);

/**
 * O'TILMAGAN DARSLAR — "nega 61 emas, 60 soat" degan savolning javobi.
 *
 * ⚠️ KUN BO'YICHA GURUHLANADI: baho qo'yish KUNLAR bo'yicha ochiladi,
 * shuning uchun tugma ham kunning sarlavhasida turadi. U umumiy "Baho
 * qo'yishni ochish" oynasini SHU o'qituvchi va SHU kun bilan to'ldirib
 * ochadi — ikkinchi forma yozilmaydi. Tepadagi tugma esa oyning hamma
 * o'tilmagan kunlarini bitta oraliq qilib ochadi.
 *
 * ⚠️ SABAB VA SANA MATNI SERVERDAN (`reasonLabel`, `dateLabel`): sana
 * `@db.Date` bo'lib, brauzerda `new Date` bilan o'qilsa bir kunga siljirdi.
 *
 * ⚠️ OCHILGAN KUN BELGISI holati bilan: yopilgan yoki muddati tugagan
 * oyna ham ko'rsatiladi — shu kunlarda qo'yilgan baholar o'z kuchida.
 *
 * @param {object} props
 * @param {Array} props.rows - `missedLessons`
 * @param {Array} props.unlocks - `gradingUnlocks` (shu o'qituvchini qamragan oynalar)
 * ⚠️ "O'TILDI DEB BELGILASH" — kun sarlavhasida (`lessonCredits.manage`):
 * umumiy belgilash oynasini SHU o'qituvchi va SHU kun darslari bilan ochadi
 * ("O'tilmagan darslar" tabidagi AYNI oyna). Baho qo'ydirishning iloji
 * bo'lmaganda (platforma ishlamagan kun) — to'g'ridan-to'g'ri yo'l.
 *
 * @param {string} props.teacherId
 * @param {string} [props.teacherName]
 * @param {boolean} props.isCurrentMonth
 * @param {boolean} props.sealed - shu oy oyligi muhrlangan
 * @param {boolean} [props.creditSealed] - yopilgan oyda soatbay oylik muhrlangan
 */
const MissedLessons = ({
  rows,
  unlocks = [],
  teacherId,
  teacherName,
  isCurrentMonth,
  sealed,
  creditSealed = false,
}) => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const canUnlock = can("grades.unlock");
  const canCredit = can("lessonCredits.manage");

  const openCredit = (day) =>
    openModal("createLessonCredits", {
      date: day.key,
      dateLabel: day.label,
      mode: "lessons",
      groups: [{ teacherId, teacherName: teacherName ?? "O'qituvchi", lessons: day.lessons }],
      sealed: creditSealed,
    });

  // Kun → darslar (server tartibi saqlanadi — sana bo'yicha)
  const days = [];
  for (const row of rows) {
    const key = dayKeyOf(row.date);
    let day = days.find((d) => d.key === key);
    if (!day) {
      day = { key, label: row.dateLabel, lessons: [] };
      days.push(day);
    }
    day.lessons.push(row);
  }

  /** Shu kunni qamragan oyna — ochiqlari birinchi. */
  const unlockOf = (key) =>
    unlocks
      .filter((u) => u.dateFrom <= key && key <= u.dateTo)
      .sort((a, b) => Number(b.status === "active") - Number(a.status === "active"))[0] ?? null;

  const openUnlock = (dateFrom, dateTo) =>
    openModal("createGradingUnlock", {
      dateFrom,
      dateTo,
      scope: "selected",
      teacherIds: [teacherId],
    });

  const closedDays = days.filter((day) => unlockOf(day.key)?.status !== "active");

  return (
    <div className="space-y-2">
      {canUnlock && closedDays.length > 1 && (
        <button
          type="button"
          onClick={() => openUnlock(closedDays[0].key, closedDays.at(-1).key)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-[12px] font-medium text-indigo-700 transition-colors duration-200 hover:bg-indigo-100"
        >
          <LockOpen className="size-3.5" strokeWidth={2.2} />
          {`${closedDays[0].label} — ${closedDays.at(-1).label} kunlarini ochish`}
        </button>
      )}

      <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1 hidden-scrollbar">
        {days.map((day) => {
          const unlock = unlockOf(day.key);
          const meta = unlock ? UNLOCK_STATUS_META[unlock.status] : null;

          return (
            <li key={day.key} className={cn(SURFACE.tile, "space-y-2 py-2.5")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-medium text-slate-900">{day.label}</span>

                {unlock && (
                  <span
                    className={cn(CHIP, meta.chip)}
                    title={[unlock.rangeLabel, unlock.reason].filter(Boolean).join(" · ")}
                  >
                    <LockOpen className="size-2.5" strokeWidth={2.4} />
                    {unlock.status === "active" ? `Ochiq · ${unlock.expiresAtLabel} gacha` : meta.label}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-1">
                  {canUnlock && unlock?.status !== "active" && (
                    <button
                      type="button"
                      onClick={() => openUnlock(day.key, day.key)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium text-indigo-600 transition-colors duration-200 hover:bg-indigo-50"
                    >
                      <LockOpen className="size-3" strokeWidth={2.2} />
                      Baho qo'yishni ochish
                    </button>
                  )}
                  {canCredit && (
                    <button
                      type="button"
                      onClick={() => openCredit(day)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium text-emerald-700 transition-colors duration-200 hover:bg-emerald-50"
                    >
                      <CheckCheck className="size-3" strokeWidth={2.2} />
                      O'tildi deb belgilash
                    </button>
                  )}
                </div>
              </div>

              <ul className="space-y-1">
                {day.lessons.map((row) => (
                  <li key={`${row.classId}-${row.lessonOrder}`} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={cn(T.td, "truncate")}>
                        {`${row.className}, ${row.lessonOrder}-dars · ${row.subjectName}`}
                      </p>
                      {(row.autoMarked || row.substituted) && (
                        <p className={cn(T.meta, "truncate")}>
                          {[row.substituted && "o'rinbosarlik", row.autoMarked && "davomat avtomatik belgilangan"]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className={cn(CHIP, "shrink-0 bg-rose-50 text-rose-700")}>
                      {row.reasonLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <p className={T.hint}>
        {MISSED_LESSONS_HINT.rule}
        {isCurrentMonth ? ` ${MISSED_LESSONS_HINT.today}` : ""}
      </p>
      {canUnlock && sealed && (
        <p className="text-[11px] leading-snug text-amber-700">
          Bu oy oyligi allaqachon shakllantirilgan. {MISSED_LESSONS_HINT.sealed}
        </p>
      )}
    </div>
  );
};

export default MissedLessons;
