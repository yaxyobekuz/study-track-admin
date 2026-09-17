// React
import { useMemo, useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useNavigate, useOutletContext } from "react-router-dom";

// Utils
import { cn } from "@/shared/utils/cn";
import { todayInputValue } from "@/shared/utils/date.utils";

// Queries
import { attendanceReportsQueries } from "../queries/attendance.queries";

// Components
import Card from "@/shared/components/ui/Card";
import ReportPercentCards from "../components/ReportPercentCards";
import ReportBarList from "../components/ReportBarList";
import DailyAttendanceChart from "../components/DailyAttendanceChart";

// Data
import {
  WEEKDAY_LABELS,
  OVERALL_PERCENT_CARDS,
  buildCompareMonthOptions,
  getPercentColor,
  RANK_COLORS,
  fillMonthDays,
  buildClassReportPath,
} from "../data/attendanceReports.data";

/** Tanlagichlar — kartalar ichida turadi, shuning uchun ixcham. */
const CONTROL_CLASS =
  "h-7 rounded-md border border-current/20 bg-white/70 px-2 text-[11px] text-gray-700 outline-none";

const StudentReportsPage = () => {
  const { month, year } = useOutletContext();
  const navigate = useNavigate();

  // ⚠️ Kunlik karta o'z sanasi bilan yashaydi va yuqoridagi OY filtriga
  // bog'lanmagan: "6-sentabrni 8-sentabrga solishtiray" degan ish oy
  // tanlashdan mustaqil. Default — bugun.
  const [day, setDay] = useState(todayInputValue);
  const [compareDay, setCompareDay] = useState("");
  // "YYYY-MM" yoki bo'sh (taqqoslashsiz)
  const [compareMonthValue, setCompareMonthValue] = useState("");

  const compareMonthOptions = useMemo(
    () => buildCompareMonthOptions(month, year),
    [month, year],
  );

  // Oy o'zgarganda eski tanlov ro'yxatdan tushib qolishi mumkin —
  // u paytda taqqoslash o'chiriladi (aks holda karta "—" ko'rsatib turardi)
  const safeCompareMonth = compareMonthOptions.some(
    (option) => option.value === compareMonthValue,
  )
    ? compareMonthValue
    : "";

  const [compareYear, compareMonthNumber] = safeCompareMonth
    ? safeCompareMonth.split("-")
    : [];

  const { data, isLoading } = useQuery(
    attendanceReportsQueries.students(month, year, {
      day,
      ...(compareDay ? { compareDay } : {}),
      ...(safeCompareMonth
        ? { compareMonth: Number(compareMonthNumber), compareYear: Number(compareYear) }
        : {}),
    }),
  );

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

  const overall = data.overall ?? {};

  // ⚠️ Sana va oy YORLIG'I serverdan tayyor keladi ("8-sentabr, 2026",
  // "Sentabr, 2026"): bu yerda qayta yig'ilsa, bitta ekranda ikki xil
  // sana formati paydo bo'lardi (`.claude/rules/dates.md`).
  const CONTROLS = {
    daily: (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={day}
          max={todayInputValue()}
          onChange={(e) => setDay(e.target.value || todayInputValue())}
          className={CONTROL_CLASS}
        />
        <span className="text-[11px] opacity-70">vs</span>
        <input
          type="date"
          value={compareDay}
          max={todayInputValue()}
          onChange={(e) => setCompareDay(e.target.value)}
          className={CONTROL_CLASS}
        />
      </div>
    ),
    monthly: (
      <select
        value={safeCompareMonth}
        onChange={(e) => setCompareMonthValue(e.target.value)}
        className={CONTROL_CLASS}
      >
        <option value="">Taqqoslashsiz</option>
        {compareMonthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} bilan
          </option>
        ))}
      </select>
    ),
  };

  // O'quvchi qatoriga bosilganda profil darhol "Davomat" tabida ochiladi:
  // bu hisobotdan kelgan odam aynan qoldirilgan kunlarni ko'rmoqchi
  const buildStudentProfilePath = (studentId) =>
    `/users/${studentId}?tab=attendance`;

  // Umumiy foiz kartalari: KUNLIK (tanlangan kun) va OYLIK (tanlangan oy).
  // Foiz = kelganlar / KUTILGAN (jadval bo'yicha), belgilanganlarga nisbatan emas
  const overallItems = OVERALL_PERCENT_CARDS.map(({ key, label }) => {
    const section = overall[key] || {};
    const compare = overall[key === "daily" ? "dailyCompare" : "monthlyCompare"];

    return {
      key,
      label:
        key === "daily"
          ? section.dateLabel || label
          : section.monthLabel || label,
      percent: section.percent ?? null,
      came: section.came ?? (section.present || 0) + (section.late || 0),
      total: section.expected || 0,
      unmarked: section.unmarked || 0,
      control: CONTROLS[key],
      compare: compare
        ? {
            label: key === "daily" ? compare.dateLabel : compare.monthLabel,
            percent: compare.percent ?? null,
          }
        : null,
      change: key === "daily" ? overall.dailyChange : overall.monthlyChange,
    };
  });

  // Grafik uchun oyning BARCHA kunlari - yozuvi yo'q kunlar ham o'z o'rnida
  const byDay = fillMonthDays(data.byDay, month, year);

  // ⚠️ Sinf jadvali KUNLIK kartadagi kun bo'yicha (server `byClass`):
  // oy yig'indisi "Kutilgan 152, kelgan 151" kabi o'quvchi-kunlarni
  // ko'rsatardi. Oy va yil kesimi — sinf hisobotida (qatorga bosiladi).
  const byClass = data.byClass || [];
  // "Eng yuqori/past" — faqat foizlar farq qilsa va teng foizlilarning
  // HAMMASIGA: kunlik jadvalda ko'p sinf 100% bo'ladi va bittasini
  // tanlab belgilash tasodifiy bo'lardi
  const classPercents = byClass.map((c) => c.percent).filter((p) => p != null);
  const topPercent = classPercents.length ? Math.max(...classPercents) : null;
  const lowPercent = classPercents.length ? Math.min(...classPercents) : null;
  const hasSpread = topPercent !== lowPercent;
  const riskGroup = data.riskGroup || [];
  const topStudents = data.topStudents || [];
  const reasons = data.reasons || {};
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

      {/* 3. Sinf kesimida — tanlangan KUN */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-gray-900">Sinf kesimida davomat</h2>
            <p className="text-xs text-gray-500">
              {overall.daily?.dateLabel || "Kunlik"} holati · batafsil hisobot
              (kunlik, oylik, yillik) uchun sinf ustiga bosing
            </p>
          </div>
          <input
            type="date"
            value={day}
            max={todayInputValue()}
            onChange={(e) => setDay(e.target.value || todayInputValue())}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
          />
        </div>

        {byClass.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">
            Bu kuni kutilgan o&apos;quvchi yo&apos;q
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Sinf</th>
                  <th className="text-left px-4 py-3">Kutilgan</th>
                  <th className="text-left px-4 py-3">Kelganlar</th>
                  <th className="text-left px-4 py-3">Kech keldi</th>
                  <th className="text-left px-4 py-3">Kelmadi</th>
                  <th className="text-left px-4 py-3">Sababli</th>
                  <th className="text-left px-4 py-3">Belgilanmagan</th>
                  <th className="text-left px-4 py-3">Davomat</th>
                </tr>
              </thead>
              <tbody>
                {byClass.map((cls) => (
                  <tr
                    key={cls.classId}
                    onClick={() => navigate(buildClassReportPath(cls.classId, day))}
                    className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cls.className}
                      {hasSpread && cls.percent === topPercent && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          Eng yuqori
                        </span>
                      )}
                      {hasSpread && cls.percent === lowPercent && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                          Eng past
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{cls.expected ?? 0}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {cls.came ?? (cls.present || 0) + (cls.late || 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{cls.late}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.absent}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.excused}</td>
                    <td className="px-4 py-3 text-gray-700">{cls.unmarked ?? 0}</td>
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
                  <tr
                    key={s.studentId}
                    onClick={() => navigate(buildStudentProfilePath(s.studentId))}
                    className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                  >
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
                  <tr
                    key={s.studentId}
                    onClick={() => navigate(buildStudentProfilePath(s.studentId))}
                    className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                  >
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
