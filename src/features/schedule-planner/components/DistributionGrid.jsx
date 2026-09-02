// React
import { useCallback, useLayoutEffect, useRef } from "react";

// Icons
import { EyeOff, Users } from "lucide-react";

// Components
import DistributionCell from "./DistributionCell";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { cellKey } from "../data/distribution.data";

// Helpers
import {
  nextCell,
  buildPasteEntries,
  parseClipboardMatrix,
} from "../helpers/distribution.helpers";

// Vertikal sarlavha: matn pastdan yuqoriga o'qiladi.
//
// ⚠️ `transform` FAQAT ichki <span> da bo'lishi shart. Uni yopishib turgan
// katakning O'ZIGA qo'ysak, transform yangi "containing block" yaratadi va
// yopishqoqlik butunlay ishlamay qoladi.
const VERTICAL_TEXT = {
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
};

// ⚠️ SILJISH QOTIRIB QO'YILMAYDI — O'LCHANADI.
//
// Jadval katagida `height` faqat MINIMUM hisoblanadi, shuning uchun uzun
// vertikal sinf nomi sarlavha qatorini cho'zib yuboradi va har qanday qat'iy
// raqam noto'g'ri bo'lib qoladi.
const VAR_ROW2 = "--dist-row2"; // sarlavha balandligi
const VAR_ROW3 = "--dist-row3"; // sarlavha + o'quvchi soni
const VAR_SCROLL = "--dist-scroll"; // uchala qator (scroll chekkasi uchun)

// Sarlavha ichidagi plitka balandligi. Balandlik KATAKKA emas, shu blokka
// beriladi va foiz ishlatilmaydi: katakka `h-*`, ichkariga `h-full` qo'yilsa
// aylanma bog'liqlik hosil bo'lib, kataklar qator balandligiga cho'zilmaydi.
const HEAD_BOX = "flex h-40 items-end justify-center rounded-xl";

// ⚠️ Plitkalar orasidagi bo'shliq `border-spacing` bilan EMAS, har katakning
// ichki to'ldirmasi bilan yasaladi. `border-spacing` haqiqiy teshik qoldiradi
// va yopishib turgan qatorlar ostidan pastdagi ma'lumot o'sha teshiklardan
// ko'rinib qolardi. To'ldirma esa katakni to'liq shaffofmas qoldiradi.
const GAP = "p-[2px]";

// z-qatlamlar qat'iy o'suvchi bo'lishi shart, aks holda teng qiymatda DOM'da
// keyingi element yutadi va yopishgan qator sarlavha USTIGA chiqadi:
//   tana katagi (auto) < tana yon ustuni (10) < yopishgan qator (20)
//   < yopishgan qator yon ustuni (30) < sarlavha (40) < sarlavha burchagi (50)
const TH = cn("sticky top-0 z-40 bg-white text-white normal-case", GAP);
const STICKY_LEFT = "sticky left-0 z-10";
const STICKY_RIGHT = "sticky right-0 z-10";
const STICKY_CORNER = "sticky top-0 z-50";
const PINNED_CELL = "sticky z-20";
const PINNED_SIDE = "sticky z-30";

// Plitka ko'rinishlari — har biri yumaloq, oralarida oq bo'shliq.
const TILE_HEAD = "bg-slate-700";
const TILE_LABEL =
  "rounded-lg px-2 py-1 text-center font-medium text-slate-700";
const TILE_META =
  "rounded-lg bg-lime-100 py-1 text-center font-medium text-slate-700";
const TILE_TOTAL = "rounded-lg py-1 text-center font-semibold text-slate-800";

/**
 * DARS TAQSIMOTI JADVALI.
 *
 * Ustunlar — TIZIMDAGI sinflar, qatorlar — TIZIMDAGI fanlar. Varaq faqat
 * katak qiymatlarini saqlaydi.
 *
 * Aktiv katakning butun QATORI va USTUNI ajratib ko'rsatiladi (sarlavhalar
 * ham) — ko'p ustunli jadvalning o'rtasida "men qaysi fan va qaysi sinf
 * ustidaman?" degan savol bir qarashda hal bo'lsin.
 *
 * Fan nomi bosilganda o'qituvchilar bo'yicha taqsimot KENG OYNADA ochiladi
 * (`onOpenSplit`). Ilgari u shu jadvalning ichida, fan qatori ostida
 * chizilardi — kataklar sinf ustunlariga to'g'ri tushsin uchun. Lekin shu
 * moslik uchun barcha 25 sinf ustunini chizishga to'g'ri kelardi, holbuki
 * bitta fanda odatda 6-10 sinfda soat bor. Oynada esa faqat kerakli
 * sinflar ko'rsatiladi — qarang: `SubjectSplitModal`.
 */
const DistributionGrid = ({
  columns,
  rows,
  values,
  totals,
  active,
  editStructure,
  onValueChange,
  onManyValues,
  onActiveChange,
  onOpenSplit,
  onToggleColumn,
  onToggleRow,
  onPasteReport,
}) => {
  const rootRef = useRef(null);
  const headRef = useRef(null);
  const studentsRef = useRef(null);
  const totalsRef = useRef(null);

  // Yopishgan qatorlarning siljishini O'LCHAB, CSS o'zgaruvchisiga yozadi.
  //
  // `useLayoutEffect` — brauzer chizishdan OLDIN: aks holda birinchi kadrda
  // qatorlar noto'g'ri joyda turib, ko'zga tashlanadigan sakrash bo'lardi.
  //
  // React holati ISHLATILMAYDI: o'lchov faqat chizishga ta'sir qiladi, uni
  // holatga aylantirish har o'lchovda ortiqcha qayta render berardi.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // ⚠️ `offsetHeight` EMAS: u butun songa PASTGA yaxlitlaydi va yopishgan
    // qator 1-2 piksel yuqorida turib, ostidagi qatorning cheti ingichka
    // chiziq bo'lib ko'rinib qolardi.
    const heightOf = (el) =>
      el ? Math.ceil(el.getBoundingClientRect().height) : 0;

    const measure = () => {
      const head = heightOf(headRef.current);
      const students = heightOf(studentsRef.current);
      const totalsH = heightOf(totalsRef.current);

      root.style.setProperty(VAR_ROW2, `${head}px`);
      root.style.setProperty(VAR_ROW3, `${head + students}px`);
      root.style.setProperty(VAR_SCROLL, `${head + students + totalsH}px`);
    };

    measure();

    // Qayta o'lchash sabablari: ustun yashirildi, oyna o'lchami o'zgardi,
    // shrift kech yuklandi.
    const observer = new ResizeObserver(measure);
    for (const el of [
      headRef.current,
      studentsRef.current,
      totalsRef.current,
    ]) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [columns.length, rows.length]);

  const focusCell = useCallback((rowIndex, colIndex) => {
    const el = document.querySelector(
      `[data-row="${rowIndex}"][data-col="${colIndex}"]`,
    );
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      const rowIndex = Number(event.currentTarget.dataset.row);
      const colIndex = Number(event.currentTarget.dataset.col);

      if (event.key === "Delete") {
        event.preventDefault();
        onValueChange(rows[rowIndex].id, columns[colIndex].id, "");
        return;
      }

      const target = nextCell(
        event.key,
        event.shiftKey,
        rowIndex,
        colIndex,
        rows.length,
        columns.length,
      );
      if (!target) return;

      // Strelkalar matn ichida kursorni suradi, Tab esa fokusni sahifadan
      // olib chiqadi — ikkalasini ham to'xtatamiz.
      event.preventDefault();
      focusCell(target.row, target.col);
    },
    [rows, columns, focusCell, onValueChange],
  );

  const handlePaste = useCallback(
    (event) => {
      const text = event.clipboardData?.getData("text");
      if (!text) return;

      const matrix = parseClipboardMatrix(text);
      if (matrix.length === 0) return;

      // Bitta katakli nusxa — brauzerning odatiy yopishtirishiga xalaqit
      // bermaymiz, u shundoq ham to'g'ri ishlaydi.
      if (matrix.length === 1 && matrix[0].length === 1) return;

      event.preventDefault();

      const rowIndex = Number(event.currentTarget.dataset.row);
      const colIndex = Number(event.currentTarget.dataset.col);
      const report = buildPasteEntries(
        matrix,
        rows,
        columns,
        rowIndex,
        colIndex,
      );

      onManyValues(report.entries);
      onPasteReport(report);
    },
    [rows, columns, onManyValues, onPasteReport],
  );

  const handleFocus = useCallback(
    (event) => {
      event.target.select();
      onActiveChange({
        row: Number(event.currentTarget.dataset.row),
        col: Number(event.currentTarget.dataset.col),
      });
    },
    [onActiveChange],
  );

  if (columns.length === 0 || rows.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="relative max-h-[calc(100svh-15rem)] overflow-auto rounded-2xl bg-white p-1 w-max hidden-scrollbar shadow"
    >
      <table className="min-w-0 border-separate border-spacing-0 text-xs">
        <thead>
          <tr ref={headRef}>
            <th className={cn(TH, STICKY_LEFT, STICKY_CORNER, "min-w-52")}>
              <div
                className={cn(
                  HEAD_BOX,
                  TILE_HEAD,
                  "justify-center items-center p-3 font-medium",
                )}
              >
                Fan yo'nalishi va nomi
              </div>
            </th>

            {columns.map((column, colIndex) => (
              <th key={column.id} className={cn(TH, "w-10 min-w-10")}>
                <div
                  className={cn(
                    HEAD_BOX,
                    "overflow-hidden pb-2",
                    active?.col === colIndex ? "bg-primary" : TILE_HEAD,
                  )}
                >
                  <span
                    style={VERTICAL_TEXT}
                    className="whitespace-nowrap text-[11px] font-medium"
                    title={column.name}
                  >
                    {column.name}
                  </span>
                </div>

                {editStructure && (
                  <button
                    type="button"
                    title="Ustunni yashirish"
                    onClick={() => onToggleColumn(column.id)}
                    className="absolute right-[calc(50%-11px)] top-2 rounded-md bg-black p-1.5 text-white hover:scale-125 transition-transform"
                  >
                    <EyeOff size={10} strokeWidth={2.5} />
                  </button>
                )}
              </th>
            ))}

            <th
              className={cn(TH, STICKY_RIGHT, STICKY_CORNER, "w-16 min-w-16")}
            >
              <div className={cn(HEAD_BOX, TILE_HEAD, "justify-center items-center p-3")}>
                <span className="text-center font-medium">
                  Haftalik umumiy soat
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* O'quvchi soni — TIZIMDAN keladi, faqat o'qiladi.
              Sarlavha ostiga yopishadi — siljish o'lchanadi. */}
          <tr ref={studentsRef}>
            <td
              className={cn(
                STICKY_LEFT,
                PINNED_SIDE,
                GAP,
                "left-0 top-[var(--dist-row2,11rem)] bg-white",
              )}
            >
              <div className={cn(TILE_META, "px-2")}>O`quvchi soni</div>
            </td>

            {columns.map((column, colIndex) => (
              <td
                key={column.id}
                className={cn(
                  PINNED_CELL,
                  GAP,
                  "top-[var(--dist-row2,11rem)] bg-white",
                )}
              >
                <div
                  className={cn(
                    TILE_META,
                    "tabular-nums",
                    active?.col === colIndex && "bg-lime-300",
                  )}
                >
                  {column.studentCount ?? 0}
                </div>
              </td>
            ))}

            <td
              className={cn(
                STICKY_RIGHT,
                PINNED_SIDE,
                GAP,
                "right-0 top-[var(--dist-row2,11rem)] bg-white",
              )}
            >
              <div className={cn(TILE_TOTAL, "bg-lime-200 tabular-nums")}>
                {totals.students}
              </div>
            </td>
          </tr>

          {/* Fanlar ro'yhati — USTUN yig'indisi, hisoblanadi */}
          <tr ref={totalsRef}>
            <td
              className={cn(
                STICKY_LEFT,
                PINNED_SIDE,
                GAP,
                "left-0 top-[var(--dist-row3,12.5rem)] bg-white",
              )}
            >
              <div className={cn(TILE_META, "px-2")}>Fanlar ro`yhati</div>
            </td>

            {columns.map((column, colIndex) => (
              <td
                key={column.id}
                className={cn(
                  PINNED_CELL,
                  GAP,
                  "top-[var(--dist-row3,12.5rem)] bg-white",
                )}
              >
                <div
                  className={cn(
                    TILE_META,
                    "tabular-nums",
                    active?.col === colIndex && "bg-lime-300",
                  )}
                >
                  {totals.byColumn[column.id]}
                </div>
              </td>
            ))}

            <td
              className={cn(
                STICKY_RIGHT,
                PINNED_SIDE,
                GAP,
                "right-0 top-[var(--dist-row3,12.5rem)] bg-white",
              )}
            >
              <div className={cn(TILE_TOTAL, "bg-lime-200 tabular-nums")}>
                {totals.grand}
              </div>
            </td>
          </tr>

          {/* Fan qatorlari */}
          {rows.map((row, rowIndex) => {
            const rowActive = active?.row === rowIndex;

            return (
              <tr key={row.id}>
                <td className={cn(STICKY_LEFT, GAP, "bg-white")}>
                  <div
                    className={cn(
                      TILE_LABEL,
                      "flex items-center gap-1 relative",
                      rowActive ? "bg-primary text-white" : "bg-slate-100",
                    )}
                  >
                    {/* Fan nomi — TUGMA: o'qituvchilar bo'yicha taqsimot
                        oynasini ochadi. Yashirish tugmasi bilan YONMA-YON
                        turadi, ichida emas: ichma-ich <button> yaroqsiz HTML
                        va ikkinchi tugma bosilmay qolardi. */}
                    <button
                      type="button"
                      onClick={() => onOpenSplit(row)}
                      title={`${row.name} — o'qituvchilar bo'yicha taqsimot`}
                      className="flex min-w-0 flex-1 items-center gap-1 text-left"
                    >
                      <Users
                        size={12}
                        strokeWidth={2.5}
                        className="shrink-0 opacity-40"
                      />
                      <span className="block flex-1 truncate">{row.name}</span>
                    </button>

                    {editStructure && (
                      <button
                        type="button"
                        title="Qatorni yashirish"
                        onClick={() => onToggleRow(row.id)}
                        className={cn(
                          "absolute right-0 rounded-lg bg-black p-1.5 text-white hover:scale-125 transition-transform",
                        )}
                      >
                        <EyeOff size={10} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </td>

                {columns.map((column, colIndex) => (
                  <DistributionCell
                    key={column.id}
                    subjectId={row.id}
                    classId={column.id}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    value={values[cellKey(row.id, column.id)]}
                    highlighted={rowActive || active?.col === colIndex}
                    isActive={rowActive && active?.col === colIndex}
                    onChange={onValueChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={handleFocus}
                  />
                ))}

                <td className={cn(STICKY_RIGHT, GAP, "bg-white")}>
                  <div
                    className={cn(
                      TILE_TOTAL,
                      "tabular-nums",
                      rowActive ? "bg-emerald-300" : "bg-emerald-100",
                    )}
                  >
                    {totals.byRow[row.id]}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DistributionGrid;
