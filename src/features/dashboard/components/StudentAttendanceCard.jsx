// Icons
import { UserCheck } from "lucide-react";

// Components
import AttendancePulseCard from "./AttendancePulseCard";

// Queries & data
import { attendanceReportsQueries } from "@/features/attendance/queries/attendance.queries";
import {
  ATTENDANCE_REPORT_PATHS,
  countText,
} from "@/features/attendance/data/attendanceStats.data";

/**
 * O'QUVCHILAR DAVOMATI — bosh sahifadagi karta.
 *
 * ⚠️ Bu karta "Bugun botda faol" ning O'RNIDA turadi (biznes qarori,
 * 2026-10-28). Bot raqamlari YO'QOLMADI — ular yuqoridagi "Bot
 * foydalanuvchilar" kartasiga BIRLASHTIRILDI, ya'ni bitta mavzu bitta
 * kartada qoldi va bu joy har kuni qaraladigan raqamga bo'shadi.
 *
 * ⚠️ IKKALA REJIMDA HAM: filial ichida u o'sha filialning davomati
 * (ma'muriyatning kundalik ishi), umumiy ko'rinishda esa server filiallar
 * bo'ylab o'zi yig'adi va foizni yig'indidan qayta hisoblaydi.
 */
const StudentAttendanceCard = () => (
  <AttendancePulseCard
    title="O'quvchilar davomati"
    icon={UserCheck}
    tone="emerald"
    reportPath={ATTENDANCE_REPORT_PATHS.students}
    reportTitle="O'quvchilar davomati hisobotini ochish"
    branchTo="/attendance/reports/students"
    queryOf={attendanceReportsQueries.studentPulse}
    hint={(current, data) =>
      data
        ? `${current.hint} — ${data.period.previous.title.toLowerCase()} bilan solishtirilgan`
        : `${current.hint} davomat`
    }
    rows={(data) => {
      const t = data.totals;
      const notCame = Math.max(0, (t.expected ?? 0) - (t.came ?? 0));

      return [
        {
          key: "came",
          label: "Keldi",
          value: `${countText(t.came)} / ${countText(t.expected)}`,
          tone: "text-emerald-600",
          title: `Kutilgan o'quvchi-kunlardan keldi (shundan ${t.late ?? 0} tasi kech keldi)`,
        },
        {
          key: "notCame",
          label: "Kelmadi",
          value: countText(notCame),
          tone: "text-red-500",
          // ⚠️ Belgilanmagan ham KELMAGAN hisoblanadi (`education.md` §6) —
          // qatorning ustiga kelganda buni ochiq aytamiz.
          title: `Sababsiz ${t.absent ?? 0}, sababli ${t.excused ?? 0}, belgilanmagan ${t.unmarked ?? 0}`,
        },
        {
          key: "excused",
          label: "Sababli",
          value: countText(t.excused),
          tone: "text-amber-600",
          title: "Sababli kelmagan o'quvchi-kunlar",
        },
      ];
    }}
  />
);

export default StudentAttendanceCard;
