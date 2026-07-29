// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Data
import { ATTENDANCE_TABS } from "../data/davomatTabs.data";

/**
 * Davomat bo'limining yagona layouti.
 * Moslashuvchan sarlavha (aktiv tabga qarab o'zgaradi) + asosiy tablar + Outlet.
 */
const AttendanceLayout = () => {
  const { pathname } = useLocation();

  // Aktiv asosiy tab (sarlavha shu asosida o'zgaradi)
  const activeTab =
    ATTENDANCE_TABS.find((tab) => pathname.startsWith(tab.to)) ??
    ATTENDANCE_TABS[0];

  return (
    <div className="space-y-4">
      {/* Moslashuvchan sarlavha */}
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
        {activeTab.description && (
          <p className="text-sm text-gray-500 mt-0.5">
            {activeTab.description}
          </p>
        )}
      </div>

      {/* Asosiy tablar — 7 ta, tor ekranga sig'masa gorizontal scroll bo'ladi
          (TabsLinks standart ko'rinishida scroll yo'q, shuning uchun shu yerda) */}
      <TabsLinks
        items={ATTENDANCE_TABS}
        itemClassName="shrink-0"
        className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />

      {/* Tab sahifasi */}
      <Outlet />
    </div>
  );
};

export default AttendanceLayout;
