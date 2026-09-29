// React
import { useState } from "react";

// Router
import { Outlet, useLocation } from "react-router-dom";

// Icons
import { ShieldOff } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { DEVICE_TABS } from "../data/devices.data";
import { T } from "../data/guard.tokens";
import { devicesQueries } from "../queries/devices.queries";

/**
 * QURILMA NAZORATI BO'LIMI (/devices) — sarlavha, tablar, Outlet.
 *
 * ⚠️ MODUL O'CHIQLIGI HAR SAHIFADA KO'RINADI. Sozlamadagi bitta bayroq
 * butun bo'limni ta'sirsiz qoldiradi: siyosatlar joyida, biriktirishlar
 * joyida, lekin telefonlarda hech narsa bajarilmaydi. Buni faqat
 * "Sozlamalar" tabida ko'rsatish eng yomon holatga olib kelardi —
 * admin qoidalarni sozlab, hammasi ishlayapti deb o'ylab yurardi.
 * Shuning uchun ogohlantirish LAYOUTDA, ya'ni har bir tabda turadi.
 *
 * ⚠️ SAHIFA FILTRLARI TABLAR QATORIDA (`filterSlot`): sahifa o'z
 * boshqaruvlarini portal orqali shu slotga joylaydi
 * (`LessonHoursLayout` bilan bir xil naqsh) — aks holda ekranning
 * yuqorisidan uch qator ketardi.
 */
const DevicesLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  // Sahifaga xos boshqaruvlar shu slotga joylanadi.
  const [filterSlot, setFilterSlot] = useState(null);

  const { data: settings } = useQuery(devicesQueries.settings());

  const tabs = DEVICE_TABS.filter((tab) => !tab.can || can(tab.can));
  const activeTab =
    DEVICE_TABS.find((tab) => pathname.startsWith(tab.to)) ?? DEVICE_TABS[0];

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          O'quvchi telefonida qaysi ilovalar ochilishi va qancha vaqt ishlashi
        </p>
      </div>

      {/* ── Modul o'chiq bo'lsa — har tabda ko'rinadigan ogohlantirish ── */}
      {settings && !settings.enabled && (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3">
          <ShieldOff className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-amber-900">
              Qurilma nazorati o'chirilgan
            </p>
            <p className={cn(T.hint, "mt-0.5 text-amber-700")}>
              Siyosatlar va biriktirishlar saqlanib turibdi, lekin telefonlarda
              hech qanday cheklov bajarilmayapti. Yoqish — «Sozlamalar» tabida.
            </p>
          </div>
        </div>
      )}

      {/* ── Boshqaruv qatori: tablar · sahifa filtrlari ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsLinks
          items={tabs}
          itemClassName="shrink-0"
          className="min-w-0 max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
        />

        <div ref={setFilterSlot} className="flex flex-wrap items-center gap-2" />
      </div>

      <Outlet context={{ filterSlot, settings }} />
    </div>
  );
};

export default DevicesLayout;
