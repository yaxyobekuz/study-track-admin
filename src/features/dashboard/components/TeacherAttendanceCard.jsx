// Icons
import { Presentation } from "lucide-react";

// Components
import AttendancePulseCard from "./AttendancePulseCard";

// Queries & data
import { attendanceReportsQueries } from "@/features/attendance/queries/attendance.queries";
import {
  ATTENDANCE_REPORT_PATHS,
  countText,
} from "@/features/attendance/data/attendanceStats.data";

/**
 * O'QITUVCHILAR DAVOMATI — bosh sahifadagi karta.
 *
 * ⚠️ Bu karta "Qamrab olingan o'quvchilar" ning O'RNIDA turadi (biznes
 * qarori, 2026-10-28); o'sha raqam "Bot foydalanuvchilar" kartasiga
 * ko'chdi.
 *
 * ⚠️ UCHINCHI QATOR — JONLI: "dars BOSHLANGAN, o'qituvchi esa maktabda
 * yo'q" (`lessonAbsence.service.js`). U davrga BOG'LIQ EMAS va aynan shu
 * sabab kartada turadi: oylik foiz "hozir nima bo'lyapti" degan savolga
 * javob bermaydi, bu qator esa darhol harakat talab qiladi.
 */
const TeacherAttendanceCard = () => (
  <AttendancePulseCard
    title="O'qituvchilar davomati"
    icon={Presentation}
    tone="indigo"
    reportPath={ATTENDANCE_REPORT_PATHS.teachers}
    reportTitle="O'qituvchilar davomati hisobotini ochish"
    branchTo="/attendance/reports/staff"
    queryOf={attendanceReportsQueries.teacherPulse}
    hint={(current, data) =>
      data
        ? `${current.hint} — ${data.period.previous.title.toLowerCase()} bilan solishtirilgan`
        : `${current.hint} davomat`
    }
    rows={(data) => {
      const t = data.totals;
      const live = data.live;
      const absentNow = live?.summary?.absentTeachers ?? 0;
      const lateNow = live?.summary?.lateTeachers ?? 0;

      return [
        {
          key: "came",
          label: "Keldi",
          value: `${countText(t.came)} / ${countText(t.expected)}`,
          tone: "text-emerald-600",
          title: `Kutilgan ish kunlaridan keldi (shundan ${t.late ?? 0} marta kech keldi)`,
        },
        {
          key: "late",
          label: "Kech keldi",
          value: countText(t.late),
          tone: "text-amber-600",
          title: t.lateMinutes
            ? `Jami ${countText(t.lateMinutes)} daqiqa kechikish`
            : "Kechikish qayd etilmagan",
        },
        {
          key: "live",
          label: "Hozir darsda yo'q",
          // ⚠️ Yakshanba / bayram / ta'tilda "0" EMAS, "—": nol raqam
          // "hamma darsda" degan yolg'on xabar bo'lardi.
          value: !live || live.closed ? "—" : countText(absentNow),
          tone: !live || live.closed ? "text-gray-400" : absentNow ? "text-red-500" : "text-emerald-600",
          title: !live
            ? "Tanlangan davr bugungi kunni qamramaydi"
            : live.closed
              ? live.message
              : `${live.summary.ongoingLessons} ta dars davom etmoqda; ${absentNow} o'qituvchi maktabda yo'q, ${lateNow} tasi kech kelgan`,
        },
      ];
    }}
  />
);

export default TeacherAttendanceCard;
