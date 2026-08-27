// Components
import PeriodsEditor from "../components/PeriodsEditor";

/**
 * Dars jadvali sozlamalari — hozircha faqat dars soatlari.
 *
 * Tahrirlagichning o'zi alohida komponentda: aynan shu ro'yxat
 * "Dars jadvalini rejalashtirish → Sozlamalar" tabida ham chiziladi va
 * ikkinchi nusxa yozilishi kerak emas.
 */
const ScheduleSettingsPage = () => (
  <div className="space-y-4">
    <h1 className="page-title">Dars jadvali sozlamalari</h1>
    <PeriodsEditor />
  </div>
);

export default ScheduleSettingsPage;
