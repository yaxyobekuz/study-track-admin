// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { ISSUE_TABS } from "../data/issues.data";

/**
 * Muammolar bo'limining YAGONA sahifasi (/issues) — topshiriqlar bo'limi
 * kabi: moslashuvchan sarlavha (aktiv tabga qarab) + tablar + Outlet.
 *
 * Yon menyuda bitta "Muammolar" bandi bor; Hisobotlar va Kategoriyalar
 * alohida sahifa emas, shu layout ichidagi tablar. Ruxsat talab qiladigan
 * tablar yashiriladi (`issues.reports`, `issues.categories`) — server
 * baribir har so'rovda tekshiradi.
 */
const IssuesLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  const tabs = ISSUE_TABS.filter((tab) => can(tab.permission));

  const activeTab =
    tabs.find((tab) =>
      tab.exact === false ? pathname.startsWith(tab.to) : pathname === tab.to,
    ) ?? tabs[0];

  return (
    <div className="space-y-4">
      {/* Moslashuvchan sarlavha */}
      <div>
        <h1 className="page-title">{activeTab?.title}</h1>
        {activeTab?.description && (
          <p className="mt-0.5 text-sm text-gray-500">
            {activeTab.description}
          </p>
        )}
      </div>

      {/* Tablar — tor ekranga sig'masa gorizontal scroll bo'ladi */}
      <TabsLinks
        items={tabs}
        itemClassName="shrink-0"
        className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />

      {/* Tab sahifasi */}
      <Outlet />
    </div>
  );
};

export default IssuesLayout;
