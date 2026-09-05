// Router
import { Navigate } from "react-router-dom";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { MAIN_TABS } from "../data/financeTabs.data";

/**
 * `/finance/main` — ruxsati bor BIRINCHI tabga yo'naltiradi.
 *
 * Birinchi tab endi rahbar dashboardi (`reports.view`), lekin kassirda u
 * ruxsat bo'lmasligi mumkin. Qat'iy `/finance/main/dashboard` qo'yilsa,
 * kassir har safar "Ruxsat yo'q" ekraniga tushardi.
 *
 * `InventoryIndex` bilan bir xil naqsh.
 */
const FinanceIndex = () => {
  const { can } = usePermissions();
  const first = MAIN_TABS.find((tab) => !tab.can || can(tab.can));

  return <Navigate to={first?.to ?? "/"} replace />;
};

export default FinanceIndex;
