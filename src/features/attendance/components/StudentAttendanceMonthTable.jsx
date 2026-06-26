// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";

// Data
import { STATUS_DOT_COLORS, STATUS_LABELS } from "../data/studentAttendance.data";

/**
 * O'quvchilarning oylik davomati - kun matritsasi ko'rinishida
 * (Xodimlar oylik jadvali AttendanceTable bilan bir xil uslubda).
 * Har bir qator - o'quvchi, har bir ustun - oyning kuni.
 */
const StudentAttendanceMonthTable = ({ records, month, year }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // O'quvchi bo'yicha guruhlash: { [studentId]: { student, days: { [day]: rec } } }
  const byStudent = {};
  records.forEach((rec) => {
    const sid = rec.student?._id || rec.student;
    if (!byStudent[sid]) {
      byStudent[sid] = { student: rec.student, days: {} };
    }

    const day = new Date(rec.date).getUTCDate();
    byStudent[sid].days[day] = rec;
  });

  const studentRows = Object.values(byStudent).sort((a, b) => {
    const nameA = `${a.student?.lastName || ""} ${a.student?.firstName || ""}`;
    const nameB = `${b.student?.lastName || ""} ${b.student?.firstName || ""}`;
    return nameA.localeCompare(nameB);
  });

  if (studentRows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Bu oy uchun davomat ma'lumotlari yo'q
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm">
        {/* Thead */}
        <thead>
          <tr>
            <th className="w-48">O'quvchi</th>

            {days.map((d) => (
              <th key={d} className="p-0 w-8">
                {d}
              </th>
            ))}
          </tr>
        </thead>

        {/* Tbody */}
        <tbody>
          {studentRows.map(({ student, days: studentDays }) => (
            <tr key={student?._id}>
              {/* Full Name */}
              <td className="p-0">
                <div className="flex items-center h-12 px-4">
                  <p className="font-medium text-gray-900">
                    {student?.lastName} {student?.firstName}
                  </p>
                </div>
              </td>

              {/* Days */}
              {days.map((d) => {
                const rec = studentDays[d];

                if (!rec) {
                  return (
                    <td key={d} className="p-0">
                      <div className="flex items-center justify-center w-8 h-12">
                        <span className="inline-block size-4 rounded-full bg-gray-200" />
                      </div>
                    </td>
                  );
                }

                return (
                  <td key={d} className="p-0">
                    <div className="flex items-center justify-center w-8 h-12">
                      <Tooltip content={<TooltipContent record={rec} />}>
                        <button
                          className={cn(
                            STATUS_DOT_COLORS[rec.status],
                            "size-4 rounded-full cursor-pointer outline-none transition-transform duration-200 focus:scale-150 hover:scale-150",
                          )}
                        />
                      </Tooltip>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TooltipContent = ({ record }) => (
  <div className="space-y-1">
    <b className="font-bold">{STATUS_LABELS[record.status]}</b>

    {record.markedAt && (
      <p>
        Belgilandi:{" "}
        {new Date(record.markedAt).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    )}

    {record.status === "excused" && record.excuseReason && (
      <p className="text-blue-200">Sabab: {record.excuseReason}</p>
    )}
  </div>
);

export default StudentAttendanceMonthTable;
