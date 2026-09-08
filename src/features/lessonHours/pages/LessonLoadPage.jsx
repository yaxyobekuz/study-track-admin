// Components
import LedgerGround from "../components/LedgerGround";
import LessonHoursOverviewPage from "./LessonHoursOverviewPage";

/**
 * BOSH SAHIFADAGI "DARS SOATLARI" TABI.
 *
 * ⚠️ IKKINCHI KIRISH NUQTASI, IKKINCHI EKRAN EMAS. Bu — bo'limdagi
 * "Ko'rsatkichlar" sahifasining AYNAN o'zi. Moliya ("/reports" va
 * "/finance/main/dashboard") va inventar bilan bir xil naqsh: rahbar bosh
 * sahifadan chiqmasdan ko'radi, moliyachi esa o'z bo'limida topadi.
 *
 * Bir xil raqamni ikki xil ko'rinishda ko'rsatish ishonchni yo'qotardi,
 * shuning uchun bu yerda faqat ZAMIN qo'shiladi: bo'lim ichida uni
 * `LessonHoursLayout` beradi, bu yerda esa layout umuman ishtirok
 * etmaydi.
 *
 * ⚠️ `bleed="bottom"` — yuqorida tablar qatori turadi va u zamindan
 * TASHQARIDA. Yuqori chet ham cho'zilsa, kulrang sirt tablarning tagiga
 * surilib, ular "havoda osilgan" bo'lib qolardi.
 */
const LessonLoadPage = () => (
  <LedgerGround bleed="bottom">
    <LessonHoursOverviewPage />
  </LedgerGround>
);

export default LessonLoadPage;
