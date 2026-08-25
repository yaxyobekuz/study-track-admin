// Icons
import { AlertCircle, BarChart3 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

/**
 * Diagramma qobig'i — sarlavha, izoh va uch holat (yuklanmoqda / xato / bo'sh).
 *
 * Har bir diagrammada shu uch holatni qayta yozmaslik uchun bitta joyda:
 * ilgari har komponent o'zicha "Yuklanmoqda..." chizib, ekranda uch xil
 * bo'sh holat paydo bo'lardi.
 */
const ChartCard = ({
  title,
  hint,
  action,
  isLoading,
  isError,
  isEmpty,
  emptyText = "Bu davr uchun ma'lumot yo'q",
  height = 300,
  children,
}) => (
  <Card>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
      {action}
    </div>

    <div className="mt-4" style={{ height }}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="size-7 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        </div>
      ) : isError ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <AlertCircle className="size-7" />
          <p className="text-sm">Ma'lumotni yuklab bo'lmadi</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <BarChart3 className="size-7" />
          <p className="text-sm">{emptyText}</p>
        </div>
      ) : (
        children
      )}
    </div>
  </Card>
);

export default ChartCard;
