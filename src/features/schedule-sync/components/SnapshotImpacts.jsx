// Components
import {
  DroppedLessons,
  PayrollImpact,
  RemovedClasses,
  SubstitutionImpact,
  TodayImpact,
} from "./ImpactPanels";

/**
 * Versiyani tiklash ta'siri — "Versiyalar" tafsiloti va platformaga
 * qaytish oynasi uchun BITTA ro'yxat (ikki joyda ikki xil narsa
 * ko'rinmasligi uchun).
 *
 * Tiklanmaydigan darslar — shartnomadagi maydon. Qolgan ta'sirlar
 * (sinf olib tashlanishi, bugungi darslar, soatbay oylik, o'rinbosarlik)
 * server bersa chiziladi: butun maktab jadvali almashadi va ular
 * sheet'dan qo'llashdagi kabi ko'rinib turishi kerak.
 *
 * @param {object} props
 * @param {object} props.view - `SnapshotReview`
 * @param {string} [props.cardClassName] - jadvalli kartalar uchun (oynada chegara)
 */
const SnapshotImpacts = ({ view, cardClassName = "" }) => (
  <>
    <DroppedLessons items={view.droppedLessons ?? []} />
    <RemovedClasses items={view.removedClasses ?? []} />
    <TodayImpact impact={view.todayImpact} />
    <PayrollImpact rows={view.payrollImpact ?? []} className={cardClassName} />
    <SubstitutionImpact
      rows={view.substitutionImpact ?? []}
      className={cardClassName}
    />
  </>
);

export default SnapshotImpacts;
