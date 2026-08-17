// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Jadval qobig'i.
 *
 * Moliya bo'limida oltita ekran bir xil xom `<table>` markup'ini
 * takrorlayotgan edi (gorizontal scroll konteyneri, thead sinflari,
 * qator chegaralari). Bu — o'sha takrorning yagona joyi.
 *
 * `thead` uslubi global CSS dan keladi (`src/styles/index.css` da
 * `thead` — `bg-primary`), shuning uchun bu yerda faqat joylashuv.
 *
 * @param {object} props
 * @param {Array<string|{label: string, align?: "left"|"right"|"center", className?: string}>} props.columns
 * @param {React.ReactNode} props.children - `<tr>` qatorlari
 * @param {string} [props.className]
 */
const Table = ({ columns = [], children, className = "" }) => (
  <div className={cn("overflow-x-auto rounded-2xl bg-white", className)}>
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          {columns.map((column, index) => {
            const config = typeof column === "string" ? { label: column } : column;

            return (
              <th
                key={config.label || index}
                className={cn(
                  "whitespace-nowrap px-4 py-3 font-medium text-white",
                  config.align === "right" && "text-right",
                  config.align === "center" && "text-center",
                  !config.align && "text-left",
                  config.className,
                )}
              >
                {config.label}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>{children}</tbody>
    </table>
  </div>
);

/** Jadval qatori — chegara bir joyda turishi uchun. */
export const Tr = ({ children, className = "", ...props }) => (
  <tr className={cn("border-t border-gray-100", className)} {...props}>
    {children}
  </tr>
);

/**
 * Katak. `align="right"` — pul ustunlari uchun: raqamlar o'ng chetdan
 * tekislansa, ko'z ularni ustma-ust solishtira oladi.
 */
export const Td = ({ children, align, nowrap = true, className = "", ...props }) => (
  <td
    className={cn(
      "px-4 py-3",
      nowrap && "whitespace-nowrap",
      align === "right" && "text-right",
      align === "center" && "text-center",
      className,
    )}
    {...props}
  >
    {children}
  </td>
);

export default Table;
