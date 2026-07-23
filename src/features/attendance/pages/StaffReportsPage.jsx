// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDurationUZ } from "@/shared/utils/date.utils";

// API
import { attendanceReportAPI } from "../api/attendanceReport.api";

// Components
import Card from "@/shared/components/ui/Card";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";

// Data & hooks
import { STAFF_SUMMARY_CARDS, buildRoleLabelMap } from "../data/attendance.data";
import { getPercentColor, RANK_COLORS } from "../data/attendanceReports.data";
import { useRoles } from "@/features/roles/queries/roles.queries";

const StaffReportsPage = () => {
  const { month, year } = useOutletContext();

  const { data: roles = [] } = useRoles();
  const roleLabelMap = buildRoleLabelMap(roles);
  const roleLabel = (role) => roleLabelMap[role] || role;

  const { data, isLoading } = useQuery({
    queryKey: ["attendanceReports", "staff", { month, year }],
    queryFn: () =>
      attendanceReportAPI.getStaffReport(month, year).then((r) => r.data),
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

  const todayBalance = data.todayBalance || {};
  const todayExcused = data.todayExcused || [];
  const punctuality = data.punctuality || [];
  const timesheet = data.timesheet || [];
  const topStaff = data.topStaff || [];

  return (
    <div className="space-y-4">
      {/* 1. Bugungi balans */}
      <Card title="Bugungi balans" className="space-y-3">
        <AttendanceSummaryCards
          cards={STAFF_SUMMARY_CARDS}
          summary={todayBalance}
          className="sm:grid-cols-3 lg:grid-cols-6"
        />

        {todayExcused.length > 0 && (
          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-2">
              Bugun sababli kelmaganlar
            </p>
            <div className="space-y-1.5">
              {todayExcused.map((e) => (
                <div
                  key={e.userId}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="font-medium text-gray-900">{e.name}</span>
                  <span className="text-xs text-gray-500">
                    {roleLabel(e.role)}
                  </span>
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                    {e.reasonTitle || "Sabab ko'rsatilmagan"}
                  </span>
                  {e.note && (
                    <span className="text-xs text-gray-400">{e.note}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 2. Punctuality */}
      <Card title="Eng ko'p kechikuvchilar" className="space-y-3">
        {punctuality.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">
            Bu oyda kechikishlar qayd etilmagan
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Xodim</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Kechikishlar soni</th>
                  <th className="text-left px-4 py-3">O&apos;rtacha kechikish</th>
                  <th className="text-left px-4 py-3">Jami kechikish</th>
                </tr>
              </thead>
              <tbody>
                {punctuality.map((p) => (
                  <tr key={p.userId} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {roleLabel(p.role)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
                        {p.lateCount} marta
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDurationUZ(p.avgLateMinutes)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDurationUZ(p.totalLateMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 3. Ish vaqti (Timesheet) */}
      <Card title="Ish vaqti hisobi" className="space-y-3">
        <p className="text-xs text-gray-500">
          Kelish va ketish qayd etilgan kunlar bo&apos;yicha haqiqiy ish
          joyidagi vaqt
        </p>

        {timesheet.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">
            Bu oyda to&apos;liq (kelish-ketish) yozuvlar yo&apos;q
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Xodim</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Ish kunlari</th>
                  <th className="text-left px-4 py-3">Jami ish vaqti</th>
                  <th className="text-left px-4 py-3">O&apos;rtacha kunlik</th>
                </tr>
              </thead>
              <tbody>
                {timesheet.map((t) => (
                  <tr key={t.userId} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {roleLabel(t.role)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{t.days} kun</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatDurationUZ(t.totalMinutes)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDurationUZ(t.avgMinutesPerDay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Eng yaxshi xodimlar */}
      <Card title="Davomat bo'yicha eng yaxshi xodimlar" className="space-y-3">
        {topStaff.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Ma&apos;lumot topilmadi</p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Xodim</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Davomat</th>
                  <th className="text-left px-4 py-3">Kechikishlar</th>
                  <th className="text-left px-4 py-3">Belgilangan kunlar</th>
                </tr>
              </thead>
              <tbody>
                {topStaff.map((s, idx) => (
                  <tr key={s.userId} className="border-t border-gray-100">
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
                      {roleLabel(s.role)}
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
                    <td className="px-4 py-3 text-gray-700">
                      {s.late === 0 ? (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          Kechikmagan
                        </span>
                      ) : (
                        `${s.late} marta`
                      )}
                    </td>
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

export default StaffReportsPage;
