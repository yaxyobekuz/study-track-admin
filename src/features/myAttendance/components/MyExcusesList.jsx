// Toaster
import { toast } from "sonner";

// Icons
import { CalendarX2 } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";

// Data
import {
  EXCUSE_TYPE_LABELS,
  EXCUSE_STATUS_LABELS,
  EXCUSE_STATUS_COLORS,
} from "@/features/attendance/data/attendance.data";

// Queries
import { myAttendanceQueries } from "../queries/myAttendance.queries";
import { useCancelMyExcuse } from "../queries/myAttendance.mutations";

/**
 * Mening uzrli so'rovlarim.
 *
 * Faqat `pending` so'rov bekor qilinadi: ko'rib chiqilgani davomat yozuviga
 * ta'sir qilib bo'lgan va uni orqaga qaytarish rahbarning ishi.
 */
const MyExcusesList = () => {
  const { data: excuses = [], isLoading } = useQuery(
    myAttendanceQueries.excuses({ limit: 20 }),
  );
  const cancelExcuse = useCancelMyExcuse();

  const handleCancel = (id) =>
    cancelExcuse.mutate(id, {
      onSuccess: () => toast.success("So'rov bekor qilindi"),
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <Card title="Uzrli so'rovlarim" className="space-y-3">
      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">Yuklanmoqda...</p>
      )}

      {!isLoading && excuses.length === 0 && (
        <div className="px-6 py-8 text-center">
          <CalendarX2 className="mx-auto size-8 text-gray-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-gray-500">
            Hali uzrli so&apos;rov yuborilmagan.
          </p>
        </div>
      )}

      {excuses.map((excuse) => (
        <div
          key={excuse.id}
          className="space-y-1.5 rounded-xl border border-gray-100 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900">
              {formatDateUz(excuse.date)}
              <span className="ml-2 text-xs font-normal text-gray-400">
                {EXCUSE_TYPE_LABELS[excuse.type] || excuse.type}
              </span>
            </p>

            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                EXCUSE_STATUS_COLORS[excuse.status],
              )}
            >
              {EXCUSE_STATUS_LABELS[excuse.status] || excuse.status}
            </span>
          </div>

          <p className="text-sm text-gray-700">
            {excuse.absenceReason?.title || "—"}
          </p>

          {excuse.reason && (
            <p className="text-sm text-gray-500">{excuse.reason}</p>
          )}

          {excuse.status === "rejected" && excuse.rejectionReason && (
            <p className="text-xs text-red-600">
              Rad etish sababi: {excuse.rejectionReason}
            </p>
          )}

          {excuse.status === "pending" && (
            <ConfirmPopover
              danger
              title="So'rovni bekor qilamizmi?"
              confirmLabel="Ha, bekor qilinsin"
              onConfirm={() => handleCancel(excuse.id)}
            >
              <Button size="sm" variant="outline" disabled={cancelExcuse.isPending}>
                Bekor qilish
              </Button>
            </ConfirmPopover>
          )}
        </div>
      ))}
    </Card>
  );
};

export default MyExcusesList;
