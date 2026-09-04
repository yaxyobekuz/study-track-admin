// Router
import { Navigate } from "react-router-dom";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { INVENTORY_TABS } from "../data/inventory.data";

/**
 * `/inventory` — ruxsati bor BIRINCHI tabga yo'naltiradi.
 *
 * Qat'iy `/inventory/overview` bo'lsa, faqat kunlik hisobot yuboradigan
 * xodim (`monitoring.*`) "Umumiy" ga tushib, u yerdan bosh sahifaga
 * qaytarilardi. Birorta tabga ham ruxsat bo'lmasa — bosh sahifa.
 */
const InventoryIndex = () => {
  const { can } = usePermissions();
  const first = INVENTORY_TABS.find((tab) => !tab.can || can(tab.can));

  return <Navigate to={first?.to ?? "/"} replace />;
};

export default InventoryIndex;
