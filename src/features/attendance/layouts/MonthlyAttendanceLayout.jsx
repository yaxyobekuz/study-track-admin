// React
import { useState } from "react";

// Router
import { Outlet } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/tabs/Tabs";
import Select from "@/shared/components/ui/select/Select";

// Data
import { MONTH_OPTIONS } from "../data/attendance.data";
import { YEAR_OPTIONS } from "../data/studentAttendance.data";
import { MONTHLY_SUBTABS } from "../data/davomatTabs.data";

/**
 * Oylik davomat sub-layouti.
 * O'quvchilar / Xodimlar sub-tablari + oy va yil filtri (ui/select).
 * Tanlangan oy va yil Outlet context orqali sahifalarga uzatiladi.
 */
const MonthlyAttendanceLayout = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sub-tablar */}
        <TabsLinks items={MONTHLY_SUBTABS} />

        {/* Oy va yil filtri */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={String(month)}
            triggerClassName="min-w-36"
            onChange={(v) => setMonth(Number(v))}
            options={MONTH_OPTIONS.map((m) => ({
              label: m.label,
              value: String(m.value),
            }))}
          />

          <Select
            value={String(year)}
            triggerClassName="min-w-28"
            onChange={(v) => setYear(Number(v))}
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

export default MonthlyAttendanceLayout;
