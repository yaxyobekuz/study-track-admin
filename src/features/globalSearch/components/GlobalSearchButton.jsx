// React
import { useEffect, useMemo } from "react";

// Icons
import { Search } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Sidebar
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/components/shadcn/sidebar";

/**
 * Sidebar'dagi global qidiruv tugmasi — filial almashtirgich ostida.
 *
 * Qidiruvning o'zi modalda (`globalSearch`): sidebar yopilgan (ikonka)
 * holatda ham ishlashi kerak, ichki panel esa o'sha holatda sig'masdi.
 *
 * ⚠️ Ctrl/Cmd+K — modal YOPIQ bo'lganda ochadi. Ochiq bo'lganda e'tiborsiz
 * qoldiriladi: yopish uchun Esc bor va ikkita ochish/yopish yo'li bo'lsa
 * tugmani ikki marta bosish modalni "o'chirib-yoqib" yuborardi.
 */
const GlobalSearchButton = () => {
  const { openModal, isOpen } = useModal("globalSearch");

  // Yorliq platformaga qarab: Windows'da "⌘K" noto'g'ri klavishni
  // ko'rsatardi. `navigator.platform` eskirgan, lekin shu maqsad uchun
  // hamma brauzerda ishlaydigan yagona qiymat.
  const shortcutLabel = useMemo(
    () => (/Mac|iPhone|iPad/i.test(navigator.platform ?? "") ? "⌘K" : "Ctrl K"),
    [],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key?.toLowerCase() !== "k") return;
      // Brauzerning o'z qidiruv satrini ochib yubormasin
      event.preventDefault();
      if (!isOpen) openModal("globalSearch");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, openModal]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* AMAL, holat ko'rsatkichi emas: filial tanlagich kabi ikki qatorli
            "yorliq + qiymat" shakli bu yerda og'irlik qiladi. Shuning uchun
            bir qatorli, qidiruv maydoniga o'xshash `outline` tugma. */}
        <SidebarMenuButton
          variant="outline"
          tooltip="Qidirish (Ctrl+K)"
          onClick={() => openModal("globalSearch")}
          className="text-muted-foreground"
        >
          <Search size={16} strokeWidth={1.5} />
          <span className="flex-1 truncate text-sm">Qidirish...</span>

          {/* Klaviatura yorlig'i — sidebar yig'ilganda (ikonka holati)
              yashiriladi, aks holda tugmadan toshib ketardi */}
          <kbd className="ml-auto flex shrink-0 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] group-data-[collapsible=icon]:hidden">
            {shortcutLabel}
          </kbd>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default GlobalSearchButton;
