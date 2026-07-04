// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// Utils
import { cn } from "@/shared/utils/cn";

// API
import { attendanceReportAPI } from "../api/attendanceReport.api";

// Components
import Card from "@/shared/components/ui/Card";
import ReportPercentCards from "../components/ReportPercentCards";
import ReportBarList from "../components/ReportBarList";
import DailyAttendanceChart from "../components/DailyAttendanceChart";

// Data
import { MONTH_OPTIONS } from "../data/attendance.data";
import {
  WEEKDAY_LABELS,
  OVERALL_PERCENT_CARDS,
  getPercentColor,
  RANK_COLORS,
} from "../data/attendanceReports.data";

const StudentReportsPage = () => {
  const { month, year } = useOutletContext();

  const { data, isLoading } = useQuery({
    queryKey: ["attendanceReports", "students", { month, year }],
    queryFn: () =>
      attendanceReportAPI.getStudentReport(month, year).then((r) => r.data),
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }
  if (!data) {
    return (
      <div className="py-8 text-center text-gray-500">
        Ma&apos;lumot topilmadi
      </div>
    );
  }

  const monthLabel =
    MONTH_OPTIONS.find((m) => m.value === month)?.label || "Tanlangan oy";

  // Umumiy foiz kartalari (Bugun / Shu hafta - joriy; Oy - tanlangan)
  const overallItems = OVERALL_PERCENT_CARDS.map(({ key, label }) => {
    const section = data.overall?.[key] || {};
    return {
      key,
      label: key === "monthly" ? `${monthLabel} oyi` : label,
      percent: section.percent ?? null,
      came: (section.present || 0) + (section.late || 0),
      total: section.total || 0,
    };
  });

  // Grafik uchun oyning BARCHA kunlarini to'ldiramiz -
  // yozuvi yo'q kunlar ham o'z o'rnida (bo'sh) ko'rinadi
  const daysInMonth = new Date(year, month, 0).getDate();
  const byDayMap = Object.fromEntries(
    (data.byDay || []).map((d) => [parseInt(d.date.slice(8, 10), 10), d]),
  );
  const byDay = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const d = byDayMap[day];
    return d
      ? { ...d, day }
      : {
          day,
          date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          // null - chiziqli grafikда bo'sh kun uzilish sifatida ko'rinadi
          present: null,
          late: null,
          absent: null,
          excused: null,
          total: 0,
          percent: null,
        };
  });

  const byClass = data.byClass || [];
  const riskGroup = data.riskGroup || [];
  const topStudents = data.topStudents || [];
  const reasons = data.reasons || {};
  // ReportBarList `label` kutadi - kategoriya sarlavhasini map qilamiz
  const categoryItems = (reasons.categories || []).map((c) => ({
    label: c.title,
    count: c.count,
    percent: c.percent,
  }));
  const weekdayItems = (data.weekdayTrend || []).map((w) => ({
    label: WEEKDAY_LABELS[w.dayOfWeek] || "-",
    count: w.missed,
    percent: w.percent,
  }));
  const thresholds = data.thresholds || {};

  return (
    <div className="space-y-4">
      {/* 1. Umumiy holat */}
      <ReportPercentCards items={overallItems} />

      {/* 2. Kun bo'yicha hisob */}
      <Card title="Kun bo'yicha davomat" className="space-y-3">
        <DailyAttendanceChart byDay={byDay} />
      </Card>

      {/* 3. Sinf kesimida */}
      <Card title="Sinf kesimida davomat" className="space-y-3">
        {byClass.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Ma&apos;lumot topilmadi</p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Sinf</th>
                  <th className="text-left px-4 py-3">Keldi</th>
                  <th className="text-left px-4 py-3">Kech keldi</th>
                  <th className="text-left px-4 py-3">Kelmadi</th>
                  <th className="text-left px-4 py-3">Sababli</th>
                  <th className="text-left px-4 py-3">Jami</th>
                  <th className="text-left px-4 py-3">Davomat</th>
                </tr>
              </thead>
              <tbody>
                {byClass.map((cls, idx) => (
                  <tr key={cls.classId} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cls.className}
                      {byClass.length > 1 && idx === 0 && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          Eng yuqori
                        </span>
                      )}
                      {byClass.length > 1 && idx === byClass.length - 1 && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                          Eng past
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{cls.present}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.late}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.absent}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.excused}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.total}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          getPercentColor(cls.percent),
                        )}
                      >
                        {cls.percent == null ? "-" : `${cls.percent}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Xavfli guruh */}
      <Card title="Xavfli guruh" className="space-y-3">
        <p className="text-xs text-gray-500">
          {thresholds.consecutiveDays || 3}+ kun ketma-ket yoki oyda{" "}
          {thresholds.monthlyMissedDays || 5}+ kun dars qoldirgan o&apos;quvchilar
        </p>

        {riskGroup.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">
            Bu oyda xavfli guruh bo&apos;sh
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">O&apos;quvchi</th>
                  <th className="text-left px-4 py-3">Sinf</th>
                  <th className="text-left px-4 py-3">Jami qoldirgan</th>
                  <th className="text-left px-4 py-3">Sababsiz</th>
                  <th className="text-left px-4 py-3">Sababli</th>
                  <th className="text-left px-4 py-3">Eng uzun ketma-ketlik</th>
                </tr>
              </thead>
              <tbody>
                {riskGroup.map((s) => (
                  <tr key={s.studentId} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.className}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                        {s.missedTotal} kun
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.absent}</td>
                    <td className="px-4 py-3 text-gray-700">{s.excused}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {s.maxStreak} kun
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Sabablar tahlili */}
      <Card title="Sabablar tahlili" className="space-y-3">
        {!reasons.missedTotal ? (
          <p className="text-sm text-gray-400 py-4">
            Bu oyda dars qoldirish qayd etilmagan
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl px-4 py-3 text-center bg-gray-100 text-gray-700">
                <p className="text-2xl font-bold">{reasons.missedTotal}</p>
                <p className="text-xs mt-0.5">Jami qoldirilgan kun</p>
              </div>
              <div className="rounded-xl px-4 py-3 text-center bg-red-100 text-red-700">
                <p className="text-2xl font-bold">
                  {reasons.absentPercent == null
                    ? "-"
                    : `${reasons.absentPercent}%`}
                </p>
                <p className="text-xs mt-0.5">
                  Sababsiz ({reasons.absentCount} ta)
                </p>
              </div>
              <div className="rounded-xl px-4 py-3 text-center bg-blue-100 text-blue-700">
                <p className="text-2xl font-bold">
                  {reasons.excusedPercent == null
                    ? "-"
                    : `${reasons.excusedPercent}%`}
                </p>
                <p className="text-xs mt-0.5">
                  Sababli ({reasons.excusedCount} ta)
                </p>
              </div>
            </div>

            {categoryItems.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2">
                  Sabab kategoriyalari kesimida (jami qoldirishga nisbatan)
                </p>
                <ReportBarList items={categoryItems} />
              </div>
            )}
          </>
        )}
      </Card>

      {/* 6. Vaqt trendi */}
      <Card title="Hafta kunlari bo'yicha qoldirish" className="space-y-3">
        <ReportBarList items={weekdayItems} barColor="bg-red-400" />
      </Card>

      {/* 7. Eng yaxshi o'quvchilar */}
      <Card title="Davomat bo'yicha eng yaxshi o'quvchilar" className="space-y-3">
        {topStudents.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Ma&apos;lumot topilmadi</p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">O&apos;quvchi</th>
                  <th className="text-left px-4 py-3">Sinf</th>
                  <th className="text-left px-4 py-3">Davomat</th>
                  <th className="text-left px-4 py-3">Keldi</th>
                  <th className="text-left px-4 py-3">Kech keldi</th>
                  <th className="text-left px-4 py-3">Belgilangan kunlar</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s, idx) => (
                  <tr key={s.studentId} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
                          RANK_COLORS[idx + 1] || "bg-gray-50 text-gray-500",
                        )}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.className}
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
                    <td className="px-4 py-3 text-gray-700">{s.present}</td>
                    <td className="px-4 py-3 text-gray-700">{s.late}</td>
                    <td className="px-4 py-3 text-gray-700">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentReportsPage;
