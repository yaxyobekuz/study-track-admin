// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Dashboard kartasi ichidagi IXCHAM jadval.
 *
 * ⚠️ SHARED — `DashboardCard` bilan bir sababdan: moliya va ta'lim
 * dashboardlaridagi jadvallar bir xil o'qilishi kerak.
 *
 * ⚠️ Global `index.css` da `thead` uchun BAZAVIY qoidalar bor: ko'k fon,
 * oq matn, `px-6 py-3` va `text-center`. Ular ro'yxat sahifalari uchun
 * to'g'ri, lekin dashboard kartasi ichida to'rtta ko'k plash bir-birining
 * ustiga terilib, ekranni og'irlashtirib yuborardi. Shuning uchun bu yerda
 * ular ATAYLAB bekor qilinadi (`[&_thead]:...` — utility qatlami, ya'ni
 * bazaviy qoidadan kuchliroq).
 *
 * ⚠️ YON BO'SHLIQ SARLAVHA VA KATAKKA BITTA JOYDAN beriladi
 * (`[&_th]:px-3 [&_td]:px-3` + chekka ustunlarda nol). Ilgari sarlavhaga
 * bazaviy `px-6`, katakka esa qo'lda `pr-3` tushib, ular bir-biriga
 * nisbatan siljib qolardi — raqamni sarlavhasi bilan bog'lash mumkin
 * emasdi.
 */
const RESET = [
  // Bazaviy thead uslubini bekor qilish
  "[&_thead]:bg-transparent",
  "[&_thead_th]:py-0 [&_thead_th]:font-medium [&_thead_th]:normal-case [&_thead_th]:text-inherit",
  // Bazaviy `tbody tr:last-child` kulrang foni — kartada oxirgi qator
  // ajralib turishi kerak emas
  "[&_tbody]:divide-y-0 [&_tbody_tr]:bg-transparent",
  // Yon bo'shliq — sarlavha va katakka bir xil
  "[&_th]:px-3 [&_td]:px-3",
  "[&_th:first-child]:pl-0 [&_td:first-child]:pl-0",
  "[&_th:last-child]:pr-0 [&_td:last-child]:pr-0",
].join(" ");

const alignClass = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

/**
 * @param {object} props
 * @param {Array<{key?: string, label: string, align?: "left"|"right"|"center"}>} props.columns
 * @param {React.ReactNode} props.children - `<MiniTr>` qatorlari
 */
const MiniTable = ({ columns = [], children, className = "" }) => (
  <table className={cn("w-full min-w-max text-xs", RESET, className)}>
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th
            key={column.key ?? column.label ?? index}
            className={cn(
              "whitespace-nowrap pb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400",
              alignClass(column.align),
            )}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>{children}</tbody>
  </table>
);

/** Qator — chegara bir joyda tursin. */
export const MiniTr = ({ children, className = "", ...rest }) => (
  <tr className={cn("border-t border-gray-100", className)} {...rest}>
    {children}
  </tr>
);

/**
 * Katak.
 *
 * `align="right"` — raqamli ustunlar uchun. `tabular-nums` bilan birga:
 * proporsional raqamlarda "1" boshqa raqamlardan tor bo'lib, ustundagi
 * sonlar bir-biriga nisbatan qiyshayib ko'rinardi.
 */
export const MiniTd = ({ children, align, className = "", ...rest }) => (
  <td
    className={cn(
      "whitespace-nowrap py-2 align-middle",
      align === "right" && "tabular-nums",
      alignClass(align),
      className,
    )}
    {...rest}
  >
    {children}
  </td>
);

export default MiniTable;
