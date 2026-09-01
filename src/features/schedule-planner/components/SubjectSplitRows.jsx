// React
import { useCallback, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowDownToLine, Loader, UserRoundPlus, X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Helpers
import {
  splitKey,
  buildSplitPayload,
  buildSubjectSplit,
} from "../helpers/distribution.helpers";

// Varaqning o'zi bilan bir xil o'lchamlar — kataklar ustma-ust tushishi uchun.
const GAP = "p-[2px]";
const STICKY_LEFT = "sticky left-0 z-10";
const STICKY_RIGHT = "sticky right-0 z-10";
const TILE = "rounded-lg py-1 text-center text-xs font-medium";
// ⚠️ Varaqda katak foni OQ, panelda esa SLATE: aynan shu farq "bu qatorlar
// yuqoridagi fanga tegishli" degan chegarani ko'rsatadi. Yopishib turadigan
// chekka kataklar uchun rang SHAFFOFMAS bo'lishi shart.
const BODY = "bg-slate-100";
const CHIP = "rounded-md px-1.5 py-0.5 text-[11px] font-medium";

/**
 * FAN QATORI OSTIDA OCHILADIGAN TAQSIMOT.
 *
 * ⚠️ Bu blok alohida "oyna" EMAS, xuddi shu jadvalning QATORLARI: shu tufayli
 * o'qituvchi kataklari yuqoridagi fan qatoridagi sinf ustunlariga AYNAN
 * to'g'ri keladi. Alohida panel qilib chizilsa, "4 soat kimga tegishli"
 * degan savolga javob berish uchun ko'z ikki jadval orasida yurishi kerak
 * bo'lardi.
 *
 * Ma'no taqsimoti:
 *   yuqoridagi fan qatori → TALAB  ("5-A da matematikadan 4 soat")
 *   shu yerdagi kataklar  → KIM beradi ("Aliyev — 4")
 *   "Qoldiq" qatori       → farq   (0 bo'lsa fan to'liq taqsimlangan)
 *
 * ⚠️ Varaq localStorage'da, taqsimot esa SERVERDA (`PlannerLoad`). Ataylab:
 * "kim qaysi sinfda dars beradi" — jadval shakllantirishning haqiqiy kirimi,
 * u brauzer xotirasida yashamasligi kerak.
 */
const SubjectSplitRows = ({
  subject,
  columns,
  values,
  loadRows,
  isLoading,
  canEdit,
  onSave,
  onClose,
}) => {
  // Saqlanmagan qiymatlar. `null` — "sinf o'qituvchidan olib tashlandi".
  const [draft, setDraft] = useState({});
  // Fokusdan chiqqanda kim saqlanishi kerakligi (har harf uchun so'rov emas).
  const [dirty, setDirty] = useState(() => new Set());

  const span = columns.length + 2;

  const split = buildSubjectSplit({
    subjectId: subject.id,
    columns,
    values,
    loadRows,
    draft,
  });

  // Saqlash muvaffaqiyatsiz bo'lsa qoralama QAYTARILADI — aks holda ekranda
  // "saqlangan" bo'lib turgan, aslida yo'q qiymat qolib ketardi.
  const persist = useCallback(
    (teacher, nextDraft) => {
      const keys = Object.keys(nextDraft).filter((key) =>
        key.startsWith(`${teacher.id}|`),
      );

      onSave(buildSplitPayload(teacher, subject.id, nextDraft)).catch(() => {
        setDraft((prev) => {
          const next = { ...prev };
          for (const key of keys) delete next[key];
          return next;
        });
      });
    },
    [onSave, subject.id],
  );

  const handleChange = (teacherId, classId, raw) => {
    setDraft((prev) => {
      const next = { ...prev };
      const key = splitKey(teacherId, classId);

      // Bo'sh katak = sinf bu o'qituvchida yo'q. Nol esa "biriktirilgan,
      // lekin hozircha 0 soat" — ikkalasi boshqa-boshqa narsa.
      if (raw === "") next[key] = null;
      else {
        const num = Number(raw);
        if (!Number.isFinite(num)) return prev;
        // Serverdagi chegara — 40 soat.
        next[key] = Math.max(0, Math.min(40, Math.trunc(num)));
      }
      return next;
    });

    setDirty((prev) => new Set(prev).add(teacherId));
  };

  // Enter — "kiritdim": fokusdan chiqaradi, ya'ni darhol saqlanadi.
  // Escape — panelni yopadi (avval saqlab).
  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    event.preventDefault();
    event.currentTarget.blur();
    if (event.key === "Escape") onClose();
  };

  const handleBlur = (teacher) => {
    if (!dirty.has(teacher.id)) return;
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(teacher.id);
      return next;
    });
    persist(teacher, draft);
  };

  // "Qoldiqni shu o'qituvchiga" — taqsimlanmagan soatlarni bir bosishda beradi.
  const fillRest = (teacher) => {
    const next = { ...draft };
    for (const column of columns) {
      const rest = split.need[column.id] - split.assigned[column.id];
      if (rest <= 0) continue;
      next[splitKey(teacher.id, column.id)] = Math.min(
        40,
        (teacher.cells[column.id] ?? 0) + rest,
      );
    }
    setDraft(next);
    setDirty((prev) => {
      const set = new Set(prev);
      set.delete(teacher.id);
      return set;
    });
    persist(teacher, next);
  };

  const status =
    split.needTotal === 0
      ? { text: "Bu fanga hali soat kiritilmagan", tone: "bg-white/15 text-white" }
      : split.restTotal === 0
        ? { text: "To`liq taqsimlandi", tone: "bg-emerald-400 text-emerald-950" }
        : split.restTotal > 0
          ? {
              text: `${split.restTotal} soat taqsimlanmagan`,
              tone: "bg-amber-300 text-amber-950",
            }
          : {
              text: `${-split.restTotal} soat ortiqcha`,
              tone: "bg-rose-300 text-rose-950",
            };

  // Panelning yuqori va quyi lentasi butun jadval kengligida, ichidagi matn
  // esa `sticky` — jadval o'ngga surilganda ham sarlavha ko'rinib turadi.
  const banner = (
    <tr>
      <td colSpan={span} className="bg-white px-[2px] pt-1.5">
        <div className="w-full rounded-t-xl bg-slate-700 px-1.5 py-1.5 shadow-sm">
          <div className="sticky left-1.5 flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 text-white">
            <span className="text-xs font-semibold">
              {subject.name} — soatlarni kim beradi?
            </span>

            <span className={cn(CHIP, "bg-white/15")}>
              {split.teachers.length} o`qituvchi
            </span>
            <span className={cn(CHIP, "bg-white/15")}>
              {split.assignedTotal} / {split.needTotal} soat
            </span>
            <span className={cn(CHIP, status.tone)}>{status.text}</span>

            <button
              type="button"
              onClick={onClose}
              title="Yopish"
              className="rounded-md bg-white/15 p-1 transition-colors hover:bg-white/30"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  const footer = (
    <tr>
      <td colSpan={span} className="bg-white px-[2px] pb-1.5">
        <div className="w-full rounded-b-xl bg-slate-100 px-1.5 pb-1.5 pt-0.5">
          <p className="sticky left-1.5 w-fit max-w-full text-[11px] leading-tight text-slate-500">
            Yuqoridagi qator — TALAB (sinfda haftasiga necha soat), bu yerdagi
            kataklar — o`qituvchilar ulushi. Taqsimot rejalashtirishning
            «Asosiy» tabiga yoziladi.
          </p>
        </div>
      </td>
    </tr>
  );

  const notice = (content) => (
    <tr>
      <td colSpan={span} className={cn("px-[2px]", BODY)}>
        <div className="sticky left-1.5 w-fit max-w-full px-1.5 py-2 text-xs text-slate-500">
          {content}
        </div>
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <>
        {banner}
        {notice(
          <span className="flex items-center gap-1.5">
            <Loader size={13} strokeWidth={2} className="animate-spin" />
            O`qituvchilar yuklanmoqda...
          </span>,
        )}
        {footer}
      </>
    );
  }

  // Fan hech kimga biriktirilmagan — taqsimlash uchun avval o'qituvchi kerak.
  if (split.teachers.length === 0) {
    return (
      <>
        {banner}
        {notice(
          <span className="flex flex-wrap items-center gap-1.5">
            <UserRoundPlus size={13} strokeWidth={2} className="text-slate-400" />
            Bu fan hech bir xodimga biriktirilmagan.
            <Link
              to="/users/staff"
              className="font-medium text-primary hover:underline"
            >
              Xodimlar bo`limida fanni belgilang
            </Link>
          </span>,
        )}
        {footer}
      </>
    );
  }

  return (
    <>
      {banner}

      {split.teachers.map((teacher) => (
        <tr key={teacher.id}>
          <td className={cn(STICKY_LEFT, GAP, BODY)}>
            <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-0.5">
              <Link
                to={`/users/${teacher.id}`}
                title={teacher.fullName}
                className="block flex-1 truncate py-0.5 text-xs font-medium text-slate-700 hover:underline"
              >
                {teacher.fullName}
              </Link>

              {canEdit && split.restTotal > 0 && (
                <button
                  type="button"
                  title="Taqsimlanmagan soatlarni shu o`qituvchiga berish"
                  onClick={() => fillRest(teacher)}
                  className="shrink-0 rounded-md bg-slate-700 p-1 text-white transition-transform hover:scale-125"
                >
                  <ArrowDownToLine size={10} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </td>

          {columns.map((column) => {
            const value = teacher.cells[column.id];
            const wanted = split.need[column.id] > 0;

            return (
              <td key={column.id} className={cn(GAP, BODY)}>
                <div
                  className={cn(
                    "rounded-md transition-colors",
                    // Soat yozilgan katak to'q — bir qarashda "kim qayerda
                    // dars beradi" ko'rinadi. Talab bor-u, hali kiritilmagan
                    // katak ochroq: u to'ldirilishi kerakligini bildiradi.
                    value !== undefined
                      ? "bg-indigo-200"
                      : wanted
                        ? "bg-white ring-1 ring-inset ring-indigo-200"
                        : "bg-slate-200/60",
                  )}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={!canEdit}
                    value={value ?? ""}
                    onChange={(e) =>
                      handleChange(teacher.id, column.id, e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    onBlur={() => handleBlur(teacher)}
                    title={`${teacher.fullName} — ${column.name}`}
                    className={cn(
                      "h-6 w-full rounded-md border-0 bg-transparent p-0 text-center text-xs",
                      "font-medium tabular-nums text-slate-700 outline-none",
                      "focus:ring-2 focus:ring-primary disabled:cursor-default",
                    )}
                  />
                </div>
              </td>
            );
          })}

          <td className={cn(STICKY_RIGHT, GAP, BODY)}>
            <div
              className={cn(TILE, "bg-indigo-200 tabular-nums text-slate-800")}
              title={
                teacher.hiddenTotal > 0
                  ? `Shundan ${teacher.hiddenTotal} soat yashirilgan sinflarda`
                  : undefined
              }
            >
              {teacher.total}
              {teacher.hiddenTotal > 0 && "*"}
            </div>
          </td>
        </tr>
      ))}

      {/* Qoldiq — talab bilan taqsimot farqi. Nol bo'lsa sinf yopilgan. */}
      <tr>
        <td className={cn(STICKY_LEFT, GAP, BODY)}>
          <div className={cn(TILE, "bg-white px-2 text-slate-600")}>
            Qoldiq
          </div>
        </td>

        {columns.map((column) => {
          const rest = split.need[column.id] - split.assigned[column.id];
          const wanted = split.need[column.id] > 0;

          return (
            <td key={column.id} className={cn(GAP, BODY)}>
              <div
                className={cn(
                  TILE,
                  "tabular-nums",
                  !wanted && rest === 0
                    ? "bg-slate-200/60 text-slate-400"
                    : rest === 0
                      ? "bg-emerald-300 text-emerald-950"
                      : rest > 0
                        ? "bg-amber-300 text-amber-950"
                        : "bg-rose-300 text-rose-950",
                )}
              >
                {!wanted && rest === 0 ? "·" : rest}
              </div>
            </td>
          );
        })}

        <td className={cn(STICKY_RIGHT, GAP, BODY)}>
          <div
            className={cn(
              TILE,
              "tabular-nums",
              split.restTotal === 0
                ? "bg-emerald-300 text-emerald-950"
                : split.restTotal > 0
                  ? "bg-amber-300 text-amber-950"
                  : "bg-rose-300 text-rose-950",
            )}
          >
            {split.restTotal}
          </div>
        </td>
      </tr>

      {footer}
    </>
  );
};

export default SubjectSplitRows;
