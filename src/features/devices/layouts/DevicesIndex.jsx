// Router
import { Navigate } from "react-router-dom";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { DEVICE_TABS } from "../data/devices.data";

/**
 * `/devices` — ruxsati bor BIRINCHI tabga yo'naltiradi.
 *
 * ⚠️ Qat'iy manzil qo'yilsa, faqat `devices.apps` ruxsati bor xodim har
 * safar "Ruxsat yo'q" ekraniga tushardi (`FinanceIndex` va
 * `LessonHoursIndex` bilan bir xil naqsh).
 */
const DevicesIndex = () => {
  const { can } = usePermissions();
  const first = DEVICE_TABS.find((tab) => !tab.can || can(tab.can));

  return <Navigate to={first?.to ?? "/"} replace />;
};

export default DevicesIndex;
