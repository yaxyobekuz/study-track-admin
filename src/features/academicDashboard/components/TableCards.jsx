// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "@/shared/components/dashboard/MiniTable";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { formatByUnit, gradeTone, percentTone } from "../data/academicDashboard.data";

/**
 * SINFLAR BO'YICHA NATIJA.
 *
 * ⚠️ Oxirgi qator — JAMI/O'RTACHA va u serverdagi KPI kartasi bilan AYNAN
 * bir xil manbadan olinadi (`data.kpi`), jadval ustunlarini qo'shib
 * chiqarilmaydi: sinfsiz qo'yilgan baho jadvalga tushmaydi-yu, KPI ga
 * tushadi — ikkalasi qo'lda hisoblanganda ular bir-biriga to'g'ri
 * kelmasdi.
 */
export const ClassesCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.classes ?? [];

  return (
    <DashboardCard
      title="Sinflar bo'yicha natija"
      hint={data ? `${data.monthLabel} · o'quvchi, baho va davomat` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Sinf ma'lumoti yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "Sinf" },
          { label: "O'quvchi", align: "right" },
          { label: "O'rtacha baho", align: "right" },
          { label: "Davomat", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.classId}>
            <MiniTd className="font-medium text-gray-700">{row.name}</MiniTd>
            <MiniTd align="right" className="text-gray-600">
              {formatByUnit(row.studentCount, "count")}
            </MiniTd>
            <MiniTd align="right" className={cn("font-semibold", gradeTone(row.average))}>
              {formatByUnit(row.average, "grade")}
            </MiniTd>
            <MiniTd align="right" className={cn("font-semibold", percentTone(row.attendanceRate))}>
              {formatByUnit(row.attendanceRate, "percent")}
            </MiniTd>
          </MiniTr>
        ))}

        {data?.kpi && (
          <MiniTr className="border-t-2 border-gray-200">
            <MiniTd className="font-semibold text-gray-900">Jami / O'rtacha</MiniTd>
            <MiniTd align="right" className="font-semibold text-gray-900">
              {formatByUnit(data.kpi.students?.value, "count")}
            </MiniTd>
            <MiniTd align="right" className="font-semibold text-gray-900">
              {formatByUnit(data.kpi.averageGrade?.value, "grade")}
            </MiniTd>
            <MiniTd align="right" className="font-semibold text-gray-900">
              {formatByUnit(data.kpi.attendanceRate?.value, "percent")}
            </MiniTd>
          </MiniTr>
        )}
      </MiniTable>
    </DashboardCard>
  );
};

/**
 * SINF DARAJALARI KESIMI — 1-4, 5-6, 7-8, 9-11.
 *
 * ⚠️ Daraja sinf NOMIDAN olinadi ("9-A" → 9): `Class` da bosqich ustuni
 * yo'q. Raqami o'qilmagan sinf "Boshqa sinflar" qatoriga tushadi va
 * jimgina yo'qolib ketmaydi.
 */
export const LevelsCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.levels ?? [];

  return (
    <DashboardCard
      title="Sinf darajalari kesimi"
      hint="Bosqichlar bo'yicha yig'ma natija"
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Daraja ma'lumoti yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "Bosqich" },
          { label: "O'quvchi", align: "right" },
          { label: "O'rtacha baho", align: "right" },
          { label: "Davomat", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.key}>
            <MiniTd className="font-medium text-gray-700">{row.label}</MiniTd>
            <MiniTd align="right" className="text-gray-600">
              {formatByUnit(row.studentCount, "count")}
            </MiniTd>
            <MiniTd align="right" className={cn("font-semibold", gradeTone(row.average))}>
              {formatByUnit(row.average, "grade")}
            </MiniTd>
            <MiniTd align="right" className={cn("font-semibold", percentTone(row.attendanceRate))}>
              {formatByUnit(row.attendanceRate, "percent")}
            </MiniTd>
          </MiniTr>
        ))}
      </MiniTable>
    </DashboardCard>
  );
};

/**
 * FANLAR BO'YICHA ENG YAXSHI O'QUVCHI.
 *
 * ⚠️ Har fandan BITTA o'quvchi. Bitta fandan besh o'quvchi chiqsa, jadval
 * "eng kuchli sinf" ro'yxatiga aylanib qolardi.
 *
 * ⚠️ Ro'yxatga kamida uchta bahosi bor o'quvchi tushadi: bittagina "5"
 * olgan o'quvchi o'rtachasi 5.00 bilan boshiga chiqib, butun jadvalni
 * ishonchsiz qilardi.
 */
export const TopStudentsCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.topStudents ?? [];

  return (
    <DashboardCard
      title="Fanlar bo'yicha top o'quvchi"
      hint="Har fanning eng yuqori o'rtachasi · kamida 3 ta baho"
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Yetarli baho yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "Fan" },
          { label: "O'quvchi" },
          { label: "Sinf" },
          { label: "O'rtacha", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.subjectId}>
            <MiniTd className="font-medium text-gray-700">{row.subjectName}</MiniTd>
            <MiniTd className="text-gray-600">{row.studentName}</MiniTd>
            <MiniTd className="text-gray-500">{row.className}</MiniTd>
            <MiniTd align="right" className={cn("font-semibold", gradeTone(row.average))}>
              {formatByUnit(row.average, "grade")}
            </MiniTd>
          </MiniTr>
        ))}
      </MiniTable>
    </DashboardCard>
  );
};

/**
 * O'QITUVCHILAR SAMARADORLIGI (KPI).
 *
 * Uch ustundan bitta ball: o'rtacha baho (0.5), o'z davomati (0.3),
 * topshiriq intizomi (0.2).
 *
 * ⚠️ Yo'q ustun NOL SANALMAYDI — u ballni pastga tortib, davomati
 * yuritilmagan o'qituvchini "yomon ishlagan" qilib ko'rsatardi. Server
 * mavjud ustunlarni qayta normallashtiradi.
 *
 * ⚠️ "O'rtacha baho" ustuni — o'qituvchi qanchalik yaxshi baho qo'yishi
 * EMAS, uning darsidagi natija. Shuning uchun u yagona ko'rsatkich
 * sifatida ishlatilmaydi.
 */
export const TeachersCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.teachers ?? [];

  return (
    <DashboardCard
      title="O'qituvchilar samaradorligi (KPI)"
      hint="Baho 50% · davomat 30% · topshiriq 20%"
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda baho qo'yilmagan"
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "O'qituvchi" },
          { label: "Fan" },
          { label: "O'rtacha baho", align: "right" },
          { label: "Davomat", align: "right" },
          { label: "Topshiriq", align: "right" },
          { label: "KPI ball", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.teacherId}>
            <MiniTd className="font-medium text-gray-700">
              <span className="flex items-center gap-1.5">
                {row.name}
                {/* Arxivlangan xodim jadvalda qoladi — uning o'tgan oydagi
                    ishi yo'qolib ketmasligi kerak, lekin belgisi bo'lsin */}
                {row.isArchived && (
                  <span className="rounded bg-gray-100 px-1 text-[9px] font-medium text-gray-500">
                    arxiv
                  </span>
                )}
              </span>
            </MiniTd>
            <MiniTd className="max-w-40 truncate text-gray-500" title={row.subjectNames.join(", ")}>
              {row.subjectNames.join(", ") || "—"}
            </MiniTd>
            <MiniTd align="right" className={cn("font-semibold", gradeTone(row.averageGrade))}>
              {formatByUnit(row.averageGrade, "grade")}
            </MiniTd>
            <MiniTd align="right" className={cn(percentTone(row.attendanceRate))}>
              {formatByUnit(row.attendanceRate, "percent")}
            </MiniTd>
            <MiniTd align="right" className={cn(percentTone(row.taskRate))}>
              {formatByUnit(row.taskRate, "percent")}
            </MiniTd>
            <MiniTd align="right" className={cn("font-bold", percentTone(row.score))}>
              {formatByUnit(row.score, "percent")}
            </MiniTd>
          </MiniTr>
        ))}
      </MiniTable>
    </DashboardCard>
  );
};
