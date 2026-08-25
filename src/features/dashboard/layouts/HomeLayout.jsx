// Router
import { Outlet } from "react-router-dom";

// Components
import { TabsLinks } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { HOME_TABS } from "../data/homeTabs.data";

/**
 * BOSH SAHIFA LAYOUT'i — "Asosiy" va "Moliya" tablari.
 *
 * Sarlavha ATAYLAB bu yerda chizilmaydi: ikkala tab sahifasi ham o'z
 * sarlavhasiga ega ("Xush kelibsiz" kartasi va "Moliya hisobotlari" +
 * davr tanlagichi). Layout ham sarlavha qo'ysa, ekranda ikkita sarlavha
 * ustma-ust turib qolardi.
 *
 * Tab route bilan almashadi (holat bilan emas) — shunda havolani ulashish
 * mumkin, "orqaga" tugmasi ishlaydi va ko'rinmayotgan tab mount bo'lmaydi.
 */
const HomeLayout = () => {
  const { can } = usePermissions();

  // Ruxsati yo'q tab ko'rinmaydi. Server baribir har so'rovda tekshiradi —
  // bu faqat UI qatlami.
  const tabs = HOME_TABS.filter((tab) => !tab.can || can(tab.can));

  return (
    <div className="space-y-4">
      {/* Bitta tabdan ko'p bo'lgandagina ko'rsatiladi: moliya ruxsati yo'q
          xodimga yolg'iz "Asosiy" tabi keraksiz bezak bo'lardi */}
      {tabs.length > 1 && (
        <TabsLinks
          items={tabs}
          itemClassName="shrink-0"
          className="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
        />
      )}

      <Outlet />
    </div>
  );
};

export default HomeLayout;
