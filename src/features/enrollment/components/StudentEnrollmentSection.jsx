// Toast
import { toast } from "sonner";

// Icons
import { CalendarRange, DoorClosed, Pencil, Plus, Trash2 } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import EnrollmentPeriodModal from "./EnrollmentPeriodModal";
import CloseEnrollmentModal from "./CloseEnrollmentModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data & queries
import {
  END_REASON_LABELS,
  ENROLLMENT_REASON_LABELS,
  ENROLLMENT_TABLE_COLUMNS,
  formatDuration,
  getEnrollmentStatus,
} from "../data/enrollment.data";
import { enrollmentQueries } from "../queries/enrollment.queries";
import { useDeleteEnrollment } from "../queries/enrollment.mutations";

const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * O'quvchi detal sahifasidagi "O'qish davrlari" bo'limi.
 *
 * Faqat `studentId` propini oladi va o'zi fetch qiladi — davomat va moliya
 * bo'limlari bilan bir xil naqsh, shuning uchun `users` feature'i o'qish
 * davrlaridan bexabar qoladi.
 *
 * Bu ekran ikki savolga javob beradi: o'quvchi hozir o'qiyaptimi va
 * shu oyga qancha to'lov yoziladi.
 */
const StudentEnrollmentSection = ({ studentId }) => {
  const { openModal } = useModal();
  const today = todayIso();

  const { data, isLoading } = useQuery(enrollmentQueries.forStudent(studentId));
  const { mutate: deleteEnrollment } = useDeleteEnrollment();

  const items = data?.items ?? [];
  const current = data?.currentMonth;

  const handleDelete = (period) =>
    deleteEnrollment(period.id, {
      onSuccess: () => toast.success("O'qish davri o'chirildi"),
      // Hisob-fakturasi bor davrni server bloklaydi — sabab ko'rsatiladi
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">O'qish davrlari</h2>

        <Can do="enrollment.create">
          <Button onClick={() => openModal("enrollmentPeriod", { studentId })}>
            <Plus />
            Davr qo'shish
          </Button>
        </Can>
      </div>

      {/* Holat kartasi — bir qarashda "o'qiyaptimi?" */}
      {data && (
        <Card
          className={cn(
            "border",
            data.isStudying ? "border-green-100 bg-green-50/40" : "border-gray-100",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    data.isStudying ? "bg-green-500" : "bg-gray-400",
                  )}
                />
                <p className="font-medium text-gray-900">
                  {data.isStudying ? "Hozir o'qiyapti" : "O'qimayapti"}
                </p>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {!data.hasPeriods
                  ? "Davr kiritilmagan — to'liq oy hisoblanadi"
                  : data.isStudying
                    ? `${formatDateUZ(data.since)} dan · ${formatDuration(data.since, null)}`
                    : `${formatDateUZ(data.since)} — ${formatDateUZ(data.until)} · ${formatDuration(data.since, data.until)}`}
              </p>
            </div>

            {/* Joriy oy qanday hisoblanadi — kassirning asosiy savoli */}
            {current && (
              <div className="text-right">
                <p className="text-xs text-gray-500">{current.monthLabel}</p>
                <p className="font-medium text-gray-900">
                  {current.enrolled
                    ? current.isProrated
                      ? `${current.billableDays}/${current.monthDays} kun`
                      : "To'liq oy"
                    : "Hisob yozilmaydi"}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {ENROLLMENT_REASON_LABELS[current.reason] ?? ""}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Davrlar */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={CalendarRange}
            title="O'qish davri kiritilmagan"
            description="Davr kiritilmaguncha o'quvchi to'liq oy to'laydi. Oy o'rtasida kelgan o'quvchi uchun kelgan sanani kiriting — o'sha oy ulushga hisoblanadi."
            action={
              <Can do="enrollment.create">
                <Button onClick={() => openModal("enrollmentPeriod", { studentId })}>
                  <Plus />
                  Davr qo'shish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <Table columns={ENROLLMENT_TABLE_COLUMNS}>
          {items.map((period) => {
            const status = getEnrollmentStatus(period, today);

            return (
              <Tr key={period.id}>
                <Td className="font-medium text-gray-900">
                  {formatDateUZ(period.startDate)}
                </Td>

                <Td className="text-gray-500">
                  {period.endDate ? formatDateUZ(period.endDate) : "—"}
                </Td>

                <Td nowrap={false} className="text-gray-500">
                  {period.endReason ? END_REASON_LABELS[period.endReason] : "—"}
                  {period.reason && (
                    <span className="block text-xs text-gray-400">{period.reason}</span>
                  )}
                </Td>

                <Td>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </Td>

                <Td>
                  <div className="flex items-center justify-end gap-1">
                    {period.isOpen && (
                      <Can do="enrollment.update">
                        <button
                          title="Davrni yopish"
                          onClick={() => openModal("closeEnrollment", { period })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <DoorClosed className="size-3.5" />
                        </button>
                      </Can>
                    )}

                    <Can do="enrollment.update">
                      <button
                        title="Tahrirlash"
                        onClick={() => openModal("enrollmentPeriod", { studentId, period })}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </Can>

                    <Can do="enrollment.delete">
                      <button
                        title="O'chirish"
                        onClick={() => handleDelete(period)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </Can>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      <p className="text-xs text-gray-500">
        Oy o'rtasida <b>kelgan</b> o'quvchi o'sha oyni ulushga to'laydi
        (masalan 20-kuni kelsa 12/31). Oy o'rtasida <b>ketgan</b> o'quvchi esa
        o'sha oyni to'liq to'laydi.
      </p>

      {/* Modallar shu bo'lim ichida */}
      <EnrollmentPeriodModal />
      <CloseEnrollmentModal />
    </div>
  );
};

export default StudentEnrollmentSection;
