// React
import { useCallback } from "react";

// Icons
import { EyeOff } from "lucide-react";

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

// Vertikal sarlavha: matn pastdan yuqoriga o'qiladi (skrinshotdagi kabi).
//
// ⚠️ `transform` FAQAT ichki <span> da bo'lishi shart. Uni sticky <th> ning
// o'ziga qo'ysak, transform yangi "containing block" yaratadi va yopishqoq
// sarlavha butunlay ishlamay qoladi.
const VERTICAL_TEXT = { writingMode: "vertical-rl", transform: "rotate(180deg)" };

// Global `thead th` qoidasi (px-6 py-3, uppercase, text-white, text-center)
// zich jadvalni buzadi — har bir sarlavha katagi o'z sinflarini ANIQ beradi
// (utility'lar @layer base dan ustun keladi).
//
// ⚠️ `border-collapse` ISHLATILMAYDI: yig'ilgan chegara jadvalga tegishli
// bo'lib qoladi va yopishib turgan katak scroll paytida chegarasini yo'qotadi.
const TH =
  "sticky top-0 z-30 border border-gray-300 bg-slate-700 p-0 text-white normal-case";
const STICKY_LEFT = "sticky left-0 z-20";
const STICKY_RIGHT = "sticky right-0 z-20";
const STICKY_CORNER = "sticky top-0 z-40";

/**
 * DARS TAQSIMOTI JADVALI.
 *
 * Ustunlar — TIZIMDAGI sinflar, qatorlar — TIZIMDAGI fanlar. Varaq faqat
 * katak qiymatlarini saqlaydi.
 *
 * Aktiv katakning butun QATORI va USTUNI ajratib ko'rsatiladi (sarlavhalar
 * ham) — 25 ustunli jadvalning o'rtasida "men qaysi fan va qaysi sinf
 * ustidaman?" degan savol bir qarashda hal bo'lsin.
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
  onToggleColumn,
  onToggleRow,
  onPasteReport,
}) => {
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
      const report = buildPasteEntries(matrix, rows, columns, rowIndex, colIndex);

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
    <div className="relative max-h-[calc(100svh-15rem)] overflow-auto rounded-xl border border-gray-300 bg-white">
      <table className="min-w-0 border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            <th
              className={cn(
                TH,
                STICKY_LEFT,
                STICKY_CORNER,
                "min-w-52 px-2 py-1 text-left align-bottom",
              )}
            >
              Fan yo`nalishi va nomi
            </th>

            {columns.map((column, colIndex) => (
              <th
                key={column.id}
                className={cn(
                  TH,
                  "relative w-9 min-w-9",
                  active?.col === colIndex && "bg-primary",
                )}
              >
                <div className="flex h-28 items-end justify-center pb-1">
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
                    className="absolute right-0 top-0 rounded bg-black/40 p-0.5 text-white hover:bg-black/70"
                  >
                    <EyeOff size={10} strokeWidth={2.5} />
                  </button>
                )}
              </th>
            ))}

            <th
              className={cn(
                TH,
                STICKY_RIGHT,
                STICKY_CORNER,
                "w-16 min-w-16 px-1 py-1 align-bottom",
              )}
            >
              <span className="text-[11px] leading-tight">
                Haftalik
                <br />
                umumiy soat
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* O'quvchi soni — TIZIMDAN keladi, shuning uchun faqat o'qiladi */}
          <tr>
            <td
              className={cn(
                STICKY_LEFT,
                "border border-gray-300 bg-lime-50 px-2 py-0.5 text-center font-medium",
              )}
            >
              O`quvchi soni
            </td>

            {columns.map((column, colIndex) => (
              <td
                key={column.id}
                className={cn(
                  "border border-gray-200 px-0 text-center font-medium tabular-nums",
                  active?.col === colIndex ? "bg-sky-100" : "bg-lime-50",
                )}
              >
                {column.studentCount ?? 0}
              </td>
            ))}

            <td
              className={cn(
                STICKY_RIGHT,
                "border border-gray-300 bg-lime-100 px-1 text-center font-semibold tabular-nums",
              )}
            >
              {totals.students}
            </td>
          </tr>

          {/* Fanlar ro'yhati — USTUN yig'indisi, hisoblanadi */}
          <tr>
            <td
              className={cn(
                STICKY_LEFT,
                "border border-gray-300 bg-lime-50 px-2 py-0.5 text-center font-medium",
              )}
            >
              Fanlar ro`yhati
            </td>

            {columns.map((column, colIndex) => (
              <td
                key={column.id}
                className={cn(
                  "border border-gray-200 px-0 text-center font-medium tabular-nums",
                  active?.col === colIndex ? "bg-sky-100" : "bg-lime-50",
                )}
              >
                {totals.byColumn[column.id]}
              </td>
            ))}

            <td
              className={cn(
                STICKY_RIGHT,
                "border border-gray-300 bg-lime-100 px-1 text-center font-semibold tabular-nums",
              )}
            >
              {totals.grand}
            </td>
          </tr>

          {/* Fan qatorlari */}
          {rows.map((row, rowIndex) => {
            const rowActive = active?.row === rowIndex;

            return (
              <tr key={row.id}>
                <td
                  className={cn(
                    STICKY_LEFT,
                    "border border-gray-300 px-2 py-0.5",
                    // Qaysi FAN ustida turganingiz — chap ustunda ko'rinadi.
                    rowActive ? "bg-primary font-medium text-white" : "bg-white",
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="block flex-1 truncate text-center" title={row.name}>
                      {row.name}
                    </span>

                    {editStructure && (
                      <button
                        type="button"
                        title="Qatorni yashirish"
                        onClick={() => onToggleRow(row.id)}
                        className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <EyeOff size={12} strokeWidth={2} />
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

                <td
                  className={cn(
                    STICKY_RIGHT,
                    "border border-gray-300 px-1 text-center font-semibold tabular-nums",
                    rowActive ? "bg-emerald-200" : "bg-emerald-100",
                  )}
                >
                  {totals.byRow[row.id]}
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
