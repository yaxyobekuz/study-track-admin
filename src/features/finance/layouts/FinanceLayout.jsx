// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Data
import { FINANCE_TABS } from "../data/financeTabs.data";

/**
 * Moliya bo'limining yagona layouti (Davomat bo'limi bilan bir xil skelet).
 * Moslashuvchan sarlavha (aktiv tabga qarab o'zgaradi) + asosiy tablar + Outlet.
 */
const FinanceLayout = () => {
  const { pathname } = useLocation();

  // Aktiv asosiy tab (sarlavha shu asosida o'zgaradi)
  const activeTab =
    FINANCE_TABS.find((tab) => pathname.startsWith(tab.to)) ?? FINANCE_TABS[0];

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

      {/* Asosiy tablar — tor ekranga sig'masa gorizontal scroll bo'ladi */}
      <TabsLinks
        items={FINANCE_TABS}
        itemClassName="shrink-0"
        className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />

      {/* Tab sahifasi */}
      <Outlet />
    </div>
  );
};

export default FinanceLayout;
