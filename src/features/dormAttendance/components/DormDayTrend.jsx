// Components
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * "KUNLAR BO'YICHA" — sinfda qaysi kuni nechta o'quvchi qolgan.
 *
 * ⚠️ SANA TO'LIQ YOZILADI ("25-oktabr, 2026"), qisqartirilmaydi: tizimda
 * sana bitta ko'rinishda bo'ladi va qisqa variant yo'q (`dates.md` §1).
 * Shuning uchun kunlar GORIZONTAL lenta emas, qatorlar — matn sig'adi va
 * ustunlar bir-biri bilan solishtiriladi.
 *
 * ⚠️ DAVOMAT OLINMAGAN KUN ro'yxatda TURADI va shunday deb belgilanadi:
 * bo'sh qator "hamma ketib qolgan" deb o'qilardi, holbuki o'sha kuni
 * umuman hech kim belgilanmagan.
 *
 * Qator bosilsa — o'sha kunning ro'yxati ochiladi.
 *
 * @param {object} props
 * @param {Array} props.days - serverdagi `trend` (eskidan yangiga)
 * @param {string} props.selected - joriy kun ("YYYY-MM-DD")
 * @param {(date: string) => void} props.onSelect
 */
const DormDayTrend = ({ days = [], selected, onSelect }) => {
  if (days.length === 0) return null;

  // Yangisi yuqorida: odam oxirgi kunlarni birinchi ko'radi
  const rows = [...days].reverse();

  const columns = [
    { key: "date", label: "Sana" },
    { key: "present", label: "Qoldi", align: "right", className: "w-24" },
    { key: "absent", label: "Kelmadi", align: "right", className: "w-24" },
    { key: "excused", label: "Sababli", align: "right", className: "w-24" },
    { key: "unmarked", label: "Belgilanmagan", align: "right", className: "w-32" },
  ];

  return (
    <Table columns={columns}>
      {rows.map((day) => (
        <Tr
          key={day.date}
          onClick={() => onSelect(day.date)}
          className={cn(
            "cursor-pointer hover:bg-gray-50",
            day.date === selected && "bg-blue-50 hover:bg-blue-50",
          )}
        >
          <Td>
            <span className="font-medium text-gray-900">{day.dateLabel}</span>
            {!day.tracked && (
              <span className="ml-2 text-xs text-gray-400">davomat olinmagan</span>
            )}
          </Td>
          <Td align="right" className={cn("font-medium", day.present > 0 ? "text-green-700" : "text-gray-300")}>
            {day.present}
          </Td>
          <Td align="right" className={cn(day.absent > 0 ? "text-red-700" : "text-gray-300")}>
            {day.absent}
          </Td>
          <Td align="right" className={cn(day.excused > 0 ? "text-blue-700" : "text-gray-300")}>
            {day.excused}
          </Td>
          <Td align="right" className="text-gray-500">
            {day.unmarked}
          </Td>
        </Tr>
      ))}
    </Table>
  );
};

export default DormDayTrend;
