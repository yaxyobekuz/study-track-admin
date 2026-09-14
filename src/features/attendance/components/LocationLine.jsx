// Data
import { locationSummary, formatDistance } from "../data/attendance.data";

/**
 * Tultipdagi bitta qator: joylashuv holati va ofisgacha masofa.
 *
 * ⚠️ Ilgari bu yerda faqat "Ofisdan tashqarida" turardi va u ikki xil
 * holatni yashirardi: chin buzilish ham, GPS umuman berilmagani ham.
 * Masofasiz esa "12 m narida" bilan "5 km narida" ni farqlab bo'lmasdi.
 *
 * @param {object} props
 * @param {object} props.record - davomat yozuvi
 */
const LocationLine = ({ record }) => {
  const summary = locationSummary(record);
  if (!summary) return null;

  return (
    <p className={summary.severe ? "text-red-300" : "text-yellow-300"}>
      {summary.label}
      {summary.distance !== null && ` · ${formatDistance(summary.distance)}`}
    </p>
  );
};

export default LocationLine;
