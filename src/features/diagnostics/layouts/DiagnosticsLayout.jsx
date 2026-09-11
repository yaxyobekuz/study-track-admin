// React
import { useState } from "react";

// Router
import { Outlet, useLocation } from "react-router-dom";

// Components
import TabsLinks from "@/shared/components/ui/tabs/TabsLinks";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { DIAGNOSTIC_TABS } from "../data/diagnostics.data";

/**
 * DIAGNOSTIKA BO'LIMI (/diagnostics) — sarlavha, tablar, Outlet.
 *
 * ⚠️ TABLAR RUXSAT BO'YICHA FILTRLANADI. Savollar bazasi
 * (`diagnostics.questions`), natijalar (`diagnostics.attempts`) va tahlil
 * (`diagnostics.analytics`) alohida huquqlar: narxni ko'rish moliyada
 * qanday qarzdorlik registrini ochmasa, bu yerda ham savol yozish huquqi
 * har bir o'quvchining zaif tomonlari ro'yxatini ochmasligi kerak.
 *
 * ⚠️ SAHIFA FILTRLARI SHU QATORDAGI SLOTGA JOYLANADI (`filterSlot`) —
 * `LessonHoursLayout` dagi naqsh. Aks holda tablar, filtrlar va sana
 * oralig'i uchta alohida qator egallab, kontent ekranning pastida
 * boshlanardi.
 */
const DiagnosticsLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  const [filterSlot, setFilterSlot] = useState(null);

  const tabs = DIAGNOSTIC_TABS.filter((tab) => !tab.can || can(tab.can));

  // Eng UZUN mos yo'l yutadi — `/diagnostics/questions/...` "Umumiy" emas,
  // "Savollar bazasi" tabini faollashtiradi.
  const activeTab =
    [...DIAGNOSTIC_TABS]
      .filter((tab) =>
        tab.exact ? pathname === tab.to : pathname.startsWith(tab.to),
      )
      .sort((a, b) => b.to.length - a.to.length)[0] ?? DIAGNOSTIC_TABS[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          O'quvchining bilim darajasini o'lchash, kamchiliklarni topish va
          o'quv rejasini tuzish
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsLinks
          items={tabs.map((tab) => ({
            to: tab.to,
            label: tab.label,
            exact: tab.exact,
          }))}
          itemClassName="shrink-0"
          className="min-w-0 max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
        />

        <div
          ref={setFilterSlot}
          className="flex flex-wrap items-end gap-2"
        />
      </div>

      <Outlet context={{ filterSlot }} />
    </div>
  );
};

export default DiagnosticsLayout;
