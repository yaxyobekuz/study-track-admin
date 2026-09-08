// React
import { useState } from "react";

// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";
import LedgerGround from "../components/LedgerGround";
import MonthPicker from "../components/MonthPicker";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { currentMonthKey } from "@/shared/helpers/month.helpers";

// Data
import { HOURS_TABS } from "../data/lessonHours.data";

/**
 * DARS SOATLARI BO'LIMI (/lesson-hours) — sarlavha, boshqaruv qatori, Outlet.
 *
 * ⚠️ TABLAR, SAHIFA FILTRLARI VA OY TANLAGICH — BITTA QATORDA.
 *
 * Ilgari har biri o'z qatorida turardi va ekranning yuqorisidan uchta qator
 * ketardi: sarlavha, tablar, keyin o'ngda yolg'iz oy tanlagich, keyin yana
 * sahifaning o'z filtrlari. Kontent esa faqat undan keyin boshlanardi.
 * `DailyAttendanceLayout` dagi naqsh: sahifa o'z boshqaruvlarini portal
 * orqali shu qatordagi SLOTGA joylaydi.
 *
 * ⚠️ OY HOLATI LAYOUTDA. Tanlagich shu yerda chizilgani uchun qiymat ham
 * shu yerda turishi kerak; sahifalar uni `useOutletContext()` orqali
 * oladi. Yon foyda: tablar orasida o'tganda tanlangan oy SAQLANADI —
 * ilgari har sahifa o'z `useState` iga ega bo'lgani uchun vedomostga
 * o'tganda oy joriy oyga qaytib ketardi.
 *
 * ⚠️ OY TANLAGICH FAQAT OY KESIMIDAGI TABLARDA (`monthScoped`).
 * O'rinbosarlik sana oralig'i bilan ishlaydi — u yerda oy tanlagich
 * hech narsani o'zgartirmasdi va shu sababli chalg'itardi.
 *
 * ⚠️ ZAMIN `LedgerGround` da: sahifa bosh sahifadagi dashboardlar qatoridan
 * ham ochiladi (`/lesson-load`), u yerda esa bu layout ishtirok etmaydi.
 */
const LessonHoursLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  const [month, setMonth] = useState(currentMonthKey());

  // Sahifaga xos boshqaruvlar shu slotga portal orqali joylanadi —
  // shunda tablar, filtrlar va oy bitta qatorda turadi.
  const [filterSlot, setFilterSlot] = useState(null);

  const tabs = HOURS_TABS.filter((tab) => !tab.can || can(tab.can));
  const activeTab =
    HOURS_TABS.find((tab) => pathname.startsWith(tab.to)) ?? HOURS_TABS[0];

  return (
    <LedgerGround>
      <div className="space-y-4">
        <div>
          <h1 className="page-title">{activeTab.title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            O'qituvchilarning akademik soati, maosh rejimi va o'rinbosarlik
          </p>
        </div>

        {/* ── Boshqaruv qatori: tablar · sahifa filtrlari · oy ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsLinks
            items={tabs}
            itemClassName="shrink-0"
            className="min-w-0 max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div ref={setFilterSlot} className="flex flex-wrap items-center gap-2" />

            {activeTab.monthScoped && (
              <MonthPicker month={month} onChange={setMonth} />
            )}
          </div>
        </div>

        <Outlet context={{ month, setMonth, filterSlot }} />
      </div>
    </LedgerGround>
  );
};

export default LessonHoursLayout;
