// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  DAY_STATUS_META,
  getPercentColor,
} from "../../data/attendanceReports.data";

const TH = "text-left px-4 py-3 whitespace-nowrap";
const TD = "px-4 py-3 text-gray-700";

// Sinfdan chiqqan (joriy a'zo emas), lekin shu davrda shu sinf nomidan belgilangan
const NotMemberTag = () => (
  <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
    Sinfda emas
  </span>
);

const EmptyRow = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-gray-400">
      Bu davrda kutilgan o&apos;quvchi yo&apos;q
    </td>
  </tr>
);

/** Kunlik ro'yxat: kim kelmagan va nega (kelmaganlar birinchi). */
const DayTable = ({ students }) => (
  <table className="min-w-full text-sm">
    <thead>
      <tr>
        <th className={TH}>#</th>
        <th className={TH}>O&apos;quvchi</th>
        <th className={TH}>Holat</th>
        <th className={TH}>Sabab</th>
      </tr>
    </thead>
    <tbody>
      {students.length === 0 && <EmptyRow colSpan={4} />}
      {students.map((s, idx) => {
        const meta = DAY_STATUS_META[s.status || "unmarked"];
        const reason = [s.reasonTitle, s.excuseReason].filter(Boolean).join(" — ");

        return (
          <tr key={s.studentId} className="border-t border-gray-100">
            <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
            <td className="px-4 py-3 font-medium text-gray-900">
              {s.name}
              {!s.isMember && <NotMemberTag />}
            </td>
            <td className="px-4 py-3">
              <span
                className={cn(
                  "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
                  meta.className,
                )}
              >
                {meta.label}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-500">{reason || "—"}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

/**
 * Oylik / yillik ro'yxat — SINF FOIZIGA TA'SIR bo'yicha tartiblangan
 * (server). Qoldirishlarning yarmini beradigan yetakchilar yengil qizil
 * fonda: "Tahlil"dagi jumla aynan shu qatorlarga ishora qiladi.
 */
const RangeTable = ({ students, leaders }) => (
  <table className="min-w-full text-sm">
    <thead>
      <tr>
        <th className={TH}>#</th>
        <th className={TH}>O&apos;quvchi</th>
        <th className={TH}>Qoldirgan</th>
        <th className={TH}>Davomat</th>
        <th className={TH}>Kutilgan</th>
        <th className={TH}>Kelgan</th>
        <th className={TH}>Kech keldi</th>
        <th className={TH}>Kelmadi</th>
        <th className={TH}>Sababli</th>
        <th className={TH}>Belgilanmagan</th>
        <th className={TH}>Eng uzun ketma-ketlik</th>
      </tr>
    </thead>
    <tbody>
      {students.length === 0 && <EmptyRow colSpan={11} />}
      {students.map((s, idx) => (
        <tr
          key={s.studentId}
          className={cn("border-t border-gray-100", idx < leaders && "bg-red-50/60")}
        >
          <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
            {s.name}
            {!s.isMember && <NotMemberTag />}
          </td>
          <td className={cn(TD, "whitespace-nowrap")}>
            <b className="text-gray-900">{s.missed}</b> kun
            {s.missedShare != null && s.missed > 0 && (
              <span className="text-xs text-gray-400"> ({s.missedShare}%)</span>
            )}
          </td>
          <td className="px-4 py-3">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                getPercentColor(s.percent),
              )}
            >
              {s.percent == null ? "-" : `${s.percent}%`}
            </span>
          </td>
          <td className={TD}>{s.expected}</td>
          <td className={TD}>{s.came}</td>
          <td className={TD}>{s.late}</td>
          <td className={TD}>{s.absent}</td>
          <td className={TD}>{s.excused}</td>
          <td className={TD}>{s.unmarked}</td>
          <td className={cn(TD, "whitespace-nowrap")}>
            {s.maxStreak ? `${s.maxStreak} kun` : "—"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * Sinf hisobotidagi o'quvchilar ro'yxati.
 *
 * @param {object} props
 * @param {"day"|"month"|"year"} props.period
 * @param {Array} props.students - server `students` (tartiblangan)
 * @param {number} [props.leaders] - ajratib ko'rsatiladigan boshdagi qatorlar soni
 */
const ClassReportStudentsTable = ({ period, students = [], leaders = 0 }) => (
  <div className="overflow-x-auto rounded-lg">
    {period === "day" ? (
      <DayTable students={students} />
    ) : (
      <RangeTable students={students} leaders={leaders} />
    )}
  </div>
);

export default ClassReportStudentsTable;
