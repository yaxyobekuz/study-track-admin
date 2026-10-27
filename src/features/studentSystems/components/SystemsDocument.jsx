// React
import { Fragment } from "react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { STUDENT_SYSTEMS, percentText } from "../data/studentSystems.data";

/**
 * ERP VA KUNDALIK.COM — HUJJAT KO'RINISHI.
 *
 * ⚠️ BU EKRANDAGI WORD HUJJATINING O'ZI: bo'limlar, raqamlash va
 * jadvallar `studentSystemReportExport.service.js` dagi `.docx` bilan BIR
 * XIL tartibda. Foydalanuvchi "Word'da yuklab olish" ni bossa, aynan
 * ko'rib turgan hujjatni oladi — boshqacha bo'lsa, yuklab olingan fayl
 * "noto'g'ri" bo'lib ko'rinardi (`MovementDocument` bilan AYNI doktrina).
 *
 * ⚠️ RAQAM BU YERDA HISOBLANMAYDI. Hammasi serverdan keladi
 * (`studentSystemReport.service.js`): panel foizni o'zi hisoblasa, u Word
 * fayli bilan asta-sekin uzoqlashardi.
 *
 * ⚠️ BITTA FILIAL HAM, BUTUN TARMOQ HAM AYNI SHAKLDA keladi — farqi faqat
 * `isNetwork` bayrog'ida: u filiallar kesimi bo'limini va jadvallardagi
 * "Filial" ustunini yoqadi.
 *
 * A4 o'lchovi (210 mm) ataylab: hujjat chop etilganda ham, Word'da
 * ochilganda ham bir xil ko'rinishi kerak.
 */

/**
 * ⚠️ `breakBefore` — CHOP ETISHDA yangi sahifadan. Word nusxasida ham
 * AYNI bo'lim yangi sahifadan boshlanadi (`pageBreakBefore`): qog'ozdagi
 * hujjat bilan fayldagi hujjat bir xil ko'rinishi kerak.
 */
const Section = ({ title, children, breakBefore = false }) => (
  <section
    className={cn("mt-7 first:mt-0", breakBefore && "print:break-before-page")}
  >
    <h2 className="mb-2 text-[12pt] font-bold text-gray-900">{title}</h2>
    {children}
  </section>
);

/**
 * Word jadvali bilan AYNI ko'rinish: chegaralar, kulrang sarlavha.
 *
 * ⚠️ GLOBAL `<table>` USLUBLARI BU YERDA O'CHIRILADI (`MovementDocument`
 * dagi AYNI sabab): `styles/index.css` har jadvalga ko'k sarlavha, OQ
 * KATTA HARFLAR va `min-w-[934px]` majburlaydi — hujjatda esa sarlavha
 * Word fayli bilan bir xil bo'lishi shart.
 */
const DocTable = ({ columns, children }) => (
  <div className="-mx-1 overflow-x-auto px-1">
    <table className="w-full min-w-[520px] border-collapse text-[9.5pt]">
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
const Tr = ({ highlight = false, children }) => (
  <tr className={highlight ? "bg-gray-50" : "bg-white"}>{children}</tr>
);

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

/** Sanoq katagi: nol — kulrang (hech narsa qolmagan joy ko'zga tashlanmasin). */
const Count = ({ value, tone, bold = false }) => (
  <Td
    align="right"
    className={cn(value ? tone : "text-gray-400", bold && "font-bold")}
  >
    {value ?? 0}
  </Td>
);

/** "Bor" / "Yo'q" katagi — rangi bilan. */
const Mark = ({ present }) => (
  <Td
    align="center"
    className={present ? "text-emerald-700" : "font-bold text-red-700"}
  >
    {present ? "Bor" : "Yo'q"}
  </Td>
);

/* ── 1. Umumiy ko'rsatkichlar ───────────────────────────────────────── */

const SummarySection = ({ totals, index }) => (
  <Section title={`${index}. Umumiy ko'rsatkichlar`}>
    <DocTable
      columns={[
        { label: "Ko'rsatkich" },
        { label: "Soni", align: "right", width: "18%" },
        { label: "Foiz", align: "right", width: "18%" },
      ]}
    >
      <Tr>
        <Td className="font-semibold">Jami o&apos;quvchilar</Td>
        <Td align="right" className="font-bold">
          {totals.students}
        </Td>
        <Td align="right" className="text-gray-400">
          —
        </Td>
      </Tr>

      {STUDENT_SYSTEMS.map(({ key, label }) => (
        <Fragment key={key}>
          <Tr>
            <Td>{label} da bor</Td>
            <Td align="right" className="font-bold text-emerald-700">
              {totals.systems[key].yes}
            </Td>
            <Td align="right" className="text-emerald-700">
              {percentText(totals.systems[key].percent)}
            </Td>
          </Tr>
          <Tr>
            <Td>{label} da yo&apos;q</Td>
            <Td align="right" className="font-bold text-red-700">
              {totals.systems[key].no}
            </Td>
            <Td align="right" className="text-red-700">
              {percentText(
                totals.systems[key].percent == null
                  ? null
                  : 100 - totals.systems[key].percent,
              )}
            </Td>
          </Tr>
        </Fragment>
      ))}

      <Tr>
        <Td className="font-semibold">Ikkala tizimda ham bor</Td>
        <Td align="right" className="font-bold text-emerald-700">
          {totals.inBoth}
        </Td>
        <Td align="right" className="text-emerald-700">
          {percentText(totals.inBothPercent)}
        </Td>
      </Tr>
      <Tr highlight>
        <Td className="font-semibold">Kamida bitta tizimga kiritilmagan</Td>
        <Td align="right" className="font-bold text-red-700">
          {totals.missingAny}
        </Td>
        <Td align="right" className="text-red-700">
          {percentText(totals.missingAnyPercent)}
        </Td>
      </Tr>
      <Tr>
        <Td className="pl-6 text-gray-500">
          shundan ikkala tizimga ham kiritilmagan
        </Td>
        <Td align="right" className="text-gray-500">
          {totals.missingBoth}
        </Td>
        <Td align="right" className="text-gray-400">
          —
        </Td>
      </Tr>
    </DocTable>

    <p className="mt-2 text-[8.5pt] text-gray-500">
      Foiz jami o&apos;quvchilar soniga nisbatan hisoblangan. Hisobotda faqat
      JORIY (arxivlanmagan) o&apos;quvchilar bor: arxivlangan
      o&apos;quvchining belgisi o&apos;chirilmaydi, lekin u sanoqqa kirmaydi.
    </p>
  </Section>
);

/* ── 2. Filiallar kesimi (faqat umumiy ko'rinishda) ─────────────────── */

const BranchSection = ({ byBranch, totals, index }) => {
  const row = (label, item, bold) => (
    <Tr key={item.branchId ?? "total"} highlight={bold}>
      <Td className={bold ? "font-bold" : undefined}>{label}</Td>
      <Count value={item.students} tone="text-gray-900" bold={bold} />
      {STUDENT_SYSTEMS.map(({ key }) => (
        <Fragment key={key}>
          <Count value={item.systems[key].yes} tone="text-emerald-700" bold={bold} />
          <Count value={item.systems[key].no} tone="text-red-700" bold={bold} />
        </Fragment>
      ))}
      <Count value={item.missingAny} tone="text-red-700" bold />
    </Tr>
  );

  return (
    <Section title={`${index}. Filiallar kesimi`}>
      <DocTable
        columns={[
          { label: "Filial" },
          { label: "O'quvchi", align: "right" },
          ...STUDENT_SYSTEMS.flatMap(({ label }) => [
            { label: `${label}: bor`, align: "right" },
            { label: `${label}: yo'q`, align: "right" },
          ]),
          { label: "Kiritilmagan", align: "right" },
        ]}
      >
        {byBranch.map((item) => row(item.branchName, item, false))}
        {row("Jami (tarmoq)", totals, true)}
      </DocTable>

      <p className="mt-2 text-[8.5pt] text-gray-500">
        &laquo;Kiritilmagan&raquo; — kamida bitta tizimga kiritilmagan
        o&apos;quvchilar. Ro&apos;yxat shu raqam bo&apos;yicha kamayish
        tartibida: eng ko&apos;p ish qolgan filial yuqorida turadi.
      </p>
    </Section>
  );
};

/* ── 3. Sinflar kesimi ──────────────────────────────────────────────── */

const ClassSection = ({ byClass, index, showBranch }) => (
  <Section title={`${index}. Sinflar kesimi`} breakBefore>
    <DocTable
      columns={[
        { label: "Sinf" },
        ...(showBranch ? [{ label: "Filial" }] : []),
        { label: "O'quvchi", align: "right" },
        ...STUDENT_SYSTEMS.flatMap(({ label }) => [
          { label: `${label}: bor`, align: "right" },
          { label: `${label}: yo'q`, align: "right" },
        ]),
        { label: "To'liq", align: "right" },
      ]}
    >
      {byClass.map((item) => (
        <Tr key={`${item.branchId ?? ""}-${item.id}`}>
          <Td className="font-semibold">{item.name}</Td>
          {showBranch && <Td className="text-gray-600">{item.branchName}</Td>}
          <Count value={item.students} tone="text-gray-900" />
          {STUDENT_SYSTEMS.map(({ key }) => (
            <Fragment key={key}>
              <Count value={item.systems[key].yes} tone="text-emerald-700" />
              <Count value={item.systems[key].no} tone="text-red-700" />
            </Fragment>
          ))}
          <Td align="right" className="text-gray-500">
            {percentText(item.inBothPercent)}
          </Td>
        </Tr>
      ))}
    </DocTable>

    <p className="mt-2 text-[8.5pt] text-gray-500">
      &laquo;To&apos;liq&raquo; — sinfning qancha qismi IKKALA tizimga ham
      kiritilgan. ⚠️ Ikki sinfda o&apos;qiydigan o&apos;quvchi HAR IKKI
      qatorda sanaladi, &laquo;Jami&raquo; da esa bir marta — shuning uchun
      sinflar yig&apos;indisi umumiy sondan katta bo&apos;lishi mumkin.
    </p>
  </Section>
);

/* ── 4–5. Kiritilmagan o'quvchilar ──────────────────────────────────── */

/**
 * ⚠️ HAR TIZIM UCHUN ALOHIDA RO'YXAT va bu ataylab takror: ERP ro'yxati
 * ERP ga kirituvchi xodimga, Kundalik ro'yxati esa boshqasiga beriladi.
 * Bitta jadvalda ikkala ustun bilan berilsa, har xodim o'ziga keraklisini
 * qo'lda ajratib olardi.
 */
const MissingSection = ({ system, items, index, showBranch }) => {
  const others = STUDENT_SYSTEMS.filter((item) => item.key !== system.key);

  if (items.length === 0) {
    return (
      <Section title={`${index}. ${system.label} ga kiritilmagan o'quvchilar`} breakBefore>
        <p className="text-[10pt] text-gray-500">
          Hamma o&apos;quvchi {system.label} ga kiritilgan.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title={`${index}. ${system.label} ga kiritilmagan o'quvchilar (${items.length} ta)`}
      breakBefore
    >
      <DocTable
        columns={[
          { label: "№", align: "center", width: "6%" },
          { label: "F.I.Sh." },
          ...(showBranch ? [{ label: "Filial", width: "16%" }] : []),
          { label: "Sinf", width: "18%" },
          ...others.map((item) => ({
            label: item.label,
            align: "center",
            width: "14%",
          })),
        ]}
      >
        {items.map((item, i) => (
          <Tr key={`${item.branchId ?? ""}-${item.id}`}>
            <Td align="center" className="text-gray-500">
              {i + 1}
            </Td>
            <Td className="font-semibold">{item.name}</Td>
            {showBranch && <Td className="text-gray-600">{item.branchName}</Td>}
            <Td>{item.className || "—"}</Td>
            {others.map((other) => (
              <Mark key={other.key} present={item[other.key]} />
            ))}
          </Tr>
        ))}
      </DocTable>
    </Section>
  );
};

/* ── Hujjat ─────────────────────────────────────────────────────────── */

const SystemsDocument = ({ report }) => {
  const net = Boolean(report.isNetwork);

  /**
   * ⚠️ BO'LIM RAQAMLARI BO'LIM BOR-YO'QLIGIDAN hisoblanadi va SERVER BILAN
   * AYNI TARTIBDA (`studentSystemReportExport.service.js`):
   *
   *   Umumiy → [Filiallar] → Sinflar → har tizim uchun "kiritilmaganlar"
   */
  const classIndex = net ? 3 : 2;

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
          ERP va Kundalik.com hisoboti
        </h1>

        <p className="mt-1.5 text-[11pt] text-gray-900">
          O&apos;quvchilar tashqi tizimlarga kiritilganmi
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

      <SummarySection totals={report.totals} index={1} />

      {net && (
        <BranchSection
          byBranch={report.byBranch}
          totals={report.totals}
          index={2}
        />
      )}

      <ClassSection
        byClass={report.byClass}
        index={classIndex}
        showBranch={net}
      />

      {STUDENT_SYSTEMS.map((system, order) => (
        <MissingSection
          key={system.key}
          system={system}
          items={report.missing?.[system.key] ?? []}
          index={classIndex + 1 + order}
          showBranch={net}
        />
      ))}

      <section className="mt-8 border-t border-gray-200 pt-3 text-[9pt] text-gray-500">
        <h3 className="mb-1 text-[10pt] font-bold text-gray-700">
          Hisobot haqida
        </h3>
        <p>
          Belgi qo&apos;lda qo&apos;yiladi: mas&apos;ul xodim o&apos;quvchini
          tashqi tizimga kiritgandan keyin platformada &laquo;bor&raquo; deb
          belgilaydi. Belgi yo&apos;q bo&apos;lsa, o&apos;quvchi
          &laquo;yo&apos;q&raquo; lar ro&apos;yxatida turadi.
        </p>

        {/* ⚠️ TUSHIB QOLGAN FILIAL JIM QOLMAYDI: hisobot baribir quriladi
            (qolgani yo'qolmasligi kerak), lekin raqam "tarmoq jamisi"
            bo'lib o'qiladi — shuning uchun qamrov ochiq yoziladi. */}
        {report.partial?.length > 0 && (
          <p className="mt-1 font-semibold text-red-700">
            Diqqat: {report.partial.join(", ")} filial(lar) ma&apos;lumoti
            olinmadi va bu hisobotga KIRMAGAN.
          </p>
        )}

        <p className="mt-1">
          Ma&apos;lumot manbai — platformadagi &laquo;ERP va
          Kundalik.com&raquo; bo&apos;limi. Hujjat avtomatik
          shakllantirilgan.
        </p>
      </section>
    </article>
  );
};

export default SystemsDocument;
