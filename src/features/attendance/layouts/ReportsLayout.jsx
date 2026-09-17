// Router
import { Outlet, useSearchParams } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";
import Select from "@/shared/components/ui/select/Select";

// Data
import { MONTH_OPTIONS } from "../data/attendance.data";
import { YEAR_OPTIONS } from "../data/studentAttendance.data";
import { REPORTS_SUBTABS } from "../data/davomatTabs.data";

/**
 * Davomat hisobotlari sub-layouti.
 * O'quvchilar / Xodimlar sub-tablari + oy va yil filtri.
 * Tanlangan oy va yil Outlet context orqali sahifalarga uzatiladi.
 * ("Bugun" va "Shu hafta" ko'rsatkichlari doim joriy kunga tegishli.)
 *
 * ⚠️ Oy va yil URL'da (`?month=8&year=2026`), holatda EMAS: hisobotdan
 * o'quvchi profiliga kirib "orqaga" qaytilganda sahifa qayta o'rnatiladi va
 * holatdagi tanlov joriy oyga qaytib ketardi — foydalanuvchi boshqa oyning
 * jadvaliga tushib qolardi. Sub-tablar ham shu parametrlarni olib yuradi.
 */
const ReportsLayout = () => {
  const now = new Date();
  const [searchParams, setSearchParams] = useSearchParams();

  const parsedMonth = Number(searchParams.get("month"));
  const parsedYear = Number(searchParams.get("year"));
  const month =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : now.getMonth() + 1;
  const year = Number.isInteger(parsedYear) && parsedYear > 2000
    ? parsedYear
    : now.getFullYear();

  // `replace`: oy almashtirish tarixga yozilmaydi — "orqaga" oylar bo'ylab
  // emas, oldingi sahifaga qaytishi kerak
  const setPeriod = (key, value) =>
    setSearchParams(
      (prev) => {
        prev.set(key, String(value));
        return prev;
      },
      { replace: true },
    );

  const query = searchParams.toString();
  const subtabs = REPORTS_SUBTABS.map((tab) => ({
    ...tab,
    to: query ? `${tab.to}?${query}` : tab.to,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sub-tablar */}
        <TabsLinks items={subtabs} />

        {/* O'ng tomon: oy + yil */}
        <div className="flex items-center flex-wrap gap-2">
          <Select
            value={String(month)}
            triggerClassName="min-w-36"
            onChange={(v) => setPeriod("month", Number(v))}
            options={MONTH_OPTIONS.map((m) => ({
              label: m.label,
              value: String(m.value),
            }))}
          />

          <Select
            value={String(year)}
            triggerClassName="min-w-28"
            onChange={(v) => setPeriod("year", Number(v))}
            options={YEAR_OPTIONS.map((y) => ({
              label: y.label,
              value: String(y.value),
            }))}
          />
        </div>
      </div>

      {/* Sahifalar oy/yilni useOutletContext() orqali oladi */}
      <Outlet context={{ month, year }} />
    </div>
  );
};

export default ReportsLayout;
