// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { INVENTORY_TABS } from "../data/inventory.data";

// Modallar — bo'lim ichida BIR MARTA mount qilinadi
import InventoryModals from "../components/InventoryModals";

/**
 * INVENTAR bo'limi — moddiy-texnik baza.
 *
 * Moliya bo'limi bilan bir xil shakl: moslashuvchan sarlavha + tablar +
 * Outlet. Ruxsat talab qiladigan tablar yashiriladi (server baribir har
 * so'rovda tekshiradi — bu faqat UI qatlami).
 */
const InventoryLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  const tabs = INVENTORY_TABS.filter((tab) => !tab.can || can(tab.can));
  const activeTab =
    INVENTORY_TABS.find((tab) => pathname.startsWith(tab.to)) ?? INVENTORY_TABS[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
      </div>

      {/* Tor ekranga sig'masa gorizontal scroll bo'ladi */}
      <TabsLinks
        items={tabs}
        itemClassName="shrink-0"
        className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />

      <Outlet />

      {/* Modallar tab almashganda ham ochiq qolishi uchun layout darajasida */}
      <InventoryModals />
    </div>
  );
};

export default InventoryLayout;
