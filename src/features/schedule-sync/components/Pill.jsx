// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Kichik yorliq. Bo'lim bo'ylab BITTA shakl — holat, tur va belgilar bir
 * xil ko'rinadi. Ma'no faqat rangda emas, MATNDA ham bor.
 *
 * @param {object} props
 * @param {{ label: string, className: string }} [props.meta] - data fayldagi yozuv
 * @param {React.ReactNode} [props.children] - `meta` o'rniga matn
 * @param {string} [props.className]
 * @param {string} [props.title]
 */
const Pill = ({ meta, children, className = "", title }) => (
  <span
    title={title}
    className={cn(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
      meta?.className || "bg-gray-100 text-gray-600 ring-gray-200",
      className,
    )}
  >
    {children ?? meta?.label}
  </span>
);

export default Pill;
