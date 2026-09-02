// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import {
  PILL,
  TABLE_HEAD_CELL,
  initialsOf,
  percentText,
  getRateColor,
  formatTenure,
} from "../../data/staffReport.data";

/**
 * Sahifaning eng pastki, to'liq enli jadvali: eng uzoq ishlab kelayotgan
 * xodimlar.
 *
 * Staj tizimga kiritilgan sanadan hisoblanadi — bazada boshqa "ishga kirgan
 * kun" maydoni yo'q, shuning uchun tizimdan oldin ishlaganlarning muddati
 * haqiqiysidan qisqa chiqadi. Sarlavha ostidagi izoh aynan shuning uchun bor.
 *
 * Jadval qo'lda yozilgan, umumiy `Table` komponentida emas: global uslublar
 * har qanday `thead` ni to'q ko'k qilib bo'yaydi, bu yerda esa panel ichida
 * yotadigan yengil kulrang sarlavha kerak. Shu sababli qatorlarda ham global
 * qoidani bosib o'tadigan sinflar turibdi.
 *
 * Davomat ustuni faqat ma'lumot bo'lganda chiziladi: davomat ruxsati yo'q
 * ko'ruvchida barcha qiymat `null` bo'ladi va butun ustun chiziqchadan iborat
 * bo'lib qolardi.
 *
 * @param {object} props
 * @param {Array} props.tenure
 */
const StaffTenureTable = ({ tenure = [] }) => {
  const showAttendance = tenure.some((row) => row.attendancePercent != null);

  return (
    <ReportPanelCard
      title="Eng tajribali xodimlar"
      hint="Tizimga kiritilgan sana bo'yicha"
      isEmpty={!tenure.length}
    >
      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className={TABLE_HEAD_CELL}>Xodim</th>
              <th className={TABLE_HEAD_CELL}>Rol</th>
              <th className={TABLE_HEAD_CELL}>Ishga qabul qilingan</th>
              <th className={TABLE_HEAD_CELL}>Faoliyat muddati</th>
              {showAttendance && <th className={TABLE_HEAD_CELL}>Davomat</th>}
            </tr>
          </thead>

          {/* `divide-*` global `tbody` qoidasi bilan bir xil selektor
              shaklida chiqadi va uni sinf soni bo'yicha yengadi; qatorga
              qo'yilgan `border-gray-100` esa unga kuchi yetmasdi */}
          <tbody className="divide-y divide-gray-100">
            {tenure.map((row) => (
              <tr
                key={row.userId}
                // `last:bg-white` — global uslub oxirgi qatorni kulrang qilib qo'yadi
                className="last:bg-white"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {initialsOf(row.name)}
                    </span>

                    <span className="whitespace-nowrap font-medium text-gray-900">
                      {row.name}
                    </span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                  {row.roleLabel}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatDateUz(row.joinedAt)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatTenure(row.months)}
                </td>

                {showAttendance && (
                  <td className="px-4 py-3">
                    <span
                      className={cn(PILL, getRateColor(row.attendancePercent))}
                    >
                      {percentText(row.attendancePercent)}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportPanelCard>
  );
};

export default StaffTenureTable;
