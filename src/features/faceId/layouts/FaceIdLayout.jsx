// React
import { useState } from "react";

// Router
import { Outlet, useLocation } from "react-router-dom";

// Icons
import { ScanFace, ShieldAlert, WifiOff } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data & queries
import { FACE_ID_TABS } from "../data/faceId.data";
import { faceIdQueries } from "../queries/faceId.queries";

/**
 * FACE ID BO'LIMI (/face-id) — sarlavha, ogohlantirishlar, tablar, Outlet.
 *
 * ⚠️ IKKI OGOHLANTIRISH LAYOUTDA, ya'ni HAR TABDA turadi
 * (`DevicesLayout` bilan bir xil qaror):
 *
 *   1. MODUL HECH KIM UCHUN YOQILMAGAN. Sozlamadagi ikkita bayroq
 *      o'chirilgan bo'lsa, kiosklar joyida, odamlar ro'yxatda, lekin
 *      hech kim o'ta olmaydi. Buni faqat "Sozlamalar" tabida ko'rsatish
 *      eng yomon holat bo'lardi — admin kiosk o'rnatib, ishlamayotganini
 *      bilmay yurardi.
 *
 *   2. OFLAYNDA QOLGAN QAYDLAR. Internet uzilgan kiosk davomatni lokal
 *      navbatga yozadi va ulanish qaytganda yuboradi. Agar navbat
 *      o'smoqda bo'lsa — demak qurilma uzilgan va kimdir borib
 *      qarashi kerak. Bu raqam yashirilsa, kun oxirida "davomat
 *      yo'qolgan" degan muammo bo'lib chiqardi.
 */
const FaceIdLayout = () => {
  const { pathname } = useLocation();
  const { can } = usePermissions();

  // Sahifaga xos boshqaruvlar shu slotga joylanadi (portal orqali).
  const [filterSlot, setFilterSlot] = useState(null);

  const { data: overview } = useQuery(faceIdQueries.overview());
  const settings = overview?.coverage ? overview : null;

  const tabs = FACE_ID_TABS.filter((tab) => !tab.can || can(tab.can));
  const activeTab =
    FACE_ID_TABS.find((tab) => pathname.startsWith(tab.to)) ?? FACE_ID_TABS[0];

  const pending = overview?.pendingOffline ?? 0;
  const kiosks = overview?.kiosks ?? [];
  const noKiosks = settings && kiosks.length === 0;

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="page-title">{activeTab.title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Kiosk orqali yuz bilan davomatdan o'tish — panel va telefon yo'li
          o'z holida ishlashda davom etadi
        </p>
      </div>

      {/* ── Birorta kiosk yo'q — bo'lim hali ishlamaydi ── */}
      {noKiosks && (
        <div className="flex items-start gap-2.5 rounded-xl bg-sky-50 px-4 py-3">
          <ScanFace className="mt-0.5 size-4 shrink-0 text-sky-600" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-sky-900">
              Hali birorta kiosk qo'shilmagan
            </p>
            <p className="mt-0.5 text-[12px] text-sky-700">
              «Kiosklar» tabida qurilma qo'shing — u sizga bir martalik
              biriktirish kodini beradi, kodni esa kiosk dasturiga kiritasiz.
            </p>
          </div>
        </div>
      )}

      {/* ── Oflayn navbat o'smoqda ── */}
      {pending > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3">
          <WifiOff className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-amber-900">
              {pending} ta qayd hali yuborilmagan
            </p>
            <p className="mt-0.5 text-[12px] text-amber-700">
              Kiosk internetga ulanmagan va davomatni o'zida saqlab turibdi.
              Ulanish qaytganda qaydlar avtomatik yuboriladi — lekin qurilmani
              tekshirib chiqish kerak.
            </p>
          </div>
        </div>
      )}

      {/* ── Tiriklik tekshiruvi o'chirilgan ── */}
      {overview?.coverage && overview.coverage.staleProfiles > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-orange-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-orange-600" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-orange-900">
              {overview.coverage.staleProfiles} ta profil taqqoslashga kirmayapti
            </p>
            <p className="mt-0.5 text-[12px] text-orange-700">
              Ularning namunalari boshqa model bilan olingan. Bu odamlarni
              qaytadan ro'yxatga olish kerak — aks holda kiosk ularni
              tanimaydi.
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

      <Outlet context={{ filterSlot, overview }} />
    </div>
  );
};

export default FaceIdLayout;
