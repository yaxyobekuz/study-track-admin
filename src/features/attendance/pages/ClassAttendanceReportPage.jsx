// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useParams, useSearchParams } from "react-router-dom";

// Icons
import { ArrowLeft } from "lucide-react";

// Utils
import { todayInputValue } from "@/shared/utils/date.utils";

// Queries
import { attendanceReportsQueries } from "../queries/attendance.queries";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import DailyAttendanceChart from "../components/DailyAttendanceChart";
import ClassReportSummary from "../components/classReport/ClassReportSummary";
import ClassMonthBreakdown from "../components/classReport/ClassMonthBreakdown";
import ClassReportStudentsTable from "../components/classReport/ClassReportStudentsTable";

// Data
import { MONTH_OPTIONS } from "../data/attendance.data";
import { YEAR_OPTIONS } from "../data/studentAttendance.data";
import {
  CLASS_REPORT_PERIODS,
  fillMonthDays,
} from "../data/attendanceReports.data";

const toSelectOptions = (items) =>
  items.map(({ label, value }) => ({ label, value: String(value) }));

/**
 * Bitta sinfning davomat hisoboti — kunlik / oylik / yillik.
 * "Sinf kesimida davomat" jadvalidagi qatorga bosib ochiladi.
 *
 * ⚠️ Davr URL'da (`?period=month&month=9&year=2026`): sahifani o'sha davr
 * bilan havola qilib yuborish va brauzerning "orqaga" tugmasi ishlaydi.
 * Oy va yil berilmasa `date` dan olinadi — "Kunlik"dan "Oylik"ka o'tilganda
 * tanlangan kunning oyi ochiladi, boshqa oy emas.
 */
const ClassAttendanceReportPage = () => {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get("period");
  const period = CLASS_REPORT_PERIODS.some((p) => p.value === periodParam)
    ? periodParam
    : "day";
  const date = searchParams.get("date") || todayInputValue();
  const month = Number(searchParams.get("month")) || Number(date.slice(5, 7));
  const year = Number(searchParams.get("year")) || Number(date.slice(0, 4));

  const params =
    period === "day"
      ? { period, date }
      : period === "month"
        ? { period, month, year }
        : { period, year };

  const { data, isLoading, isError, error } = useQuery(
    attendanceReportsQueries.studentClass(classId, params),
  );

  // `null` — parametrni URL'dan olib tashlash
  const updateParams = (patch) =>
    setSearchParams(
      (prev) => {
        for (const [key, value] of Object.entries(patch)) {
          if (value == null || value === "") prev.delete(key);
          else prev.set(key, String(value));
        }
        return prev;
      },
      { replace: true },
    );

  const controls = {
    day: (
      <input
        type="date"
        value={date}
        max={todayInputValue()}
        // Kun almashsa oy/yil qaytadan kundan olinadi
        onChange={(e) =>
          updateParams({ date: e.target.value || null, month: null, year: null })
        }
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
      />
    ),
    month: (
      <div className="flex items-center gap-2">
        <Select
          value={String(month)}
          triggerClassName="min-w-36"
          onChange={(v) => updateParams({ month: v, year })}
          options={toSelectOptions(MONTH_OPTIONS)}
        />
        <Select
          value={String(year)}
          triggerClassName="min-w-28"
          onChange={(v) => updateParams({ year: v, month })}
          options={toSelectOptions(YEAR_OPTIONS)}
        />
      </div>
    ),
    year: (
      <Select
        value={String(year)}
        triggerClassName="min-w-28"
        onChange={(v) => updateParams({ year: v })}
        options={toSelectOptions(YEAR_OPTIONS)}
      />
    ),
  };

  const notFound = isError && error?.response?.status === 404;

  // Yetakchilarni ajratish faqat ular ozchilik bo'lsa ma'noli — hamma qator
  // qizil bo'lsa, ajratishning o'zi yo'qoladi
  const concentration = data?.concentration;
  const leaders =
    concentration && concentration.students < concentration.missedStudents
      ? concentration.students
      : 0;

  return (
    <div className="space-y-4">
      <Link
        to="/attendance/reports/students"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        Hisobotlarga qaytish
      </Link>

      {/* Sarlavha + davr tanlagichi */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {data?.classInfo?.name || "Sinf"}
            </h2>
            {/* Yorliq serverdan tayyor ("16-sentabr, 2026" / "Sentabr, 2026") */}
            <p className="text-sm text-gray-500">
              Davomat hisoboti{data?.periodLabel ? ` · ${data.periodLabel}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TabsButtons
              items={CLASS_REPORT_PERIODS}
              value={period}
              onChange={(value) => updateParams({ period: value })}
            />
            {controls[period]}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : notFound ? (
        <div className="py-8 text-center text-gray-500">Sinf topilmadi</div>
      ) : !data ? (
        <div className="py-8 text-center text-gray-500">
          Ma&apos;lumot topilmadi
        </div>
      ) : !data.summary.expected ? (
        <Card>
          <p className="py-6 text-center text-sm text-gray-400">
            {data.period === "day"
              ? "Bu kuni sinfda dars yo'q yoki kutilgan o'quvchi yo'q"
              : "Bu davrda sinf bo'yicha davomat ma'lumoti yo'q"}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <ClassReportSummary
              period={data.period}
              summary={data.summary}
              concentration={data.concentration}
            />
          </Card>

          {data.period === "month" && (
            <Card title="Kun bo'yicha davomat" className="space-y-3">
              <DailyAttendanceChart
                byDay={fillMonthDays(data.byDay, data.month, data.year)}
              />
            </Card>
          )}

          {data.period === "year" && (
            <Card title="Oylar bo'yicha davomat" className="space-y-3">
              <ClassMonthBreakdown byMonth={data.byMonth} />
            </Card>
          )}

          <Card
            title={
              data.period === "day"
                ? "O'quvchilar"
                : "O'quvchilar — sinf foiziga ta'siri bo'yicha"
            }
            className="space-y-3"
          >
            {data.period !== "day" && (
              <p className="text-xs text-gray-500">
                Ro&apos;yxat qoldirilgan kunlar soni bo&apos;yicha: birinchi
                turganlar sinf davomatini eng ko&apos;p tushirganlar.
                &quot;Qoldirgan&quot; = kelmadi + sababli + belgilanmagan.
              </p>
            )}
            <ClassReportStudentsTable
              period={data.period}
              students={data.students}
              leaders={leaders}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ClassAttendanceReportPage;
