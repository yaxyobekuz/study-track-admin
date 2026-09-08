// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";
import LedgerGround from "../components/LedgerGround";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { HOURS_TABS } from "../data/lessonHours.data";

/**
 * DARS SOATLARI BO'LIMI (/lesson-hours) — sarlavha + tablar + Outlet.
 *
 * ⚠️ ZAMIN BU YERDA EMAS, `LedgerGround` da. Sahifa ikki joydan
 * ochiladi — o'z bo'limidan va bosh sahifadagi dashboardlar qatoridan
 * (`/lesson-load`) — ikkinchisida bu layout umuman ishtirok etmaydi.
 * Zamin layoutda qolsa, bosh sahifadan ochilgan ekran oq fonda "yassi"
 * ko'rinardi.
 */
const LessonHoursLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

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

        <TabsLinks
          items={tabs}
          itemClassName="shrink-0"
          className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
        />

        <Outlet />
      </div>
    </LedgerGround>
  );
};

export default LessonHoursLayout;
