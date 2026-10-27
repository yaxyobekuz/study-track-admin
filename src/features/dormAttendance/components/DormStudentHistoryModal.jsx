// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatTimeUz } from "@/shared/utils/date.utils";

// Queries & data
import { dormAttendanceQueries } from "../queries/dormAttendance.queries";
import { DORM_STATUS_COLORS, DORM_STATUS_LABELS } from "../data/dormAttendance.data";

/**
 * BITTA O'QUVCHINING YOTOQXONA TARIXI — "nega bu bola tez-tez yo'q".
 *
 * Kun-ba-kun: holat, izoh, kim va soat nechada belgilagan.
 *
 * ⚠️ DAVOMAT OLINMAGAN KUN ro'yxatda TURADI va shunday deb aytiladi:
 * bo'shliq "bola yo'q edi" deb o'qilardi, holbuki o'sha kuni umuman hech
 * kim belgilanmagan (server `tracked`).
 *
 * `openModal("dormStudentHistory", { studentId, name, date, days })`
 */
const DormStudentHistoryModal = () => (
  <ResponsiveModal
    name="dormStudentHistory"
    title="Yotoqxona tarixi"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ studentId, name, date, days }) => {
  const { data, isLoading, isError } = useQuery(
    dormAttendanceQueries.studentHistory(studentId, { ...(date && { date }), ...(days && { days }) }),
  );

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-gray-500">Yuklanmoqda...</p>;
  }
  if (isError) {
    return <p className="py-8 text-center text-sm text-gray-500">Tarixni yuklab bo&apos;lmadi</p>;
  }

  const { counts, trackedDays, rows } = data;

  const columns = [
    { key: "date", label: "Sana" },
    { key: "status", label: "Holat", className: "w-32" },
    { key: "note", label: "Izoh" },
    { key: "markedBy", label: "Kim belgilagan" },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-gray-900">{name || "O'quvchi"}</p>
        <p className="text-sm text-gray-500">
          Davomat olingan {trackedDays} kundan{" "}
          <span className="font-medium text-green-700">{counts.present} tasida</span>{" "}
          yotoqxonada qolgan
          {counts.absent > 0 && ` · ${counts.absent} kun kelmagan`}
          {counts.excused > 0 && ` · ${counts.excused} kun sababli`}
          {counts.missing > 0 && ` · ${counts.missing} kun belgilanmagan`}
        </p>
      </div>

      <div className="max-h-[55vh] overflow-y-auto">
        <Table columns={columns}>
          {rows.map((row) => (
            <Tr key={row.date} className={cn(!row.tracked && "opacity-60")}>
              <Td className="text-gray-700">{row.dateLabel}</Td>

              <Td>
                {row.status ? (
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      DORM_STATUS_COLORS[row.status],
                    )}
                  >
                    {DORM_STATUS_LABELS[row.status]}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    {row.tracked ? "Belgilanmagan" : "Davomat olinmagan"}
                  </span>
                )}
              </Td>

              <Td nowrap={false} className="text-gray-600">
                {row.note || <span className="text-gray-300">—</span>}
              </Td>

              <Td className="text-xs text-gray-500">
                {row.markedBy ? (
                  <>
                    {row.markedBy}
                    {row.markedAt && (
                      <span className="text-gray-400"> · {formatTimeUz(row.markedAt)}</span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </div>
    </div>
  );
};

export default DormStudentHistoryModal;
