// React
import { useState } from "react";

// Router
import { Outlet } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/tabs/Tabs";

// Data
import { DAILY_SUBTABS } from "../data/davomatTabs.data";

// Bugungi sanani yyyy-mm-dd (mahalliy vaqt) ko'rinishida qaytaradi
const getTodayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * Kunlik davomat sub-layouti.
 * O'quvchilar / Xodimlar sub-tablari + sana tanlagich (default - bugun).
 * Tanlangan sana Outlet context orqali sahifalarga uzatiladi.
 */
const DailyAttendanceLayout = () => {
  const [date, setDate] = useState(getTodayInputValue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sub-tablar */}
        <TabsLinks items={DAILY_SUBTABS} />

        {/* Sana tanlagich (istalgan kunni ko'rish mumkin) */}
        <input
          type="date"
          value={date}
          max={getTodayInputValue()}
          onChange={(e) => setDate(e.target.value || getTodayInputValue())}
          className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-2 outline-primary"
        />
      </div>

      {/* Sahifalar tanlangan sanani useOutletContext() orqali oladi */}
      <Outlet context={{ date }} />
    </div>
  );
};

export default DailyAttendanceLayout;
