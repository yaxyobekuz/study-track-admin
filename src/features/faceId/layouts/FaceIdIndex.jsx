// Router
import { Navigate } from "react-router-dom";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { FACE_ID_TABS } from "../data/faceId.data";

/**
 * `/face-id` — ruxsati bor BIRINCHI tabga yo'naltiradi.
 *
 * ⚠️ Qat'iy manzil qo'yilsa, faqat `faceId.events` ruxsati bor xodim
 * har safar "Ruxsat yo'q" ekraniga tushardi (`DevicesIndex` bilan
 * bir xil naqsh).
 */
const FaceIdIndex = () => {
  const { can } = usePermissions();
  const first = FACE_ID_TABS.find((tab) => !tab.can || can(tab.can));

  return <Navigate to={first?.to ?? "/"} replace />;
};

export default FaceIdIndex;
