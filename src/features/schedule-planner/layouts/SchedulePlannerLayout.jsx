// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { MAIN_TABS } from "../data/plannerTabs.data";

/**
 * DARS JADVALINI REJALASHTIRISH (/schedule-planner).
 *
 * Bu bo'lim AMALDAGI dars jadvaliga tegmaydi — u alohida ish stoli.
 * Natijani asosiy jadvalga ko'chirish keyingi bosqichda qo'shiladi.
 */
const SchedulePlannerLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  // Ruxsat talab qiladigan tablar yashiriladi. Server baribir har so'rovda
  // tekshiradi — bu faqat UI qatlami.
  const tabs = MAIN_TABS.filter((tab) => !tab.can || can(tab.can));

  const activeTab =
    MAIN_TABS.find((tab) => pathname.startsWith(tab.to)) ?? MAIN_TABS[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Bu yerdagi jadval faqat REJA — amaldagi dars jadvaliga ta'sir
          qilmaydi.
        </p>
      </div>

      <TabsLinks
        items={tabs}
        itemClassName="shrink-0"
        className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />

      <Outlet />
    </div>
  );
};

export default SchedulePlannerLayout;
