// Toast
import { toast } from "sonner";

// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowDownToLine, Loader, Table2, UserRoundPlus } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Queries
import { useQuery } from "@tanstack/react-query";
import { plannerQueries } from "../queries/planner.queries";
import { useSavePlannerLoad } from "../queries/planner.mutations";

// Helpers
import {
  nextCell,
  splitKey,
  buildSplitPayload,
  buildSubjectSplit,
} from "../helpers/distribution.helpers";

// Utils
import { cn } from "@/shared/utils/cn";

const MODAL_NAME = "plannerSubjectSplit";

// Sinf ustuni: nomi to'liq sig'masa qisqaradi, lekin katak raqam uchun
// yetarli keng qoladi.
const COL = "min-w-[76px] px-1 py-1";

// ⚠️ `normal-case` SHART. Global `index.css` da `thead th` uchun `uppercase`
// qoidasi bor va usiz sinf nomlari "1-A SINF" bo'lib chiqadi — atoqli nom
// buzilib ketardi.
const HEAD_CELL =
  "sticky top-0 z-10 bg-gray-50 px-2 py-2 text-xs font-medium normal-case text-gray-500";

// Muzlatilgan chetki ustunlar. Soya — ular jadval USTIDA suzayotganini
// ko'rsatadi: usiz gorizontal aylantirishda ostidagi ustun kesilgandek
// ko'rinadi.
const SIDE = "sticky left-0 z-20 bg-white shadow-[8px_0_8px_-8px_rgba(0,0,0,.08)]";
const SIDE_HEAD = cn(SIDE, "z-30 bg-gray-50 normal-case");
const END = "sticky right-0 z-20 bg-white shadow-[-8px_0_8px_-8px_rgba(0,0,0,.08)]";
const END_HEAD = cn(END, "z-30 bg-gray-50 normal-case");
const TOTAL_TILE =
  "rounded-lg px-2 py-1.5 text-center text-sm font-semibold tabular-nums";
const CHIP = "rounded-lg px-2 py-1 text-xs font-medium";

/**
 * FAN SOATLARINI O'QITUVCHILARGA TAQSIMLASH.
 *
 * ⚠️ Ilgari bu blok varaqning O'ZI ichida, fan qatori ostidagi qatorlar bo'lib
 * ochilardi — shunda kataklar yuqoridagi sinf ustunlariga aynan tushardi.
 * Lekin shu moslik uchun BARCHA 25 sinf ustunini chizishga to'g'ri kelardi,
 * holbuki bitta fanda odatda 6-10 sinfda soat bor: kataklarning ko'pi o'lik
 * joy edi. "Ortiqchasini yashirish" bilan "varaqqa moslash" bir-biriga zid,
 * shuning uchun taqsimot alohida keng oynaga ko'chirildi va endi FAQAT
 * kerakli sinflar ko'rsatiladi.
 *
 * Ma'no taqsimoti (o'zgarmadi):
 *   "Talab" qatori  → varaqdagi soat ("5-A da matematikadan 4 soat")
 *   o'rtadagi kataklar → KIM beradi ("Aliyev — 4")
 *   "Qoldiq" qatori → farq (0 bo'lsa fan to'liq taqsimlangan)
 *
 * ⚠️ Varaq localStorage'da, taqsimot esa SERVERDA (`PlannerLoad`) — u jadval
 * shakllantirishning haqiqiy kirimi va brauzer xotirasida yashamasligi kerak.
 */
const SubjectSplitModal = ({ columns, values, canEdit }) => {
  const { data } = useModal(MODAL_NAME);
  const subject = data?.subject;

  return (
    <ResponsiveModal
      name={MODAL_NAME}
      className="max-w-6xl"
      title={
        subject ? `${subject.name} — soatlarni kim beradi?` : "Dars taqsimoti"
      }
      description="«Talab» — varaqdagi soat. Bu yerga yozilgani rejalashtirishning «Asosiy» tabidagi yuklama jadvaliga tushadi."
    >
      <Content columns={columns} values={values} canEdit={canEdit} />
    </ResponsiveModal>
  );
};

const Content = ({ subject, columns, values, canEdit }) => {
  const containerRef = useRef(null);
  const subjectId = subject?.id;

  // ⚠️ So'rov shu komponent ICHIDA: oyna yopiq turganda Content umuman
  // mount qilinmaydi, ya'ni yuklama ma'lumoti behuda so'ralmaydi.
  const { data: loads, isLoading } = useQuery(plannerQueries.loads());
  const { mutateAsync: saveLoad } = useSavePlannerLoad();

  // Saqlanmagan qiymatlar. `null` — "sinf o'qituvchidan olib tashlandi".
  const [draft, setDraft] = useState({});
  // Fokusdan chiqqanda kim saqlanishi kerakligi (har harf uchun so'rov emas).
  const [dirty, setDirty] = useState(() => new Set());

  const split = buildSubjectSplit({
    subjectId,
    columns,
    values,
    loadRows: loads?.rows ?? [],
    draft,
  });

  // Saqlash muvaffaqiyatsiz bo'lsa qoralama QAYTARILADI — aks holda ekranda
  // "saqlangan" bo'lib turgan, aslida yo'q qiymat qolib ketardi.
  const persist = useCallback(
    (teacher, nextDraft) => {
      const keys = Object.keys(nextDraft).filter((key) =>
        key.startsWith(`${teacher.id}|`),
      );

      return saveLoad(buildSplitPayload(teacher, subjectId, nextDraft)).catch(
        (err) => {
          toast.error(
            err.response?.data?.message || "Taqsimotni saqlashda xatolik",
          );
          setDraft((prev) => {
            const next = { ...prev };
            for (const key of keys) delete next[key];
            return next;
          });
        },
      );
    },
    [saveLoad, subjectId],
  );

  // ⚠️ Oyna ✕, Escape yoki fon bosilganda ham yopiladi. Odatda katakdan
  // `blur` shundan oldin o'tadi va saqlanadi, lekin bu KAFOLAT emas —
  // shuning uchun mount tugaganda saqlanmagan qoralama majburan yuboriladi.
  // Aks holda oxirgi terilgan raqam jimgina yo'qolardi.
  //
  // ⚠️ Ref render paytida EMAS, effektda yangilanadi: render paytida ref'ga
  // yozish React'ning qoidasini buzadi (va linter ham to'xtatadi).
  const pendingRef = useRef(null);
  useEffect(() => {
    pendingRef.current = { teachers: split.teachers, draft, dirty, persist };
  });

  useEffect(() => {
    return () => {
      const pending = pendingRef.current;
      if (!pending) return;
      for (const teacher of pending.teachers) {
        if (pending.dirty.has(teacher.id)) {
          pending.persist(teacher, pending.draft);
        }
      }
    };
  }, []);

  const focusCell = useCallback((rowIndex, colIndex) => {
    // ⚠️ Qidiruv KONTEYNER ichida: varaqning o'zi ham `data-row/col` ishlatadi
    // va u oyna ortida DOM'da turibdi — global qidiruv o'sha kataklarga
    // fokus berib yuborardi.
    const el = containerRef.current?.querySelector(
      `[data-row="${rowIndex}"][data-col="${colIndex}"]`,
    );
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  if (!subject) return null;

  // Talab bor yoki soat allaqachon yozilgan sinflar.
  //
  // ⚠️ `assigned > 0` sharti SHART: talab keyinchalik nolga tushirilgan, ammo
  // soat yozilgan sinf ro'yxatdan tushib qolsa, o'sha soatni ekrandan
  // tuzatishning iloji qolmasdi.
  const shownColumns = columns.filter(
    (column) => split.need[column.id] > 0 || split.assigned[column.id] > 0,
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

  const handleBlur = (teacher) => {
    if (!dirty.has(teacher.id)) return;
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(teacher.id);
      return next;
    });
    persist(teacher, draft);
  };

  // Varaqning o'zidagi bilan bir xil klaviatura: strelkalar, Enter, Tab,
  // Home/End — `nextCell` helperi ikkalasiga ham xizmat qiladi.
  const handleKeyDown = (event, teacher) => {
    const rowIndex = Number(event.currentTarget.dataset.row);
    const colIndex = Number(event.currentTarget.dataset.col);

    // Escape — oynani yopadi. `preventDefault` QILINMAYDI: yopishni Radix
    // o'zi bajaradi, biz faqat katakdan chiqib, saqlanishini kafolatlaymiz.
    if (event.key === "Escape") {
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      handleChange(teacher.id, shownColumns[colIndex].id, "");
      return;
    }

    const target = nextCell(
      event.key,
      event.shiftKey,
      rowIndex,
      colIndex,
      split.teachers.length,
      shownColumns.length,
    );
    if (!target) return;

    // Strelkalar matn ichida kursorni suradi, Tab esa fokusni oynadan
    // olib chiqadi — ikkalasini ham to'xtatamiz.
    event.preventDefault();
    focusCell(target.row, target.col);
  };

  // "Qoldiqni shu o'qituvchiga" — taqsimlanmagan soatlarni bir bosishda beradi.
  const fillRest = (teacher) => {
    const next = { ...draft };
    for (const column of shownColumns) {
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
      ? { text: "Soat kiritilmagan", tone: "bg-gray-100 text-gray-600" }
      : split.restTotal === 0
        ? { text: "To'liq taqsimlandi", tone: "bg-emerald-50 text-emerald-700" }
        : split.restTotal > 0
          ? {
              text: `${split.restTotal} soat taqsimlanmagan`,
              tone: "bg-amber-50 text-amber-700",
            }
          : {
              text: `${-split.restTotal} soat ortiqcha`,
              tone: "bg-rose-50 text-rose-700",
            };

  if (isLoading) {
    return (
      <Notice>
        <Loader size={14} strokeWidth={2} className="animate-spin" />
        O'qituvchilar yuklanmoqda...
      </Notice>
    );
  }

  // Fan hech kimga biriktirilmagan — taqsimlash uchun avval o'qituvchi kerak.
  if (split.teachers.length === 0) {
    return (
      <Notice>
        <UserRoundPlus size={14} strokeWidth={2} className="text-gray-400" />
        Bu fan hech bir xodimga biriktirilmagan.
        <Link
          to="/users/staff"
          className="font-medium text-primary hover:underline"
        >
          Xodimlar bo'limida fanni belgilang
        </Link>
      </Notice>
    );
  }

  if (shownColumns.length === 0) {
    return (
      <Notice>
        <Table2 size={14} strokeWidth={2} className="text-gray-400" />
        Bu fanga hali soat kiritilmagan — avval varaqdagi kataklarga soat yozing.
      </Notice>
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      {/* Xulosa — "qancha kerak, qanchasi taqsimlandi" bir qarashda */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(CHIP, "bg-gray-100 text-gray-600")}>
          {split.teachers.length} o'qituvchi
        </span>
        <span className={cn(CHIP, "bg-gray-100 text-gray-600")}>
          {split.assignedTotal} / {split.needTotal} soat
        </span>
        <span className={cn(CHIP, status.tone)}>{status.text}</span>
      </div>

      <div
        ref={containerRef}
        className="min-w-0 overflow-x-auto rounded-xl ring-1 ring-gray-100"
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          {/* ⚠️ `bg-gray-50` ataylab: global uslubda `thead` ko'k (`bg-primary`) */}
          <thead className="bg-gray-50">
            <tr>
              <th
                className={cn(
                  HEAD_CELL,
                  SIDE_HEAD,
                  "min-w-48 border-b border-gray-100 text-left",
                )}
              >
                O'qituvchi
              </th>

              {shownColumns.map((column) => (
                <th
                  key={column.id}
                  className={cn(HEAD_CELL, COL, "border-b border-gray-100")}
                >
                  <span
                    title={column.name}
                    className="block max-w-[120px] truncate"
                  >
                    {column.name}
                  </span>
                </th>
              ))}

              <th
                className={cn(
                  HEAD_CELL,
                  END_HEAD,
                  "min-w-16 border-b border-l border-gray-100",
                )}
              >
                Jami
              </th>
            </tr>

            {/* Talab — varaqdan keladi, faqat o'qish uchun */}
            <tr>
              <th
                className={cn(
                  SIDE_HEAD,
                  "border-b border-gray-100 bg-lime-50 px-2 py-1.5 text-left text-xs font-medium text-slate-600",
                )}
              >
                Talab
              </th>

              {shownColumns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    COL,
                    "border-b border-gray-100 bg-lime-50 text-center text-sm font-medium tabular-nums text-slate-700",
                  )}
                >
                  {split.need[column.id] || "·"}
                </td>
              ))}

              <td
                className={cn(
                  END_HEAD,
                  "border-b border-l border-gray-100 bg-lime-50 px-2 text-center text-sm font-semibold tabular-nums text-slate-800",
                )}
              >
                {split.needTotal}
              </td>
            </tr>
          </thead>

          <tbody>
            {split.teachers.map((teacher, rowIndex) => (
              // ⚠️ `bg-white` SHART: global uslubda oxirgi `tbody tr` kulrang
              // (`last:bg-gray-100`) bo'lib qoladi.
              <tr key={teacher.id} className="bg-white">
                <td className={cn(SIDE, "px-2 py-1")}>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/users/${teacher.id}`}
                      title={teacher.fullName}
                      className="block flex-1 truncate text-sm font-medium text-slate-700 hover:underline"
                    >
                      {teacher.fullName}
                    </Link>

                    {canEdit && split.restTotal > 0 && (
                      <button
                        type="button"
                        onClick={() => fillRest(teacher)}
                        title="Taqsimlanmagan soatlarni shu o'qituvchiga berish"
                        className="shrink-0 rounded-lg bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
                      >
                        <ArrowDownToLine size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </td>

                {shownColumns.map((column, colIndex) => {
                  const value = teacher.cells[column.id];
                  const wanted = split.need[column.id] > 0;

                  return (
                    <td key={column.id} className={COL}>
                      <input
                        type="text"
                        inputMode="numeric"
                        data-row={rowIndex}
                        data-col={colIndex}
                        disabled={!canEdit}
                        value={value ?? ""}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          handleChange(teacher.id, column.id, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, teacher)}
                        onBlur={() => handleBlur(teacher)}
                        title={`${teacher.fullName} — ${column.name}`}
                        className={cn(
                          "h-9 w-full rounded-lg border-0 text-center text-sm font-medium tabular-nums",
                          "text-slate-800 outline-none ring-1 ring-inset transition-colors",
                          "focus:ring-2 focus:ring-primary disabled:cursor-default",
                          // To'ldirilgan katak to'qroq — "kim qayerda dars
                          // beradi" bir qarashda ko'rinadi. Talab bor-u, hali
                          // bo'sh katak ochroq: u to'ldirilishi kerak.
                          value !== undefined
                            ? "bg-indigo-50 ring-indigo-200"
                            : wanted
                              ? "bg-white ring-gray-200"
                              : "bg-gray-50 ring-transparent",
                        )}
                      />
                    </td>
                  );
                })}

                <td className={cn(END, "border-l border-gray-100 px-2 py-1")}>
                  <div
                    className={cn(TOTAL_TILE, "bg-indigo-50 text-slate-800")}
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
          </tbody>

          {/* Qoldiq — talab bilan taqsimot farqi. Nol bo'lsa sinf yopilgan. */}
          <tfoot className="bg-white">
            <tr>
              <th
                className={cn(
                  SIDE,
                  "border-t border-gray-100 px-2 py-1.5 text-left text-xs font-medium text-gray-500",
                )}
              >
                Qoldiq
              </th>

              {shownColumns.map((column) => {
                const rest = split.need[column.id] - split.assigned[column.id];
                const wanted = split.need[column.id] > 0;

                return (
                  <td
                    key={column.id}
                    className={cn(COL, "border-t border-gray-100")}
                  >
                    <div
                      className={cn(
                        "rounded-lg py-1 text-center text-xs font-semibold tabular-nums",
                        !wanted && rest === 0
                          ? "bg-gray-50 text-gray-400"
                          : rest === 0
                            ? "bg-emerald-100 text-emerald-800"
                            : rest > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800",
                      )}
                    >
                      {!wanted && rest === 0 ? "·" : rest}
                    </div>
                  </td>
                );
              })}

              <td
                className={cn(END, "border-l border-t border-gray-100 px-2 py-1")}
              >
                <div
                  className={cn(
                    TOTAL_TILE,
                    split.restTotal === 0
                      ? "bg-emerald-100 text-emerald-800"
                      : split.restTotal > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800",
                  )}
                >
                  {split.restTotal}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

/** Bo'sh va yuklanish holatlari — bir xil ko'rinishda. */
const Notice = ({ children }) => (
  <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-4 text-sm text-gray-500">
    {children}
  </div>
);

export default SubjectSplitModal;
