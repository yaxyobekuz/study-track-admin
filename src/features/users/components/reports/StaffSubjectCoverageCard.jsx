// Components
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  PILL,
  TONE_STYLES,
  initialsOf,
  STAT_CELL_TONES,
  PANEL_ROW_LIMIT,
  SUBJECT_STAT_CELLS,
} from "../../data/staffReport.data";

/**
 * Fan qamrovi — qatorning tor paneli: "qayerda teshik bor va kim bir o'zi
 * bir nechta fanni tortib yuribdi".
 *
 * Yonidagi keng panel "qaysi fanni kim o'qitadi" degan savolga javob beradi,
 * bu esa uning teskarisi. Rahbarga ro'yxatning o'zi emas, undagi YO'QLIK
 * kerak: qamrov foizi yaxshi ko'rinib turganda ham bitta o'qituvchisiz fan
 * dars jadvalini buzadi. Shuning uchun panelning markazida diagramma emas,
 * ikkita qisqa bo'shliq ro'yxati turadi.
 *
 * ⚠️ Bo'sh ro'yxat ham chiziladi. Bugungi bazada bo'shliq yo'q, ya'ni BO'SH
 * holat — odatiy holat, nosozlik emas. Bo'limni shunchaki chizmasak,
 * o'quvchi "tekshirilmadi" bilan "tekshirildi, hammasi joyida" ni farqlay
 * olmasdi: sarlavha o'z o'rnida qoladi, pastida esa yashil tasdiq paydo
 * bo'ladi.
 *
 * ⚠️ Ikki ro'yxatning doirasi ATAYLAB har xil va UI buni "tuzatmaydi":
 * "o'qituvchisiz fanlar" faqat amaldagi fanlarni sanaydi (o'chirilgan fan
 * o'quv rejasida yo'q, uning bo'sh turgani kamchilik emas), "fansiz
 * o'qituvchilar" esa faqat `role === "teacher"` ni — fansiz farrosh yoki
 * hisobchi bo'shliq emas. Arxivlangan xodim ikkala tomonda ham yo'q:
 * arxivdagi o'qituvchi fanni qoplamaydi.
 *
 * Server "fansiz o'qituvchilar" ro'yxatini o'ntada kesadi, katakdagi son esa
 * haqiqiy: farq bo'lsa oxiriga "yana N ta" nishoni qo'shiladi, aks holda
 * ro'yxat jimgina qisqarib, bo'shliq bor-yo'g'idan kichik ko'rinardi.
 *
 * O'rtachalar foiz emas, NISBAT — shuning uchun ular `percentText` dan
 * o'tmaydi va yoniga "%" qo'yilmaydi; o'lchanmagani (`null`) chiziqcha bo'lib
 * chiqadi, nol emas.
 *
 * @param {object} props
 * @param {object} props.subjects - fan qamrovi kesimi (`/users/reports` payload'idan)
 */
const StaffSubjectCoverageCard = ({ subjects }) => {
  const uncovered = subjects.uncovered ?? [];
  const unassigned = subjects.unassignedTeachers ?? [];
  const allMulti = subjects.multiSubject ?? [];
  const multiSubject = allMulti.slice(0, PANEL_ROW_LIMIT);
  // Ikki bosqichli qisqarish: server 10 tada kesadi, panel yana 5 tada.
  // Jami sonni serverdan olamiz, aks holda "ana shular" degan yolg'on
  // taassurot qolardi (yonidagi ro'yxat allaqachon shunday qiladi).
  const hiddenMulti = Math.max(
    (subjects.multiSubjectTotal ?? allMulti.length) - multiSubject.length,
    0,
  );

  // Fanlar ro'yxati to'liq keladi — bo'shligini massivning o'zidan bilsa
  // bo'ladi. O'qituvchilar ro'yxati esa kesilgan, shuning uchun u yerda
  // hukmni SON chiqaradi: ro'yxat qisqarganda ham "hammasi joyida" deb
  // yozib yubormaslik uchun.
  const teacherGap = subjects.teachersWithoutSubject ?? 0;
  const hasTeacherGap = teacherGap > 0 || unassigned.length > 0;
  const hiddenTeachers = Math.max(teacherGap - unassigned.length, 0);

  return (
    <ReportPanelCard
      title="Fan qamrovi"
      hint="Fan biriktirish bo'yicha bo'shliqlar"
      /* Qo'shni panel bilan bir xil fakt: `totalSubjects` faqat AMALDAGI
         fanlarni sanaydi, ya'ni hammasi o'chirilgan katalogda bu panel
         "bo'sh" deb turgan bo'lardi — yonidagi jadval esa to'la. Bundan
         tashqari bo'sh holat fansiz o'qituvchilar ro'yxatini ham yutib
         yuborardi, holbuki aynan o'shanda u eng kerak. */
      isEmpty={!(subjects.bySubject?.length || subjects.teachersWithoutSubject)}
      emptyText="Fan katalogi bo'sh"
    >
      <div className="space-y-4">
        {/* Qamrovning to'rt raqami: bori, yopilgani va ikki tomondagi bo'shliq */}
        <div className="grid grid-cols-2 gap-3">
          {SUBJECT_STAT_CELLS.map((cell) => (
            <div
              key={cell.key}
              className={cn(
                "rounded-xl px-3 py-2.5 text-center",
                STAT_CELL_TONES[cell.tone],
              )}
            >
              <p className="text-xl font-bold">{subjects[cell.key] ?? "—"}</p>
              <p className="break-words text-[11px]">{cell.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500">
          Fanga o&apos;rtacha{" "}
          <span className="font-medium text-gray-900">
            {subjects.avgTeachersPerSubject ?? "—"}
          </span>{" "}
          o&apos;qituvchi · O&apos;qituvchiga o&apos;rtacha{" "}
          <span className="font-medium text-gray-900">
            {subjects.avgSubjectsPerTeacher ?? "—"}
          </span>{" "}
          fan
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500">O&apos;qituvchisiz fanlar</p>

            {uncovered.length === 0 ? (
              <p className="text-xs text-emerald-600">
                Barcha fanlarga o&apos;qituvchi biriktirilgan
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {uncovered.map((subject) => (
                  <span
                    key={subject.subjectId}
                    className={cn(PILL, TONE_STYLES.bad)}
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-gray-500">Fansiz o&apos;qituvchilar</p>

            {!hasTeacherGap ? (
              <p className="text-xs text-emerald-600">
                Barcha o&apos;qituvchilarga fan biriktirilgan
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {unassigned.map((teacher) => (
                  <span
                    key={teacher.userId}
                    className={cn(PILL, TONE_STYLES.warn)}
                  >
                    {teacher.name}
                  </span>
                ))}

                {hiddenTeachers > 0 && (
                  <span className={cn(PILL, "bg-gray-100 text-gray-500")}>
                    yana {hiddenTeachers} ta
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bo'shliq ro'yxatlaridan farqli o'laroq, bu bo'lim bo'sh bo'lsa
            butunlay yashiriladi: "hech kim ikkita fan o'qitmaydi" — aytishga
            arzimaydigan, hech kimni harakatga chorlamaydigan holat. */}
        {multiSubject.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Ko&apos;p fanli o&apos;qituvchilar
            </p>

            {multiSubject.map((row) => {
              const subjectNames = (row.subjects ?? []).join(" · ");

              return (
                <div key={row.userId} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {initialsOf(row.name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {row.name}
                    </p>

                    {/* Fanlar bir qatorga sig'maydi — to'liq ro'yxat `title` da */}
                    <p
                      className="truncate text-xs text-gray-500"
                      title={subjectNames}
                    >
                      {subjectNames}
                    </p>
                  </div>

                  <span
                    className={cn(PILL, "shrink-0 bg-blue-50 text-blue-600")}
                  >
                    {row.subjectCount} fan
                  </span>
                </div>
              );
            })}

            {hiddenMulti > 0 && (
              <p className="text-xs text-gray-400">
                Yana {hiddenMulti} ta o&apos;qituvchi
              </p>
            )}
          </div>
        )}
      </div>
    </ReportPanelCard>
  );
};

export default StaffSubjectCoverageCard;
