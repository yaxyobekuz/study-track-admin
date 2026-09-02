// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  PILL,
  initialsOf,
  percentText,
  getRateColor,
  TABLE_HEAD_CELL,
  SUBJECT_ROW_LIMIT,
} from "../../data/staffReport.data";

/**
 * "Qaysi fanni kim o'qitadi" — qatorning keng paneli.
 *
 * Bu yerda savol raqamli emas, ismli: rahbarga fanga nechta odam
 * biriktirilgani emas, AYNAN KIM biriktirilgani kerak. Shuning uchun oxirgi
 * ustun sonni takrorlamaydi, ismlarni chiqaradi — aks holda o'quvchi har
 * bir fan uchun fanlar katalogiga qaytib borishga majbur bo'lardi.
 *
 * ⚠️ Ismlar ro'yxati ROL BO'YICHA FILTRLANMAGAN: direktor ham, o'quv ishlari
 * bo'yicha mudir ham fanga biriktirilishi va uni haqiqatan o'qitishi mumkin.
 * Rol shu sababli chipning `title` ida turadi — ekranda ko'rinsa har bir ism
 * ikki qatorga cho'zilib, 23 ta fanlik jadval varaqqa aylanardi, butunlay
 * yashirilsa esa "nega bu yerda direktor turibdi?" degan savol javobsiz
 * qolardi.
 *
 * O'qituvchilar soni FOIZ SHKALASI bilan emas, BORLIK bilan bo'yaladi: bitta
 * o'qituvchi — normal holat, uni sariq yoki qizil qilish yolg'on tashvish
 * bo'lardi. Faqat nol haqiqiy kamchilik, faqat u qizil.
 *
 * O'chirilgan fan ro'yxatda qoladi (unga biriktirilgan odamlar hamon bor),
 * lekin neytral nishon bilan belgilanadi — tepadagi qamrov foizi uni
 * sanamaydi va ikkovi bir ekranda qarama-qarshi gapirmasligi kerak.
 *
 * Qatorlar serverdan o'qituvchilar soni kamayish tartibida keladi va shu
 * tartibda chiziladi. Demak KAMCHILIK bu panelning oxirida qoladi va
 * kesilgan qismga tushishi mumkin — bu ataylab: o'qituvchisiz fanlar
 * payload'da alohida `uncovered` ro'yxati bo'lib keladi va nomma-nom
 * ko'rsatiladi, bu panel esa manzarani beradi.
 *
 * Ichki skroll YO'Q: sahifaning o'zi skrollanadi, panel ichidagi ikkinchi
 * skroll esa sichqoncha g'ildiragini ushlab qoladigan tuzoq (shu bo'limda
 * bir marta rad etilgan naqsh). Shuning uchun qatorlar soni cheklanadi va
 * qolgani jadval ostida bitta so'nik satr bilan aytiladi.
 *
 * @param {object} props
 * @param {object} props.subjects - fanlar kesimi (`/users/reports` payload'idan)
 */
const StaffSubjectsCard = ({ subjects, className = "" }) => {
  const all = subjects.bySubject ?? [];
  const rows = all.slice(0, SUBJECT_ROW_LIMIT);
  const restCount = all.length - rows.length;

  return (
    <ReportPanelCard
      className={className}
      title="Fanlar bo'yicha o'qituvchilar"
      hint="Har bir fanga biriktirilgan xodimlar"
      action={
        <span className={cn(PILL, getRateColor(subjects.coveragePercent))}>
          Qamrov: {percentText(subjects.coveragePercent)}
        </span>
      }
      isEmpty={!all.length}
      emptyText="Fan katalogi bo'sh"
    >
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-100">
          {/* `min-w-full` — global uslub jadvalga qat'iy eng kam kenglik beradi */}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={TABLE_HEAD_CELL}>Fan</th>
                <th className={cn(TABLE_HEAD_CELL, "text-right")}>
                  O&apos;qituvchilar
                </th>
                <th className={cn(TABLE_HEAD_CELL, "w-full")}>Kim</th>
              </tr>
            </thead>

            {/* `divide-*` global `tbody` qoidasi bilan BIR XIL selektor
                shaklida chiqadi va sinflari ko'proq bo'lgani uchun yengadi.
                Qatorga qo'yilgan `border-gray-100` esa unga kuchi yetmay,
                2-qatordan pastda kulrang-200 bo'lib qolardi. */}
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr
                  key={row.subjectId}
                  // `last:bg-white` — global uslub oxirgi qatorni kulrang qilib qo'yadi
                  className="last:bg-white"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-words font-medium text-gray-900">
                        {row.name}
                      </span>

                      {!row.isActive && (
                        <span
                          className={cn(PILL, "bg-slate-100 text-slate-500")}
                        >
                          O&apos;chirilgan
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {/* Nol o'qituvchi faqat AMALDAGI fanda kamchilik.
                        O'chirilgan fanni qizil qilish qamrov foizi bilan
                        qarama-qarshi gapirardi: u bunday fanni sanamaydi. */}
                    {row.teacherCount ? (
                      <span className="font-semibold text-gray-900">
                        {row.teacherCount} ta
                      </span>
                    ) : (
                      <span
                        className={cn(
                          PILL,
                          row.isActive
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        Yo&apos;q
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {row.teachers?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {row.teachers.map((teacher) => (
                          <span
                            key={teacher.userId}
                            // Rol chipni kengaytirmasdan ochiladi
                            title={`${teacher.name} — ${teacher.roleLabel}`}
                            className={cn(
                              PILL,
                              "gap-1.5 bg-gray-50 font-normal text-gray-600",
                            )}
                          >
                            <span className="flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-gray-500">
                              {initialsOf(teacher.name)}
                            </span>

                            <span className="break-words">{teacher.name}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {restCount > 0 && (
          <p className="text-xs text-gray-400">Yana {restCount} ta fan</p>
        )}
      </div>
    </ReportPanelCard>
  );
};

export default StaffSubjectsCard;
