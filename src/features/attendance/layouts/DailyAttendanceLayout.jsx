// React
import { useState } from "react";

// Router
import { Outlet, useSearchParams } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Utils
import { todayInputValue } from "@/shared/utils/date.utils";

// Data
import { DAILY_SUBTABS } from "../data/davomatTabs.data";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Kunlik davomat sub-layouti.
 * O'quvchilar / Xodimlar sub-tablari + sana tanlagich (default - bugun).
 * Tanlangan sana Outlet context orqali sahifalarga uzatiladi.
 *
 * ⚠️ Sana URL'da (`?date=`), holatda emas: o'quvchi qatoridan profilga
 * kirib "orqaga" qaytilganda sahifa qayta o'rnatiladi va holatdagi sana
 * bugunga qaytib ketardi (`ReportsLayout` bilan bir xil sabab). Bugun —
 * parametrsiz, kelajak yoki yaroqsiz qiymat ham bugunga qaytadi.
 */
const DailyAttendanceLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = todayInputValue();
  const rawDate = searchParams.get("date");
  const date = rawDate && DAY_RE.test(rawDate) && rawDate <= today ? rawDate : today;

  // `replace`: sana almashtirish tarixga yozilmaydi — "orqaga" kunlar bo'ylab
  // emas, oldingi sahifaga qaytishi kerak. Sahifa raqami ham tashlanadi:
  // boshqa kunda 5-sahifa bo'lmasligi mumkin.
  const setDate = (value) =>
    setSearchParams(
      (prev) => {
        if (value && value !== today) prev.set("date", value);
        else prev.delete("date");
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );

  // Sub-tab almashganda sana saqlanadi, sahifaga xos filtrlar esa yo'q
  // (o'quvchilarning holat filtri xodimlar sahifasida ma'nosiz)
  const subtabs = DAILY_SUBTABS.map((tab) => ({
    ...tab,
    to: date !== today ? `${tab.to}?date=${date}` : tab.to,
  }));

  // Sahifaga xos filtr (sinf/rol) shu slotga portal orqali joylanadi -
  // shunda tablar, sahifa filtri va sana bitta qatorda turadi.
  const [filterSlot, setFilterSlot] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sub-tablar */}
        <TabsLinks items={subtabs} />

        {/* O'ng tomon: sahifa filtri + sana - bitta qatorda */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Sahifaga xos filtr uchun slot (portal) */}
          <div ref={setFilterSlot} className="flex items-center gap-2" />

          {/* Sana tanlagich (istalgan kunni ko'rish mumkin) */}
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-2 outline-primary"
          />
        </div>
      </div>

      {/* Sahifalar sana va filtr slotini useOutletContext() orqali oladi */}
      <Outlet context={{ date, filterSlot }} />
    </div>
  );
};

export default DailyAttendanceLayout;
