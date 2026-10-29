// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { docPercentText } from "@/shared/data/dashboardPeriods.data";
import { countText } from "@/features/attendance/data/attendanceStats.data";

/**
 * BOT FOYDALANUVCHILARI — HUJJAT KO'RINISHI.
 *
 * ⚠️ BU EKRANDAGI WORD HUJJATINING O'ZI: bo'limlar, raqamlash va
 * jadvallar `botReportExport.service.js` dagi `.docx` bilan BIR XIL
 * tartibda. Foydalanuvchi "Word'da yuklab olish" ni bossa, aynan ko'rib
 * turgan hujjatni oladi (`AttendanceStatsDocument` bilan AYNI doktrina).
 *
 * ⚠️ RAQAM BU YERDA HISOBLANMAYDI. Hammasi serverdan keladi
 * (`botReport.service.js` → `activityDashboard.service.js`): panel foizni
 * o'zi hisoblasa, u Word fayli bilan asta-sekin uzoqlashardi.
 *
 * A4 o'lchovi (210 mm) ataylab: hujjat chop etilganda ham, Word'da
 * ochilganda ham bir xil ko'rinishi kerak.
 */

/** ⚠️ `breakBefore` — CHOP ETISHDA yangi sahifadan (Word nusxasida ham). */
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
 * ⚠️ GLOBAL `<table>` USLUBLARI BU YERDA O'CHIRILADI: `styles/index.css`
 * har jadvalga ko'k sarlavha, OQ KATTA HARFLAR va `min-w-[934px]`
 * majburlaydi — hujjatda esa sarlavha Word fayli bilan bir xil bo'lishi
 * shart.
 */
const DocTable = ({ columns, children, minWidth = "520px" }) => (
  <div className="-mx-1 overflow-x-auto px-1">
    <table className="w-full border-collapse text-[9.5pt]" style={{ minWidth }}>
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

const DASH = (
  <Td align="right" className="text-gray-400">
    —
  </Td>
);

/* ── 1. Umumiy ko'rsatkichlar ───────────────────────────────────────── */

const SummarySection = ({ report, index }) => {
  const t = report.totals;

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
          <Td className="font-semibold">O&apos;qiyotgan o&apos;quvchilar</Td>
          <Count value={t.students} bold />
          {DASH}
        </Tr>
        <Tr>
          <Td className="font-semibold">Qamrab olingan o&apos;quvchilar</Td>
          <Count value={t.linkedStudents} tone="text-emerald-700" bold />
          <Pct value={t.coverage} bold tone="text-emerald-700" />
        </Tr>
        <Tr>
          <Td>Qamrab olinmaganlar</Td>
          <Count value={t.unlinked} tone="text-red-700" />
          <Pct
            value={t.coverage == null ? null : 100 - t.coverage}
            tone="text-red-700"
          />
        </Tr>
        <Tr>
          <Td className="font-semibold">Bog&apos;langan hisoblar</Td>
          <Count value={t.linked} bold />
          {DASH}
        </Tr>
        <Tr>
          <Td>Bugun faol ({report.todayLabel})</Td>
          <Count value={t.todayActive} />
          <Pct value={t.todayRate} />
        </Tr>
        <Tr>
          <Td>Davr ichida faol ({report.period.days} kun)</Td>
          <Count value={t.activeInPeriod} tone="text-emerald-700" />
          <Pct value={t.activeRate} tone="text-emerald-700" />
        </Tr>
        <Tr>
          <Td>Jim turganlar</Td>
          <Count value={t.silent} tone="text-amber-700" />
          {DASH}
        </Tr>
        <Tr>
          <Td>Bildirishnoma o&apos;chirganlar</Td>
          <Count value={t.notificationsOff} tone="text-amber-700" />
          {DASH}
        </Tr>
        <Tr>
          <Td>Davrda yangi bog&apos;lanish</Td>
          <Count value={t.newLinks} tone="text-emerald-700" />
          {DASH}
        </Tr>
      </DocTable>
    </Section>
  );
};

/* ── Filiallar kesimi ───────────────────────────────────────────────── */

const BranchSection = ({ report, index }) => (
  <Section title={`${index}. Filiallar kesimi`}>
    <Note>
      Foiz har filialning O&apos;Z yig&apos;indisidan hisoblangan, filiallar
      o&apos;rtachasi EMAS. Qator qamrov foizi bo&apos;yicha o&apos;sish
      tartibida.
    </Note>

    <DocTable
      columns={[
        { label: "Filial" },
        { label: "O'quvchi", align: "right", width: "13%" },
        { label: "Qamralgan", align: "right", width: "14%" },
        { label: "Qamrov", align: "right", width: "13%" },
        { label: "Hisoblar", align: "right", width: "13%" },
        { label: "Bugun faol", align: "right", width: "14%" },
      ]}
    >
      {report.byBranch.map((row) => (
        <Tr key={row.branchId}>
          <Td className="font-semibold">{row.branchName}</Td>
          <Count value={row.students} />
          <Count value={row.linkedStudents} tone="text-emerald-700" />
          <Pct value={row.coverage} bold />
          <Count value={row.linked} />
          <Count value={row.todayActive} />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Dinamika ───────────────────────────────────────────────────────── */

const TrendSection = ({ report, index }) => (
  <Section title={`${index}. Faollik dinamikasi`}>
    <Note>Har bo&apos;lakda botni ochgan noyob ota-onalar soni.</Note>

    <DocTable
      columns={[
        { label: "Davr" },
        { label: "Faol ota-onalar", align: "right", width: "30%" },
      ]}
    >
      {report.trend.map((row) => (
        <Tr key={row.day}>
          <Td>{row.label}</Td>
          <Count value={row.bot} tone="text-emerald-700" />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Sinflar kesimi ─────────────────────────────────────────────────── */

const ClassSection = ({ report, index, net }) => (
  <Section title={`${index}. Sinflar kesimi`} breakBefore>
    <Note>
      Foydalanish foizi bo&apos;yicha o&apos;sish tartibida. QAMROV — nechta
      o&apos;quvchining ota-onasi ulangan; FOYDALANISH — ulanganlarning
      qanchasi davr ichida botni ochgan.
    </Note>

    <DocTable
      minWidth="640px"
      columns={[
        { label: "№", align: "center", width: "5%" },
        { label: "Sinf" },
        ...(net ? [{ label: "Filial", width: "14%" }] : []),
        { label: "O'quvchi", align: "right", width: "11%" },
        { label: "Qamralgan", align: "right", width: "12%" },
        { label: "Qamrov", align: "right", width: "11%" },
        { label: "Faol", align: "right", width: "10%" },
        { label: "Foydalanish", align: "right", width: "12%" },
      ]}
    >
      {report.classes.map((row, i) => (
        <Tr key={`${row.branchId ?? ""}-${row.id ?? "none"}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{row.name}</Td>
          {net && <Td className="text-gray-600">{row.branchName}</Td>}
          <Count value={row.students} />
          <Count value={row.linkedStudents} tone="text-emerald-700" />
          <Pct value={row.linkRate} />
          <Count value={row.active} />
          <Pct value={row.rate} bold />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Ro'yxatlar ─────────────────────────────────────────────────────── */

const UnlinkedSection = ({ report, index, net }) => (
  <Section title={`${index}. Botga ulanmagan o'quvchilar`} breakBefore>
    <Note>
      Jami {countText(report.unlinkedTotal)} ta
      {report.unlinkedTotal > report.unlinkedStudents.length
        ? `, ro'yxatda birinchi ${countText(report.unlinkedStudents.length)} tasi.`
        : "."}
    </Note>

    <DocTable
      columns={[
        { label: "№", align: "center", width: "6%" },
        { label: "O'quvchi" },
        ...(net ? [{ label: "Filial", width: "22%" }] : []),
        { label: "Sinf", width: "24%" },
      ]}
    >
      {report.unlinkedStudents.map((row, i) => (
        <Tr key={`${row.branchId ?? ""}-${row.id}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{row.name}</Td>
          {net && <Td className="text-gray-600">{row.branchName}</Td>}
          <Td>{row.className}</Td>
        </Tr>
      ))}
    </DocTable>
  </Section>
);

const SilentSection = ({ report, index, net }) => (
  <Section title={`${index}. Ulangan, lekin ishlatmayotganlar`} breakBefore>
    <Note>
      Davr ichida botni birorta ham ochmagan ota-onalar. Jami{" "}
      {countText(report.silentTotal)} ta
      {report.silentTotal > report.silentParents.length
        ? `, ro'yxatda birinchi ${countText(report.silentParents.length)} tasi.`
        : "."}
    </Note>

    <DocTable
      columns={[
        { label: "№", align: "center", width: "6%" },
        { label: "O'quvchi" },
        ...(net ? [{ label: "Filial", width: "20%" }] : []),
        { label: "Oxirgi marta", width: "30%" },
      ]}
    >
      {report.silentParents.map((row, i) => (
        <Tr key={`${row.branchId ?? ""}-${row.telegramId ?? row.studentId}-${i}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{row.studentName}</Td>
          {net && <Td className="text-gray-600">{row.branchName}</Td>}
          <Td className={row.lastSeenLabel ? undefined : "text-red-700"}>
            {row.lastSeenLabel
              ? `${row.lastSeenLabel}${row.daysSince != null ? ` (${countText(row.daysSince)} kun oldin)` : ""}`
              : "Hech qachon kirmagan"}
          </Td>
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── Xabar yetkazish ────────────────────────────────────────────────── */

const DeliverySection = ({ report, index }) => {
  const d = report.delivery;

  return (
    <Section title={`${index}. Xabar yetkazish`}>
      <DocTable
        columns={[
          { label: "Ko'rsatkich" },
          { label: "Soni", align: "right", width: "18%" },
          { label: "Ulushi", align: "right", width: "18%" },
        ]}
      >
        <Tr>
          <Td className="font-semibold">Ommaviy xabarlar — jami</Td>
          <Count value={d.broadcast.total} bold />
          {DASH}
        </Tr>
        <Tr>
          <Td>Yetkazildi</Td>
          <Count value={d.broadcast.sent} tone="text-emerald-700" />
          <Pct value={d.broadcast.rate} />
        </Tr>
        <Tr>
          <Td>Yetkazilmadi</Td>
          <Count value={d.broadcast.failed} tone="text-red-700" />
          {DASH}
        </Tr>
        <Tr>
          <Td>Navbatda</Td>
          <Count value={d.broadcast.pending} />
          {DASH}
        </Tr>
        <Tr>
          <Td className="font-semibold">
            Kunlik baho hisoboti — yetkazildi
          </Td>
          <Count value={d.reports.sent} tone="text-emerald-700" bold />
          <Pct value={d.reports.rate} />
        </Tr>
        <Tr>
          <Td>Yetkazilmadi</Td>
          <Count value={d.reports.failed} tone="text-red-700" />
          {DASH}
        </Tr>
      </DocTable>
    </Section>
  );
};

/* ── Hujjat ─────────────────────────────────────────────────────────── */

const BotReportDocument = ({ report }) => {
  const net = Boolean(report.isNetwork);

  /**
   * ⚠️ BO'LIM RAQAMLARI BO'LIM BOR-YO'QLIGIDAN hisoblanadi va SERVER BILAN
   * AYNI SHARTLAR bo'yicha (`botReportExport.service.js`).
   *
   * ⚠️ Sanoqchi O'ZGARUVCHI EMAS, RO'YXAT: render tugagandan keyin
   * o'zgaruvchiga yozish React Compiler qoidasini buzardi.
   */
  const order = [
    "summary",
    net && "branch",
    report.trend.length >= 2 && "trend",
    report.classes.length > 0 && "classes",
    report.unlinkedStudents.length > 0 && "unlinked",
    report.silentParents.length > 0 && "silent",
    "delivery",
  ].filter(Boolean);

  const indexOf = (key) => {
    const at = order.indexOf(key);
    return at === -1 ? null : at + 1;
  };

  return (
    <article className="doc-sheet mx-auto w-full max-w-[210mm] rounded-sm border border-gray-200 bg-white px-[6mm] py-[10mm] font-serif text-[11pt] leading-relaxed text-gray-900 shadow-sm sm:px-[16mm] sm:py-[18mm] print:rounded-none print:border-0 print:shadow-none">
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
          Bot foydalanuvchilari hisoboti
        </h1>

        <p className="mt-1.5 text-[11pt] text-gray-900">
          Ota-onalar botga qanchalik ulangan va uni qanchalik ishlatmoqda
        </p>

        <p className="mt-1 text-[10pt] text-gray-900">
          Faollik davri: {report.period.days} kun ({report.period.rangeLabel})
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

      {indexOf("trend") && (
        <TrendSection report={report} index={indexOf("trend")} />
      )}

      {indexOf("classes") && (
        <ClassSection report={report} index={indexOf("classes")} net={net} />
      )}

      {indexOf("unlinked") && (
        <UnlinkedSection report={report} index={indexOf("unlinked")} net={net} />
      )}

      {indexOf("silent") && (
        <SilentSection report={report} index={indexOf("silent")} net={net} />
      )}

      <DeliverySection report={report} index={indexOf("delivery")} />

      <section className="mt-8 border-t border-gray-200 pt-3 text-[9pt] text-gray-500">
        <h3 className="mb-1 text-[10pt] font-bold text-gray-700">
          Hisobot haqida
        </h3>

        <p className="mt-1">
          QAMROV — o&apos;qiyotgan o&apos;quvchilarning qanchasida kamida
          bitta ota-ona botga ulangan. Maktabdan ketgan o&apos;quvchi
          maxrajga kirmaydi.
        </p>
        <p className="mt-1">
          FOYDALANISH — bog&apos;langan hisoblarning qanchasi davr ichida
          botni ochgan. Ulanmagan ota-ona bu foizga KIRMAYDI: u botdan
          umuman xabardor emas.
        </p>
        <p className="mt-1">
          Bir o&apos;quvchiga ikkita hisob ulangan bo&apos;lishi mumkin (ona
          va ota), shuning uchun &laquo;bog&apos;langan hisoblar&raquo;
          &laquo;qamrab olingan o&apos;quvchilar&raquo; dan ko&apos;p
          bo&apos;lishi mumkin.
        </p>

        {net && (
          <p className="mt-1">
            Umumiy ko&apos;rinishda sonlar qo&apos;shilgan, foiz esa
            yig&apos;indidan qayta hisoblangan — filiallar o&apos;rtachasi
            EMAS.
          </p>
        )}

        {!report.withRoster && (
          <p className="mt-1">
            Ism ro&apos;yxatlari (ulanmaganlar va jim turganlar) bu hisobotda
            yo&apos;q: ular alohida ruxsat ortida (Faollik &rarr;
            ro&apos;yxat).
          </p>
        )}

        {report.collecting && (
          <p className="mt-1">
            Faollik tarixi hali to&apos;liq yig&apos;ilmagan
            {report.sinceLabel ? ` — ${report.sinceLabel} dan boshlab yozilmoqda` : ""}.
            Nol raqam &laquo;hech kim ishlatmayapti&raquo; degani emas.
          </p>
        )}

        {/* ⚠️ TUSHIB QOLGAN FILIAL JIM QOLMAYDI: hisobot baribir quriladi,
            lekin raqam "tarmoq jamisi" bo'lib o'qiladi. */}
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

export default BotReportDocument;
