// Icons
import { ChartColumnBig } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Hisobot panelining qobig'i — sarlavha, izoh, o'ng burchakdagi harakat va
 * bo'sh holat.
 *
 * Sahifada o'nga yaqin panel bor va ularning hammasi bir xil ramkada
 * turishi kerak: aks holda har biri o'zicha "Ma'lumot yo'q" chizib,
 * ekranda uch xil bo'sh holat paydo bo'lardi (`ChartCard` bilan bir xil
 * mulohaza, lekin bu yerda balandlik majburiy emas — ro'yxatli panellar
 * kontentiga qarab cho'ziladi).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.hint] - sarlavha ostidagi bir qatorli izoh
 * @param {React.ReactNode} [props.action] - o'ng burchak (filtr, havola)
 * @param {boolean} [props.isEmpty]
 * @param {string} [props.emptyText]
 * @param {number} [props.bodyHeight] - diagramma panellari uchun qat'iy balandlik
 * @param {string} [props.className]
 * @param {string} [props.bodyClassName]
 * @param {React.ReactNode} props.children
 */
const ReportPanelCard = ({
  title,
  hint,
  action = null,
  isEmpty = false,
  emptyText = "Bu davr uchun ma'lumot yo'q",
  bodyHeight,
  className = "",
  bodyClassName = "",
  children,
}) => (
  <div
    className={cn(
      "rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5",
      className,
    )}
  >
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
      {action}
    </div>

    <div
      className={cn("mt-4", bodyClassName)}
      style={bodyHeight ? { height: bodyHeight } : undefined}
    >
      {isEmpty ? (
        <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 text-gray-300">
          <ChartColumnBig className="size-8" strokeWidth={1.5} />
          <p className="text-sm text-gray-400">{emptyText}</p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default ReportPanelCard;
