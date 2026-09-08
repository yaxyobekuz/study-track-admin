// Router
import { Navigate } from "react-router-dom";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { HOURS_TABS } from "../data/lessonHours.data";

/**
 * `/lesson-hours` — ruxsati bor BIRINCHI tabga yo'naltiradi.
 *
 * ⚠️ Qat'iy manzil qo'yilsa, faqat `substitutions.view` ruxsati bor
 * mas'ul xodim har safar "Ruxsat yo'q" ekraniga tushardi
 * (`FinanceIndex` bilan bir xil naqsh).
 */
const LessonHoursIndex = () => {
  const { can } = usePermissions();
  const first = HOURS_TABS.find((tab) => !tab.can || can(tab.can));

  return <Navigate to={first?.to ?? "/"} replace />;
};

export default LessonHoursIndex;
