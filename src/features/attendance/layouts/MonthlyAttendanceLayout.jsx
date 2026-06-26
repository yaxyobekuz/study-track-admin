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

  // Sahifaga xos filtr (sinf/rol) shu slotga portal orqali joylanadi -
  // shunda tablar, sahifa filtri, oy va yil bitta qatorda turadi.
  const [filterSlot, setFilterSlot] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sub-tablar */}
        <TabsLinks items={MONTHLY_SUBTABS} />

        {/* O'ng tomon: sahifa filtri + oy + yil - bitta qatorda */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Sahifaga xos filtr uchun slot (portal) */}
          <div ref={setFilterSlot} className="flex items-center gap-2" />

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

      {/* Sahifalar oy/yil va filtr slotini useOutletContext() orqali oladi */}
      <Outlet context={{ month, year, filterSlot }} />
    </div>
  );
};

export default MonthlyAttendanceLayout;
