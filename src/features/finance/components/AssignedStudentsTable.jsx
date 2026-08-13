// Toast
import { toast } from "sonner";

// Icons
import { Repeat, Trash2 } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthRange,
} from "@/shared/helpers/month.helpers";

// Data & mutations
import {
  ASSIGNED_STUDENT_TABLE_COLUMNS,
  RESOLVE_REASON_LABELS,
  getPeriodStatus,
} from "../data/finance.data";
import { useDeleteAssignment } from "../queries/finance.mutations";

/**
 * Tarifga biriktirilgan o'quvchilar.
 *
 * Summa har bir qator uchun serverda joriy oyga hal qilingan — biriktirish
 * narxni saqlamaydi, shuning uchun tarif narxi o'zgarsa bu jadval o'zi
 * yangilanadi.
 */
const AssignedStudentsTable = ({ assignments = [] }) => {
  const now = currentMonthKey();
  const { openModal } = useModal();
  const { mutate: deleteAssignment } = useDeleteAssignment();

  const handleDelete = (assignment) => {
    if (!confirm("Biriktirishni o'chirishni tasdiqlaysizmi?")) return;

    deleteAssignment(assignment.id, {
      onSuccess: () => toast.success("Biriktirish o'chirildi"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  if (assignments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Bu tarifga hali o'quvchi biriktirilmagan
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {ASSIGNED_STUDENT_TABLE_COLUMNS.map((column, index) => (
              <th
                key={column || index}
                className="px-4 py-3 text-left text-white font-medium whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {assignments.map((assignment) => {
            const badge = getPeriodStatus(
              assignment.startMonth,
              assignment.endMonth,
              now,
            );
            const reason = RESOLVE_REASON_LABELS[assignment.resolvedReason];

            return (
              <tr key={assignment.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  {/* O'quvchi o'chirilgan bo'lishi mumkin — soft ref */}
                  {assignment.student ? (
                    <>
                      <p className="font-medium text-gray-900">
                        {assignment.student.firstName}{" "}
                        {assignment.student.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assignment.student.username}
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-400">O'chirilgan</span>
                  )}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                  {formatMonthRange(assignment.startMonth, assignment.endMonth)}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {assignment.resolvedAmount ? (
                    <span className="font-medium">
                      {formatMoney(assignment.resolvedAmount)}
                    </span>
                  ) : reason ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${reason.className}`}
                    >
                      {reason.label}
                    </span>
                  ) : (
                    // Bu qator joriy oyni qamramaydi
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Can do="tariffs.assign">
                      <button
                        title="Boshqa tarifga o'tkazish"
                        onClick={() =>
                          openModal("changeStudentTariff", { assignment })
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <Repeat className="size-3.5" />
                      </button>
                    </Can>

                    {/* Faqat hali boshlanmagan biriktirishni o'chirsa bo'ladi */}
                    {assignment.startMonth > now && (
                      <Can do="tariffs.delete">
                        <button
                          title="O'chirish"
                          onClick={() => handleDelete(assignment)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </Can>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedStudentsTable;
