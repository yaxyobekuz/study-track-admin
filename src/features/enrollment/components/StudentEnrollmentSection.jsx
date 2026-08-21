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
  buildEnrollmentStats,
  formatDayCount,
  getEnrollmentStatus,
  getStudentState,
} from "../data/enrollment.data";
import { enrollmentQueries } from "../queries/enrollment.queries";
import { useDeleteEnrollment } from "../queries/enrollment.mutations";

const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/** Kartalar qatoridagi bitta ko'rsatkich. */
const StatCard = ({ label, value, sub }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 truncate text-lg font-semibold text-gray-900">{value}</p>
    {sub && <p className="mt-0.5 truncate text-[11px] text-gray-400">{sub}</p>}
  </div>
);

/**
 * Uzluksizlik halqasi — birinchi kelgan kundan beri vaqtning qanchasi
 * maktabda o'tgani. Recharts kerak emas: bitta doira uchun SVG yengilroq.
 */
const AttendanceRing = ({ percent, gapDays }) => {
  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <svg viewBox="0 0 64 64" className="size-16 shrink-0 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-red-100"
        />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
          className="stroke-green-500"
        />
      </svg>

      <div className="min-w-0">
        <p className="text-lg font-semibold text-gray-900">{percent}%</p>
        <p className="text-xs font-medium text-gray-500">Uzluksiz o'qigan</p>
        <p className="mt-0.5 truncate text-[11px] text-gray-400">
          {gapDays > 0 ? `${gapDays} kun tanaffus` : "Tanaffussiz"}
        </p>
      </div>
    </div>
  );
};

/**
 * O'quvchi detal sahifasidagi "O'qish davrlari" bo'limi.
 *
 * Faqat `studentId` propini oladi va o'zi fetch qiladi — davomat va moliya
 * bo'limlari bilan bir xil naqsh, shuning uchun `users` feature'i o'qish
 * davrlaridan bexabar qoladi.
 *
 * Tuzilishi: holat qatori → ko'rsatkichlar → davrlar jadvali.
 */
const StudentEnrollmentSection = ({ studentId }) => {
  const { openModal } = useModal();
  const today = todayIso();

  const { data, isLoading } = useQuery(enrollmentQueries.forStudent(studentId));
  const { mutate: deleteEnrollment } = useDeleteEnrollment();

  const items = data?.items ?? [];
  const current = data?.currentMonth;
  const state = getStudentState(data);
  const stats = buildEnrollmentStats(items, today);

  const handleDelete = (period) =>
    deleteEnrollment(period.id, {
      onSuccess: () => toast.success("O'qish davri o'chirildi"),
      // Hisob-fakturasi bor davrni server bloklaydi — sabab ko'rsatiladi
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <div className="space-y-4">
      {/* 1-qator: holat + amal */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">O'qish davrlari</h2>

          {data && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                state.className,
              )}
            >
              <span className={cn("size-1.5 rounded-full", state.dotClassName)} />
              {state.label}
            </span>
          )}
        </div>

        <Can do="enrollment.create">
          <Button onClick={() => openModal("enrollmentPeriod", { studentId })}>
            <Plus />
            Davr qo'shish
          </Button>
        </Can>
      </div>

      {/* 2-qator: ko'rsatkichlar. Davr yo'q bo'lsa chizilmaydi — hammasi
          nolga teng bo'lardi va bo'sh holat matni o'zi tushuntiradi. */}
      {data?.hasPeriods && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Maktabda"
            value={formatDayCount(stats.attendedDays)}
            sub={
              stats.firstStart
                ? `${formatDateUZ(stats.firstStart)} dan`
                : "Hali boshlanmagan"
            }
          />

          <StatCard
            label="O'qish davrlari"
            value={`${stats.periodCount} ta`}
            sub={
              stats.openCount > 0
                ? `${stats.openCount} ta ochiq`
                : "Hammasi yopilgan"
            }
          />

          {current && (
            <StatCard
              label={`Joriy oy · ${current.monthLabel}`}
              value={
                current.enrolled
                  ? current.isProrated
                    ? `${current.billableDays}/${current.monthDays} kun`
                    : "To'liq oy"
                  : "Hisob yozilmaydi"
              }
              sub={ENROLLMENT_REASON_LABELS[current.reason] ?? ""}
            />
          )}

          <AttendanceRing
            percent={stats.attendedPercent}
            gapDays={stats.gapDays}
          />
        </div>
      )}

      {/* 3-qator: davrlar jadvali */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={CalendarRange}
            title="O'qish davri kiritilmagan"
            description="Davr kiritilmaguncha bu o'quvchiga hisob-faktura yozilmaydi. Maktabga kelgan sanasini kiriting — oy o'rtasida kelgan bo'lsa o'sha oy ulushga hisoblanadi."
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
