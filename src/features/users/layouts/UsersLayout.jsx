// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Data
import { USERS_TABS } from "../data/usersTabs.data";

/**
 * Foydalanuvchilar bo'limining layouti.
 *
 * Bo'lim ikkiga bo'lingan — Xodimlar va O'quvchilar. Ular bir xil ma'lumot
 * manbasidan (`/users`) o'qiydi, lekin ustunlari, filtrlari va harakatlari
 * boshqacha, shuning uchun alohida sahifalar. Sarlavha aktiv tabga qarab
 * o'zgaradi (Davomat va Moliya bo'limlaridagi bilan bir xil naqsh).
 */
const UsersLayout = () => {
  const { pathname } = useLocation();

  const activeTab =
    USERS_TABS.find((tab) => pathname.startsWith(tab.to)) ?? USERS_TABS[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
        {activeTab.description && (
          <p className="text-sm text-gray-500 mt-0.5">
            {activeTab.description}
          </p>
        )}
      </div>

      <TabsLinks
        items={USERS_TABS}
        itemClassName="shrink-0"
        className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />

      <Outlet />
    </div>
  );
};

export default UsersLayout;
