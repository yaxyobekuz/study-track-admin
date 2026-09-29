// React
import { createContext, useContext } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { T, rowDelay } from "../data/guard.tokens";

/**
 * BO'LIM JADVALI — CSS GRID, `<table>` EMAS.
 *
 * ⚠️ `<table>` ISHLATILMAYDI va bu ataylab. Global CSS har bir `<table>` ga
 * o'z uslubini MAJBURLAYDI (`src/styles/index.css`): ko'k sarlavha, oq
 * katta harflar, `tbody { divide-y }`, oxirgi qatorga kulrang fon va
 * `min-w-[934px]`. Bu bo'lim esa chegarasiz sirt va yengil tipografiya
 * bilan qurilgan — ikkisi bir ekranda to'qnashadi. Uslubni sinf bilan
 * ustidan yozish mumkin edi, lekin u global qoida bilan doimiy
 * spesifiklik kurashiga aylanardi.
 *
 * ⚠️ Qo'shni bo'lim (`lessonHours/LedgerTable.jsx`) AYNI sababdan aynan
 * shunday qilgan. Farqi: u gridni har jadvalda qaytadan yozadi, bu yerda
 * esa bitta komponent — bo'limda to'rtta jadval bor va to'rt nusxa
 * bo'lsa, ustun kengliklari asta-sekin bir-biridan uzoqlashardi.
 *
 * ⚠️ USTUN SHABLONI KONTEKST ORQALI tarqaladi: qatorlar uni takrorlamaydi.
 * Takrorlansa, ustun qo'shilganda sarlavha bilan qator siljib ketardi va
 * buni faqat ko'z bilan payqash mumkin bo'lardi.
 *
 * @example
 * <GuardTable
 *   template="minmax(180px,1.4fr) 1fr 150px"
 *   columns={[{ label: "O'quvchi" }, { label: "Qurilma" }, { label: "Holat", align: "right" }]}
 * >
 *   {rows.map((row, i) => (
 *     <GuardRow key={row.id} index={i}>
 *       <GuardCell>…</GuardCell>
 *     </GuardRow>
 *   ))}
 * </GuardTable>
 */

const TemplateContext = createContext("1fr");

const alignOf = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

export const GuardTable = ({ template, columns = [], minWidth = 760, children }) => (
  <TemplateContext.Provider value={template}>
    <div className="overflow-x-auto">
      <div style={{ minWidth }}>
        <div
          className="grid items-end gap-x-3 border-b border-slate-100 pb-2"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((column, index) => (
            <div
              key={column.key ?? (typeof column.label === "string" ? column.label : index)}
              className={cn(T.th, alignOf(column.align))}
            >
              {column.label}
            </div>
          ))}
        </div>

        <div>{children}</div>
      </div>
    </div>
  </TemplateContext.Provider>
);

/**
 * Jadval qatori.
 *
 * ⚠️ Qatorlar CHIZIQ bilan emas, juda yengil ajratgich va `hover` foni
 * bilan ajraladi — bo'limning qolgan kartalari ham chegarasiz.
 */
export const GuardRow = ({ index = 0, className, children }) => {
  const template = useContext(TemplateContext);

  return (
    <div
      className={cn(
        "grid items-center gap-x-3 border-b border-slate-50 py-2.5 last:border-0",
        T.row,
        "motion-safe:animate-post",
        className,
      )}
      style={{ gridTemplateColumns: template, animationDelay: `${rowDelay(index)}ms` }}
    >
      {children}
    </div>
  );
};

/** Katak — faqat tekislash va matnning toshib ketmasligi. */
export const GuardCell = ({ align, className, children }) => (
  <div className={cn("min-w-0", alignOf(align), className)}>{children}</div>
);

export default GuardTable;
