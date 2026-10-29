// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";
import { PHONE_PAIR_LABEL, phonePairLines } from "@/shared/utils/phone.utils";

// Data
import {
  docPercentText,
  pointsText,
  signedText,
  toneOfChange,
} from "@/shared/data/dashboardPeriods.data";
import { countText, minutesText } from "../data/attendanceStats.data";

/**
 * DAVOMAT HISOBOTI — HUJJAT KO'RINISHI (o'quvchilar va o'qituvchilar).
 *
 * ⚠️ BU EKRANDAGI WORD HUJJATINING O'ZI: bo'limlar, raqamlash va
 * jadvallar `attendanceStatsExport.service.js` dagi `.docx` bilan BIR XIL
 * tartibda. Foydalanuvchi "Word'da yuklab olish" ni bossa, aynan ko'rib
 * turgan hujjatni oladi — boshqacha bo'lsa, yuklab olingan fayl
 * "noto'g'ri" bo'lib ko'rinardi (`MovementDocument` va `SystemsDocument`
 * bilan AYNI doktrina).
 *
 * ⚠️ RAQAM BU YERDA HISOBLANMAYDI. Hammasi serverdan keladi
 * (`attendanceStats.service.js`): panel foizni o'zi hisoblasa, u Word
 * fayli bilan asta-sekin uzoqlashardi.
 *
 * ⚠️ IKKI TUR, BITTA KOMPONENT (`report.kind`). Hujjatning yarmi —
 * umumiy ko'rsatkichlar, taqqoslash, dinamika, hafta kunlari va filiallar
 * kesimi — ikkalasida ham AYNI: ikki komponent bo'lsa, ular asta-sekin
 * uzoqlashardi.
 *
 * A4 o'lchovi (210 mm) ataylab: hujjat chop etilganda ham, Word'da
 * ochilganda ham bir xil ko'rinishi kerak.
 */

/**
 * ⚠️ `breakBefore` — CHOP ETISHDA yangi sahifadan. Word nusxasida ham
 * AYNI bo'lim yangi sahifadan boshlanadi (`pageBreakBefore`).
 */
const Section = ({ title, children, breakBefore = false }) => (
  <section
    className={cn("mt-7 first:mt-0", breakBefore && "print:break-before-page")}
  >
    <h2 className="mb-2 text-[12pt] font-bold text-gray-900">{title}</h2>
    {children}
  </section>
);

const Note = ({ children }) => (
  <p className="mb-2 text-[9pt] leading-relaxed text-gray-500">{children}</p>
);

/**
 * Word jadvali bilan AYNI ko'rinish: chegaralar, kulrang sarlavha.
 *
 * ⚠️ GLOBAL `<table>` USLUBLARI BU YERDA O'CHIRILADI: `styles/index.css`
 * har jadvalga ko'k sarlavha, OQ KATTA HARFLAR va `min-w-[934px]`
 * majburlaydi — hujjatda esa sarlavha Word fayli bilan bir xil bo'lishi
 * shart (`SystemsDocument` dagi AYNI sabab).
 */
const DocTable = ({ columns, children, minWidth = "520px" }) => (
  <div className="-mx-1 overflow-x-auto px-1">
    <table
      className="w-full border-collapse text-[9.5pt]"
      style={{ minWidth }}
    >
      <thead className="bg-transparent">
        <Tr>
          {columns.map((col) => (
            <th
              key={col.label}
              className={cn(
                "border border-gray-300 bg-gray-100 px-2 py-1.5 text-[9.5pt] font-bold normal-case text-gray-900",
                col.align === "right" && "text-right",
                col.align === "center" && "text-center",
                !col.align && "text-left",
              )}
              style={col.width ? { width: col.width } : undefined}
            >
              {col.label}
            </th>
          ))}
        </Tr>
      </thead>
      <tbody className="divide-y-0">{children}</tbody>
    </table>
  </div>
);

/** Qator foni ANIQ beriladi — global `last:bg-gray-100` ta'sir qilmasin. */
const Tr = ({ children }) => <tr className="bg-white">{children}</tr>;

const Td = ({ align, className, children }) => (
  <td
    className={cn(
      "border border-gray-300 px-2 py-1 align-middle",
      align === "right" && "text-right tabular-nums",
      align === "center" && "text-center",
      className,
    )}
  >
    {children}
  </td>
);

/**
 * TELEFON KATAGI — ikki qator: o'quvchining o'z raqami, so'ng ota-onasiniki.
 *
 * ⚠️ Word nusxasida AYNI matn bitta katakda `<w:br/>` bilan ikki qator
 * bo'lib chiqadi (`attendanceStatsExport.service.js`). Nega ikkita ustun
 * emasligi — `phone.utils.js` dagi izohda.
 */
const PhoneTd = ({ contact }) => (
  <Td className="whitespace-nowrap text-gray-700">
    {phonePairLines(contact).map((line, i) => (
      <span key={i} className="block tabular-nums">
        {line}
      </span>
    ))}
  </Td>
);

/** Sanoq katagi: nol — kulrang (hech narsa yo'q joy ko'zga tashlanmasin). */
const Count = ({ value, tone, bold = false }) => (
  <Td
    align="right"
    className={cn(value ? tone : "text-gray-400", bold && "font-bold")}
  >
    {countText(value)}
  </Td>
);

const Pct = ({ value, bold = false, tone }) => (
  <Td align="right" className={cn(bold && "font-bold", tone)}>
    {docPercentText(value)}
  </Td>
);

const DASH = <Td align="right" className="text-gray-400">—</Td>;

/* ── 1. Umumiy ko'rsatkichlar ───────────────────────────────────────── */

const SummarySection = ({ report, index }) => {
  const t = report.totals;
  const isStudents = report.kind === "students";
  const share = (value) => (t.expected > 0 ? (value / t.expected) * 100 : null);

  const row = (label, value, tone) => (
    <Tr key={label}>
      <Td>{label}</Td>
      <Count value={value} tone={tone} bold />
      <Pct value={share(value)} tone="text-gray-500" />
    </Tr>
  );

  return (
    <Section title={`${index}. Umumiy ko'rsatkichlar`}>
      <DocTable
        columns={[
          { label: "Ko'rsatkich" },
          { label: "Soni", align: "right", width: "18%" },
          { label: "Ulushi", align: "right", width: "18%" },
        ]}
      >
        <Tr>
          <Td className="font-semibold">O&apos;quv kunlari</Td>
          <Count value={t.schoolDays} bold />
          {DASH}
        </Tr>

        {!isStudents && (
          <Tr>
            <Td className="font-semibold">O&apos;qituvchilar</Td>
            <Count value={report.staffCount} bold />
            {DASH}
          </Tr>
        )}

        <Tr>
          <Td className="font-semibold">
            {isStudents ? "Kutilgan o'quvchi-kunlar" : "Kutilgan ish kunlari"}
          </Td>
          <Count value={t.expected} bold />
          {DASH}
        </Tr>

        {row("Keldi", t.came, "text-emerald-700")}
        {row("shundan kech keldi", t.late, "text-amber-700")}
        {row("Kelmadi (sababsiz)", t.absent, "text-red-700")}
        {row("Sababli", t.excused, "text-amber-700")}
        {row(
          isStudents ? "Belgilanmagan" : "Belgilanmagan (bugun)",
          t.unmarked,
          "text-gray-500",
        )}

        <Tr>
          <Td className="font-semibold">Davomat foizi</Td>
          <Pct value={t.percent} bold tone="text-emerald-700" />
          {DASH}
        </Tr>

        {!isStudents && (
          <>
            <Tr>
              <Td>Jami kechikish</Td>
              <Td align="right" className="text-amber-700">
                {minutesText(t.lateMinutes)}
              </Td>
              {DASH}
            </Tr>
            <Tr>
              <Td>O&apos;rtacha kechikish</Td>
              <Td align="right" className="text-gray-500">
                {minutesText(t.avgLateMinutes)}
              </Td>
              {DASH}
            </Tr>
            {/* ⚠️ "Keldi-ketti": faqat kelish VA ketish vaqti yozilgan kunlar */}
            <Tr>
              <Td>Ishda bo&apos;lgan vaqt</Td>
              <Td align="right">{minutesText(t.workedMinutes)}</Td>
              {DASH}
            </Tr>
            <Tr>
              <Td>Kunlik o&apos;rtacha ({countText(t.timedDays)} kun)</Td>
              <Td align="right" className="text-gray-500">
                {minutesText(t.avgWorkedMinutes)}
              </Td>
              {DASH}
            </Tr>
          </>
        )}
      </DocTable>
    </Section>
  );
};

/* ── Filiallar kesimi ───────────────────────────────────────────────── */

const BranchSection = ({ report, index }) => (
  <Section title={`${index}. Filiallar kesimi`}>
    <Note>
      Foiz har filialning O&apos;Z yig&apos;indisidan hisoblangan, filiallar
      o&apos;rtachasi EMAS. Qator davomat foizi bo&apos;yicha o&apos;sish
      tartibida.
    </Note>

    <DocTable
      columns={[
        { label: "Filial" },
        { label: "Kutilgan", align: "right", width: "13%" },
        { label: "Keldi", align: "right", width: "13%" },
        { label: "Kelmadi", align: "right", width: "13%" },
        { label: "Davomat", align: "right", width: "13%" },
        { label: "Farq", align: "right", width: "15%" },
      ]}
    >
      {report.byBranch.map((row) => (
        <Tr key={row.branchId}>
          <Td className="font-semibold">{row.branchName}</Td>
          <Count value={row.expected} />
          <Count value={row.came} tone="text-emerald-700" />
          <Count value={row.expected - row.came} tone="text-red-700" />
          <Pct value={row.percent} bold />
          <Td align="right" className={toneOfChange(row.percentPoints)}>
            {pointsText(row.percentPoints)}
          </Td>
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Oldingi davr bilan taqqoslash ──────────────────────────────────── */

const CompareSection = ({ report, index, rows }) => (
  <Section title={`${index}. ${report.period.previous.title} bilan taqqoslash`}>
    <Note>
      Joriy davr: {report.period.rangeLabel}. Taqqoslanayotgan davr:{" "}
      {report.period.previous.label}.
    </Note>

    <DocTable
      columns={[
        { label: "Ko'rsatkich" },
        { label: "Joriy", align: "right", width: "16%" },
        { label: report.period.previous.title, align: "right", width: "18%" },
        { label: "Farq", align: "right", width: "18%" },
      ]}
    >
      <Tr>
        <Td className="font-semibold">Davomat foizi</Td>
        <Pct value={report.totals.percent} bold tone="text-emerald-700" />
        <Pct value={report.previous.percent} tone="text-gray-500" />
        <Td
          align="right"
          className={cn("font-bold", toneOfChange(report.change.percentPoints))}
        >
          {pointsText(report.change.percentPoints)}
        </Td>
      </Tr>

      {rows.map((row) => {
        const diff = (row.current ?? 0) - (row.previous ?? 0);

        /**
         * ⚠️ FARQNING RANGI `trend` DAN, sonning ishorasidan EMAS (server
         * bilan AYNI qoida): "sababli kelmaganlar +928" yashil bo'lsa,
         * yomonlashuv yaxshilanish bo'lib ko'rinardi. "O'quv kunlari" esa
         * na yaxshi, na yomon — u davrning uzunligi.
         */
        const tone =
          row.trend === "good"
            ? toneOfChange(diff)
            : row.trend === "bad"
              ? toneOfChange(-diff)
              : "text-gray-400";

        return (
          <Tr key={row.label}>
            <Td className={row.bold ? "font-semibold" : undefined}>{row.label}</Td>
            <Count value={row.current} tone={row.tone} bold={row.bold} />
            <Count value={row.previous} />
            <Td align="right" className={tone}>
              {signedText(diff)}
            </Td>
          </Tr>
        );
      })}
    </DocTable>
  </Section>
);

/* ── Dinamika va hafta kunlari ──────────────────────────────────────── */

const TrendSection = ({ report, index }) => (
  <Section title={`${index}. Dinamika`}>
    <DocTable
      columns={[
        { label: "Davr" },
        { label: "O'quv kunlari", align: "right", width: "15%" },
        { label: "Kutilgan", align: "right", width: "15%" },
        { label: "Keldi", align: "right", width: "15%" },
        { label: "Davomat", align: "right", width: "15%" },
      ]}
    >
      {report.trend.map((row) => (
        <Tr key={row.key}>
          <Td>{row.label}</Td>
          <Count value={row.days} />
          <Count value={row.expected} />
          <Count value={row.came} tone="text-emerald-700" />
          <Pct value={row.percent} bold />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

const WeekdaySection = ({ report, index }) => (
  <Section title={`${index}. Hafta kunlari kesimi`}>
    <DocTable
      columns={[
        { label: "Kun" },
        { label: "Kunlar soni", align: "right", width: "16%" },
        { label: "Kutilgan", align: "right", width: "16%" },
        { label: "Keldi", align: "right", width: "16%" },
        { label: "Davomat", align: "right", width: "16%" },
      ]}
    >
      {report.weekday.map((row) => (
        <Tr key={row.index}>
          <Td>{row.label}</Td>
          <Count value={row.days} />
          <Count value={row.expected} />
          <Count value={row.came} tone="text-emerald-700" />
          <Pct value={row.percent} bold />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Sinflar / o'quvchilar / o'qituvchilar ──────────────────────────── */

const ClassSection = ({ report, index, net }) => (
  <Section title={`${index}. Sinflar kesimi`} breakBefore>
    <Note>
      Davomat foizi bo&apos;yicha o&apos;sish tartibida — eng past sinf
      birinchi turadi.
    </Note>

    <DocTable
      minWidth="640px"
      columns={[
        { label: "№", align: "center", width: "5%" },
        { label: "Sinf" },
        ...(net ? [{ label: "Filial", width: "14%" }] : []),
        { label: "Kutilgan", align: "right", width: "12%" },
        { label: "Keldi", align: "right", width: "11%" },
        { label: "Kelmadi", align: "right", width: "11%" },
        { label: "Sababli", align: "right", width: "11%" },
        { label: "Davomat", align: "right", width: "12%" },
      ]}
    >
      {report.classes.map((row, i) => (
        <Tr key={`${row.branchId ?? ""}-${row.classId}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{row.className}</Td>
          {net && <Td className="text-gray-600">{row.branchName}</Td>}
          <Count value={row.expected} />
          <Count value={row.came} tone="text-emerald-700" />
          <Count value={row.absent} tone="text-red-700" />
          <Count value={row.excused} />
          <Pct value={row.percent} bold />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

const StudentSection = ({ report, index, net }) => (
  <Section title={`${index}. Eng ko'p qoldirgan o'quvchilar`} breakBefore>
    <Note>
      Qoldirilgan kunlar soni bo&apos;yicha. Belgilanmagan kun ham
      qoldirilgan hisoblanadi — davomat belgilanmagan bo&apos;lsa,
      o&apos;quvchi kelgani tasdiqlanmagan.
    </Note>

    <DocTable
      minWidth="760px"
      columns={[
        { label: "№", align: "center", width: "4%" },
        { label: "O'quvchi" },
        // ⚠️ RO'YXAT QO'NG'IROQ UCHUN: raqamsiz u faqat "xabar" bo'lib
        // qolardi. Word nusxasida ham AYNI ustun turadi.
        { label: PHONE_PAIR_LABEL, width: net ? "20%" : "22%" },
        ...(net ? [{ label: "Filial", width: "11%" }] : []),
        { label: "Sinf", width: net ? "11%" : "13%" },
        { label: "Kutilgan", align: "right", width: "9%" },
        { label: "Keldi", align: "right", width: "9%" },
        { label: "Qoldirdi", align: "right", width: "9%" },
        { label: "Davomat", align: "right", width: "9%" },
      ]}
    >
      {report.students.map((row, i) => (
        <Tr key={`${row.branchId ?? ""}-${row.studentId}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{row.name}</Td>
          <PhoneTd contact={row} />
          {net && <Td className="text-gray-600">{row.branchName}</Td>}
          <Td>{row.className}</Td>
          <Count value={row.expected} />
          <Count value={row.came} />
          <Count value={row.expected - row.came} tone="text-red-700" bold />
          <Pct value={row.percent} />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

const TeacherSection = ({ report, index, net }) => (
  <Section title={`${index}. O'qituvchilar kesimi`} breakBefore>
    <Note>
      Davomat foizi bo&apos;yicha o&apos;sish tartibida — e&apos;tibor talab
      qiladigani birinchi turadi.
    </Note>

    <DocTable
      minWidth="680px"
      columns={[
        { label: "№", align: "center", width: "5%" },
        { label: "O'qituvchi" },
        ...(net ? [{ label: "Filial", width: "12%" }] : []),
        { label: "Ish kunlari", align: "right", width: "11%" },
        { label: "Keldi", align: "right", width: "10%" },
        { label: "Kech", align: "right", width: "9%" },
        { label: "Kelmadi", align: "right", width: "10%" },
        { label: "Sababli", align: "right", width: "9%" },
        { label: "Davomat", align: "right", width: "10%" },
        { label: "Kunlik o'rtacha", align: "right", width: "13%" },
      ]}
    >
      {report.teachers.map((row, i) => (
        <Tr key={`${row.branchId ?? ""}-${row.userId}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{row.name}</Td>
          {net && <Td className="text-gray-600">{row.branchName}</Td>}
          <Count value={row.expected} />
          <Count value={row.came} tone="text-emerald-700" />
          <Count value={row.late} tone="text-amber-700" />
          <Count value={row.absent} tone="text-red-700" />
          <Count value={row.excused} />
          <Pct value={row.percent} bold />
          <Td align="right" className="text-gray-500">
            {minutesText(row.avgWorkedMinutes)}
          </Td>
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Jonli holat: bugun darsga chiqmaganlar ─────────────────────────── */

const LiveSection = ({ report, index, net }) => {
  const live = report.live;
  const title = `${index}. Bugun darsga chiqmaganlar`;

  if (!live) {
    return (
      <Section title={title}>
        <Note>
          Tanlangan davr bugungi kunni qamramaydi — jonli holat
          ko&apos;rsatilmaydi.
        </Note>
      </Section>
    );
  }

  return (
    <Section title={title} breakBefore>
      <Note>
        {live.dateLabel}
        {live.nowLabel ? `, soat ${live.nowLabel} holatiga` : ""}. Dars
        BOSHLANGAN, amaldagi o&apos;qituvchi (o&apos;rinbosarlik hisobga
        olingan) esa maktabda yo&apos;q.
      </Note>

      {live.closed ? (
        <p className="text-[10pt] text-gray-900">{live.message}</p>
      ) : !live.teachers.length ? (
        <p className="text-[10pt] font-semibold text-emerald-700">
          Hozircha darsga chiqmagan o&apos;qituvchi yo&apos;q.
        </p>
      ) : (
        <>
          <DocTable
            minWidth="640px"
            columns={[
              { label: "O'qituvchi" },
              ...(net ? [{ label: "Filial", width: "13%" }] : []),
              { label: "Holat", width: "20%" },
              { label: "Keldi", align: "center", width: "10%" },
              { label: "Darslar", width: "34%" },
            ]}
          >
            {live.teachers.map((row) => (
              <Tr key={`${row.branchId ?? ""}-${row.teacherId}`}>
                <Td className="font-semibold">{row.teacherName}</Td>
                {net && <Td className="text-gray-600">{row.branchName}</Td>}
                <Td
                  className={
                    row.state === "absent" ? "text-red-700" : "text-amber-700"
                  }
                >
                  {row.stateLabel}
                </Td>
                <Td align="center">{row.arrivedAtLabel || "—"}</Td>
                <Td>
                  {row.lessons.map((lesson) => (
                    <span
                      key={`${lesson.classId}-${lesson.lessonOrder}`}
                      className="block"
                    >
                      {lesson.className} — {lesson.lessonOrder}-dars
                      {lesson.startTime ? ` (${lesson.startTime})` : ""}
                      {lesson.ongoing ? ", hozir davom etmoqda" : ""}
                    </span>
                  ))}
                </Td>
              </Tr>
            ))}
          </DocTable>

          {live.summary.untimedLessons > 0 && (
            <Note>
              {live.summary.untimedLessons} ta darsning vaqti kiritilmagani
              uchun ro&apos;yxatga kirmadi.
            </Note>
          )}
        </>
      )}
    </Section>
  );
};

/* ── Hujjat ─────────────────────────────────────────────────────────── */

const STUDENT_FOOTER = [
  "Davomat foizi = (keldi + kech keldi) ÷ kutilgan o'quvchi-kunlar. Kutilgan o'quvchi-kunlar dars jadvali va o'qish davridan hisoblanadi: davri yopilgan o'quvchi kutilmaydi.",
  "Belgilanmagan o'quvchi KELMAGAN hisoblanadi — aks holda davomat belgilanmagan kun 100% bo'lib ko'rinardi.",
  "O'quv kuni — maktab bo'ylab kamida bitta davomat yozuvi bor kun. Yakshanba, bayram va ta'til kunlari hisobga kirmaydi.",
  "Arxivlangan o'quvchilar hisobotga kirmaydi.",
];

const TEACHER_FOOTER = [
  "Davomat foizi = (keldi + kech keldi) ÷ kutilgan ish kunlari. Kech kelgan ham KELGAN hisoblanadi, kechikish esa alohida ko'rsatiladi.",
  "Kutilgan ish kunlari — davomat yozuvi bor kunlar. Kun oxirida belgilanmaganlar avtomatik «kelmadi» bo'lib yoziladi, shuning uchun o'tgan kunlar to'liq; bugungi kun esa hali to'ldirilmoqda.",
  "«Ishda bo'lgan vaqt» faqat kelish VA ketish vaqti yozilgan kunlardan hisoblanadi: «Men ketdim» bosilmagan kun o'rtachani tushirib yubormasligi kerak.",
  "Hisobot faqat O'QITUVCHILARNI qamraydi (asosiy yoki qo'shimcha roli). Arxivlangan xodimlar kirmaydi.",
  "«Bugun darsga chiqmaganlar» bo'limi hujjat shakllantirilgan paytdagi holat: dars o'rinbosarga berilgan bo'lsa, o'rinbosar tekshiriladi.",
];

const AttendanceStatsDocument = ({ report }) => {
  const net = Boolean(report.isNetwork);
  const isStudents = report.kind === "students";
  const t = report.totals;
  const p = report.previous;

  /**
   * ⚠️ BO'LIM RAQAMLARI BO'LIM BOR-YO'QLIGIDAN hisoblanadi va SERVER BILAN
   * AYNI SHARTLAR bo'yicha (`attendanceStatsExport.service.js`): hujjatning
   * ekrandagi nusxasi bilan Word nusxasi bitta raqamlash bilan chiqishi
   * shart.
   *
   * ⚠️ Sanoqchi O'ZGARUVCHI EMAS, RO'YXAT: render tugagandan keyin
   * o'zgaruvchiga yozish React Compiler qoidasini buzardi
   * (`react-hooks/immutability`).
   */
  const order = [
    "summary",
    net && "branch",
    "compare",
    report.trend.length >= 2 && "trend",
    report.period.days >= 7 && report.weekday.length > 1 && "weekday",
    isStudents && report.classes.length > 0 && "classes",
    isStudents && report.students.length > 0 && "students",
    !isStudents && report.teachers.length > 0 && "teachers",
    !isStudents && "live",
  ].filter(Boolean);

  const indexOf = (key) => {
    const at = order.indexOf(key);
    return at === -1 ? null : at + 1;
  };

  const compareRows = isStudents
    ? [
        { label: "O'quv kunlari", current: t.schoolDays, previous: p.schoolDays },
        {
          label: "Kutilgan o'quvchi-kunlar",
          current: t.expected,
          previous: p.expected,
        },
        {
          label: "Keldi",
          current: t.came,
          previous: p.came,
          tone: "text-emerald-700",
          bold: true,
          trend: "good",
        },
        {
          label: "Kelmadi (sababsiz)",
          current: t.absent,
          previous: p.absent,
          tone: "text-red-700",
          trend: "bad",
        },
        {
          label: "Sababli",
          current: t.excused,
          previous: p.excused,
          tone: "text-amber-700",
          trend: "bad",
        },
      ]
    : [
        { label: "O'quv kunlari", current: t.schoolDays, previous: p.schoolDays },
        {
          label: "Kutilgan ish kunlari",
          current: t.expected,
          previous: p.expected,
        },
        {
          label: "Keldi",
          current: t.came,
          previous: p.came,
          tone: "text-emerald-700",
          bold: true,
          trend: "good",
        },
        {
          label: "Kech keldi",
          current: t.late,
          previous: p.late,
          tone: "text-amber-700",
          trend: "bad",
        },
        {
          label: "Kelmadi (sababsiz)",
          current: t.absent,
          previous: p.absent,
          tone: "text-red-700",
          trend: "bad",
        },
        {
          label: "Sababli",
          current: t.excused,
          previous: p.excused,
          tone: "text-amber-700",
          trend: "bad",
        },
      ];

  return (
    <article className="doc-sheet mx-auto w-full max-w-[210mm] rounded-sm border border-gray-200 bg-white px-[6mm] py-[10mm] font-serif text-[11pt] leading-relaxed text-gray-900 shadow-sm sm:px-[16mm] sm:py-[18mm] print:rounded-none print:border-0 print:shadow-none">
      {/* Sarlavha bloki */}
      <header className="mb-7 text-center">
        {/* ⚠️ Umumiy ko'rinishda sarlavhada FILIAL NOMI TURMAYDI: hujjat
            butun tarmoqniki va bitta filial nomi bilan sarlavhalansa, u
            o'sha filialning hisoboti deb o'qilardi. */}
        <p className="text-[10pt] font-semibold uppercase tracking-wide text-gray-500">
          {net
            ? `Barcha filiallar (${report.branches.length} ta)`
            : report.branch?.name}
        </p>

        <h1 className="mt-1 text-[15pt] font-bold uppercase tracking-wide text-gray-900">
          {isStudents
            ? "O'quvchilar davomati hisoboti"
            : "O'qituvchilar davomati hisoboti"}
        </h1>

        <p className="mt-1.5 text-[11pt] text-gray-900">
          {isStudents
            ? "Kim keldi, kim qoldirdi va davomat qanday o'zgardi"
            : "Kelish-ketish, kechikishlar va darsga chiqmaganlar"}
        </p>

        {/* ⚠️ PRESET NOMI YONIDA ANIQ ORALIQ: "Oylik" degan yozuvning o'zi
            hujjatni TUGAGAN oy hisoboti qilib ko'rsatardi. */}
        <p className="mt-1 text-[10pt] text-gray-900">
          {report.period.label} — {report.period.rangeLabel}
        </p>

        {net && (
          <p className="mt-1 text-[8.5pt] text-gray-500">
            {report.branches.map((item) => item.name).join("  ·  ")}
          </p>
        )}

        <p className="mt-0.5 text-[9pt] text-gray-500">
          Hisobot shakllantirilgan vaqt: {formatDateTimeUz(report.generatedAt)}
        </p>
      </header>

      <SummarySection report={report} index={indexOf("summary")} />

      {net && <BranchSection report={report} index={indexOf("branch")} />}

      <CompareSection
        report={report}
        index={indexOf("compare")}
        rows={compareRows}
      />

      {indexOf("trend") && (
        <TrendSection report={report} index={indexOf("trend")} />
      )}

      {indexOf("weekday") && (
        <WeekdaySection report={report} index={indexOf("weekday")} />
      )}

      {indexOf("classes") && (
        <ClassSection report={report} index={indexOf("classes")} net={net} />
      )}

      {indexOf("students") && (
        <StudentSection report={report} index={indexOf("students")} net={net} />
      )}

      {indexOf("teachers") && (
        <TeacherSection report={report} index={indexOf("teachers")} net={net} />
      )}

      {indexOf("live") && (
        <LiveSection report={report} index={indexOf("live")} net={net} />
      )}

      <section className="mt-8 border-t border-gray-200 pt-3 text-[9pt] text-gray-500">
        <h3 className="mb-1 text-[10pt] font-bold text-gray-700">
          Hisobot haqida
        </h3>

        {(isStudents ? STUDENT_FOOTER : TEACHER_FOOTER).map((line) => (
          <p key={line} className="mt-1">
            {line}
          </p>
        ))}

        {/* ⚠️ TUSHIB QOLGAN FILIAL JIM QOLMAYDI: hisobot baribir quriladi
            (qolgani yo'qolmasligi kerak), lekin raqam "tarmoq jamisi"
            bo'lib o'qiladi — shuning uchun qamrov ochiq yoziladi. */}
        {report.partial?.length > 0 && (
          <p className="mt-1 font-semibold text-red-700">
            Diqqat: {report.partial.join(", ")} filial(lar) ma&apos;lumoti
            olinmadi va bu hisobotga KIRMAGAN.
          </p>
        )}

        <p className="mt-1">Hujjat platformada avtomatik shakllantirilgan.</p>
      </section>
    </article>
  );
};

export default AttendanceStatsDocument;
