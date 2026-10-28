// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz, formatDateUz } from "@/shared/utils/date.utils";

// Data
import {
  DOC_STATUS_LABEL,
  DOC_TIMING_LABEL,
  WEEKDAY_FULL,
  docPercentText,
  durationText,
  kindLabel,
} from "../../data/tasks.data";

/**
 * XODIMLAR TOPSHIRIQLARI — HUJJAT KO'RINISHI.
 *
 * ⚠️ BU EKRANDAGI WORD HUJJATINING O'ZI: bo'limlar, ularning TARTIBI,
 * RAQAMLANISHI va jadvallari `taskReportExport.service.js` dagi `.docx`
 * bilan BIR XIL. Foydalanuvchi "Word'da yuklab olish" ni bossa, aynan
 * ko'rib turgan hujjatni oladi — boshqacha bo'lsa, yuklab olingan fayl
 * "noto'g'ri" bo'lib ko'rinardi (`MovementDocument` va `SystemsDocument`
 * bilan AYNI doktrina).
 *
 * ⚠️ RAQAM BU YERDA HISOBLANMAYDI. Hammasi serverdan keladi
 * (`taskNetwork.service.js`): panel foizni yoki yig'indini o'zi hisoblasa,
 * u Word fayli bilan asta-sekin uzoqlashardi. Yagona istisno — ustun
 * ichidagi "jarayonda + tekshiruvda" qo'shuvi, u Word'da ham AYNI
 * shunday qo'shiladi.
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
 * ⚠️ GLOBAL `<table>` USLUBLARI BU YERDA O'CHIRILADI (`SystemsDocument`
 * dagi AYNI sabab): `styles/index.css` har jadvalga ko'k sarlavha, OQ
 * KATTA HARFLAR va `min-w-[934px]` majburlaydi — hujjatda esa sarlavha
 * Word fayli bilan bir xil bo'lishi shart.
 */
const DocTable = ({ columns, children, minWidth = 520 }) => (
  <div className="-mx-1 overflow-x-auto px-1">
    <table
      className="w-full border-collapse text-[9.5pt]"
      style={{ minWidth: `${minWidth}px` }}
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

/** Izoh qatori — jadval ostidagi "nima uchun shunday" matni. */
const Note = ({ children }) => (
  <p className="mt-2 text-[8.5pt] leading-relaxed text-gray-500">{children}</p>
);

const DASH = <Td align="right" className="text-gray-400">—</Td>;

const text = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || "—";
};

/* ── 1. Umumiy ko'rsatkichlar ───────────────────────────────────────── */

const SummarySection = ({ kpis, index }) => {
  const share = (value) => (kpis.total > 0 ? (value / kpis.total) * 100 : null);

  const statusRow = (key, value, tone) => (
    <Tr key={key}>
      <Td>{DOC_STATUS_LABEL[key]}</Td>
      <Count value={value} tone={tone} bold />
      <Td align="right" className="text-gray-500">
        {docPercentText(share(value))}
      </Td>
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
          <Td className="font-semibold">Davrda berilgan topshiriqlar</Td>
          <Td align="right" className="font-bold">
            {kpis.total}
          </Td>
          {DASH}
        </Tr>

        {statusRow("completed", kpis.completed, "text-emerald-700")}
        {statusRow("review", kpis.review, "text-amber-700")}
        {statusRow("inProgress", kpis.inProgress, "text-gray-900")}
        {statusRow("overdue", kpis.overdue, "text-red-700")}
        {statusRow("stopped", kpis.stopped, "text-gray-900")}

        <Tr highlight>
          <Td className="font-semibold">Bajarilish darajasi</Td>
          <Td align="right" className="font-bold text-emerald-700">
            {docPercentText(kpis.completionRate)}
          </Td>
          {DASH}
        </Tr>
        <Tr>
          <Td>O&apos;z vaqtida topshirilgani</Td>
          <Td align="right" className="text-emerald-700">
            {docPercentText(kpis.onTimeRate)}
          </Td>
          {DASH}
        </Tr>
        <Tr>
          <Td>Ijrochilar (xodimlar)</Td>
          <Count value={kpis.assignees} tone="text-gray-900" />
          {DASH}
        </Tr>
        <Tr>
          <Td>Muddati uzaytirilgan</Td>
          <Count value={kpis.extended} tone="text-gray-900" />
          {DASH}
        </Tr>
        <Tr>
          <Td>Rad etilib qayta topshirilgan</Td>
          <Count value={kpis.rejected} tone="text-gray-900" />
          {DASH}
        </Tr>
        <Tr>
          <Td>Jarima yozilgan topshiriqlar</Td>
          <Count value={kpis.penalized} tone="text-red-700" />
          <Td align="right" className="text-gray-500">
            {kpis.penaltyPoints} ball
          </Td>
        </Tr>
        <Tr>
          <Td>O&apos;rtacha bajarish vaqti</Td>
          <Td align="right">{durationText(kpis.avgCompletionMinutes)}</Td>
          {DASH}
        </Tr>
        <Tr>
          <Td>O&apos;rtacha tekshirish vaqti</Td>
          <Td align="right">{durationText(kpis.avgReviewMinutes)}</Td>
          {DASH}
        </Tr>
      </DocTable>

      <Note>
        Topshiriqlar BERILGAN sanasi bo&apos;yicha olingan: &laquo;shu davrda
        berilgan ishning qanchasi bajarildi&raquo;. Bajarilish darajasi
        to&apos;xtatilganlarsiz hisoblanadi: {kpis.completed} &divide;{" "}
        {Math.max(0, kpis.total - kpis.stopped)}.
      </Note>
    </Section>
  );
};

/* ── 2. Filiallar kesimi ────────────────────────────────────────────── */

const BranchSection = ({ byBranch, kpis, index }) => (
  <Section title={`${index}. Filiallar kesimi`}>
    <DocTable
      columns={[
        { label: "Filial" },
        { label: "Berildi", align: "right" },
        { label: "Bajarildi", align: "right" },
        { label: "Jarayonda", align: "right" },
        { label: "Muddati o'tgan", align: "right" },
        { label: "Bajarilish", align: "right" },
      ]}
    >
      {byBranch.map((row) => (
        <Tr key={row.branchId}>
          <Td className="font-semibold">{text(row.branchName)}</Td>
          <Count value={row.total} tone="text-gray-900" />
          <Count value={row.completed} tone="text-emerald-700" />
          <Count value={row.inProgress + row.review} tone="text-gray-900" />
          <Count value={row.overdue} tone="text-red-700" bold />
          <Td align="right">{docPercentText(row.completionRate)}</Td>
        </Tr>
      ))}

      <Tr highlight>
        <Td className="font-bold">Jami (tarmoq)</Td>
        <Count value={kpis.total} tone="text-gray-900" bold />
        <Count value={kpis.completed} tone="text-emerald-700" bold />
        <Count value={kpis.inProgress + kpis.review} tone="text-gray-900" bold />
        <Count value={kpis.overdue} tone="text-red-700" bold />
        <Td align="right" className="font-bold">
          {docPercentText(kpis.completionRate)}
        </Td>
      </Tr>
    </DocTable>

    <Note>
      Ro&apos;yxat muddati o&apos;tgan topshiriqlar soni bo&apos;yicha
      kamayish tartibida: eng ko&apos;p ish qolgan filial yuqorida turadi.
      Foiz har filialning O&apos;Z yig&apos;indisidan hisoblangan,
      &laquo;Jami&raquo; esa tarmoq yig&apos;indisidan — ya&apos;ni u
      filiallar foizlarining o&apos;rtachasi EMAS.
    </Note>
  </Section>
);

/* ── 3. Turlar va topshirish vaqti ──────────────────────────────────── */

const ShapeSection = ({ kinds, timing, index }) => {
  const timingTotal = timing.early + timing.lastDay + timing.late;

  return (
    <Section title={`${index}. Topshiriq turlari va topshirish vaqti`}>
      <DocTable
        columns={[
          { label: "Tur" },
          { label: "Berildi", align: "right" },
          { label: "Bajarildi", align: "right" },
          { label: "Muddati o'tgan", align: "right" },
          { label: "Bajarilish", align: "right" },
        ]}
      >
        {kinds.map((row) => (
          <Tr key={row.key}>
            <Td className="font-semibold">{kindLabel(row.key)}</Td>
            <Count value={row.total} tone="text-gray-900" />
            <Count value={row.completed} tone="text-emerald-700" />
            <Count value={row.overdue} tone="text-red-700" />
            <Td align="right">{docPercentText(row.rate)}</Td>
          </Tr>
        ))}
      </DocTable>

      <Note>
        &laquo;Asosiy&raquo; — lavozim bo&apos;yicha doimiy ish,
        &laquo;Qo&apos;shimcha&raquo; — bir martalik vazifa. Qo&apos;shimcha
        ishning ulushi o&apos;sib borsa, asosiy ish siqib chiqarilayotgan
        bo&apos;ladi.
      </Note>

      <div className="mt-4">
        <DocTable
          columns={[
            { label: "Topshirish vaqti" },
            { label: "Soni", align: "right", width: "18%" },
            { label: "Ulushi", align: "right", width: "18%" },
          ]}
        >
          {["early", "lastDay", "late"].map((key) => (
            <Tr key={key}>
              <Td>{DOC_TIMING_LABEL[key]}</Td>
              <Count
                value={timing[key]}
                tone={key === "late" ? "text-red-700" : "text-emerald-700"}
              />
              <Td align="right" className="text-gray-500">
                {docPercentText(
                  timingTotal > 0 ? (timing[key] / timingTotal) * 100 : null,
                )}
              </Td>
            </Tr>
          ))}
        </DocTable>
      </div>

      <Note>
        Faqat YAKUNLANGAN topshiriqlar: ish muddatdan qancha oldin
        topshirilgani. &laquo;Oxirgi kuni&raquo; — muddatga bir kundan kam
        qolganda.
      </Note>
    </Section>
  );
};

/* ── 4. Dinamika ────────────────────────────────────────────────────── */

const TrendSection = ({ trend, index }) => (
  <Section title={`${index}. Dinamika`} breakBefore>
    <DocTable
      columns={[
        { label: "Davr" },
        { label: "Berildi", align: "right", width: "16%" },
        { label: "Bajarildi", align: "right", width: "16%" },
        { label: "Farq", align: "right", width: "16%" },
      ]}
    >
      {trend.map((row) => {
        const diff = row.completed - row.created;
        return (
          <Tr key={row.key}>
            <Td>{text(row.label || row.key)}</Td>
            <Count value={row.created} tone="text-gray-900" />
            <Count value={row.completed} tone="text-emerald-700" />
            <Td
              align="right"
              className={
                diff < 0
                  ? "text-red-700"
                  : diff > 0
                    ? "text-emerald-700"
                    : "text-gray-400"
              }
            >
              {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "0"}
            </Td>
          </Tr>
        );
      })}
    </DocTable>

    <Note>
      &laquo;Berildi&raquo; — o&apos;sha davrda yozilgan topshiriqlar,
      &laquo;Bajarildi&raquo; — o&apos;sha davrda YAKUNLANGANLARI (qachon
      berilganidan qat&apos;i nazar). Farq manfiy bo&apos;lsa, ish
      to&apos;planib boryapti.
    </Note>
  </Section>
);

/* ── 5. Hafta kunlari ───────────────────────────────────────────────── */

const WeekdaySection = ({ weekday, index }) => (
  <Section title={`${index}. Hafta kunlari kesimi`}>
    <DocTable
      columns={[
        { label: "Kun" },
        { label: "Berildi", align: "right", width: "20%" },
        { label: "Bajarildi", align: "right", width: "20%" },
      ]}
    >
      {weekday.map((row) => (
        <Tr key={row.index}>
          <Td>{WEEKDAY_FULL[row.index] || row.index}</Td>
          <Count value={row.created} tone="text-gray-900" />
          <Count value={row.completed} tone="text-emerald-700" />
        </Tr>
      ))}
    </DocTable>
  </Section>
);

/* ── 6. Rollar kesimi ───────────────────────────────────────────────── */

const RoleSection = ({ byRole, index }) => (
  <Section title={`${index}. Rollar kesimi`}>
    <DocTable
      columns={[
        { label: "Rol" },
        { label: "Xodim", align: "right" },
        { label: "Berildi", align: "right" },
        { label: "Bajarildi", align: "right" },
        { label: "Muddati o'tgan", align: "right" },
        { label: "Bajarilish", align: "right" },
      ]}
    >
      {byRole.map((row) => (
        <Tr key={row.role}>
          <Td className="font-semibold">{text(row.roleName || row.role)}</Td>
          <Count value={row.people} tone="text-gray-900" />
          <Count value={row.assigned} tone="text-gray-900" />
          <Count value={row.completed} tone="text-emerald-700" />
          <Count value={row.overdue} tone="text-red-700" />
          <Td align="right">{docPercentText(row.rate)}</Td>
        </Tr>
      ))}
    </DocTable>

    <Note>
      ⚠️ &laquo;Xodim&raquo; ustuni QATORLAR sonini sanaydi: bir nechta
      filialda ishlaydigan odam har filialda alohida qator bo&apos;lgani
      uchun bu yerda ham alohida sanaladi.
    </Note>
  </Section>
);

/* ── 7–8. Yetakchilar va e'tibor ────────────────────────────────────── */

const PersonTable = ({ items, showBranch }) => (
  <DocTable
    columns={[
      { label: "№", align: "center", width: "6%" },
      { label: "F.I.Sh." },
      ...(showBranch ? [{ label: "Filial", width: "16%" }] : []),
      { label: "Berildi", align: "right" },
      { label: "Bajarildi", align: "right" },
      { label: "Muddati o'tgan", align: "right" },
      { label: "Bajarilish", align: "right" },
    ]}
  >
    {items.map((item, i) => (
      <Tr key={`${item.branchId ?? ""}-${item.userId}`}>
        <Td align="center" className="text-gray-500">
          {i + 1}
        </Td>
        <Td className="font-semibold">{text(item.name)}</Td>
        {showBranch && <Td className="text-gray-600">{text(item.branchName)}</Td>}
        <Count value={item.assigned} tone="text-gray-900" />
        <Count value={item.completed} tone="text-emerald-700" />
        <Count value={item.overdue} tone="text-red-700" />
        <Td align="right">{docPercentText(item.rate)}</Td>
      </Tr>
    ))}
  </DocTable>
);

const LeadersSection = ({ leaders, index, showBranch }) => (
  <Section title={`${index}. Yetakchilar`}>
    {leaders.length ? (
      <PersonTable items={leaders} showBranch={showBranch} />
    ) : (
      <p className="text-[10pt] text-gray-500">
        Davrda yakunlangan topshiriq yo&apos;q.
      </p>
    )}
  </Section>
);

const AttentionSection = ({ attention, index, showBranch }) => (
  <Section title={`${index}. E'tibor talab qiladi`}>
    {attention.length ? (
      <>
        <PersonTable items={attention} showBranch={showBranch} />
        <Note>
          Ro&apos;yxatga muddati o&apos;tgan ishi bor yoki kamida ikkita
          topshiriqdan yarmidan kamini bajargan xodimlar tushadi.
        </Note>
      </>
    ) : (
      <p className="text-[10pt] font-semibold text-emerald-700">
        Muddati o&apos;tgan ishi bor xodim yo&apos;q.
      </p>
    )}
  </Section>
);

/* ── 9. Xodimlar kesimi ─────────────────────────────────────────────── */

const PeopleSection = ({ people, index, showBranch }) => (
  <Section
    title={`${index}. Xodimlar kesimi (${people.length} ta qator)`}
    breakBefore
  >
    <DocTable
      minWidth={640}
      columns={[
        { label: "№", align: "center", width: "5%" },
        { label: "F.I.Sh." },
        ...(showBranch ? [{ label: "Filial", width: "14%" }] : []),
        { label: "Berildi", align: "right" },
        { label: "Bajarildi", align: "right" },
        { label: "Jarayonda", align: "right" },
        { label: "Muddati o'tgan", align: "right" },
        { label: "Bajarilish", align: "right" },
        { label: "O'z vaqtida", align: "right" },
      ]}
    >
      {people.map((item, i) => (
        <Tr key={`${item.branchId ?? ""}-${item.userId}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{text(item.name)}</Td>
          {showBranch && (
            <Td className="text-gray-600">{text(item.branchName)}</Td>
          )}
          <Count value={item.assigned} tone="text-gray-900" />
          <Count value={item.completed} tone="text-emerald-700" />
          <Count value={item.inProgress + item.review} tone="text-gray-900" />
          <Count value={item.overdue} tone="text-red-700" />
          <Td align="right">{docPercentText(item.rate)}</Td>
          <Td align="right" className="text-gray-500">
            {docPercentText(item.onTimeRate)}
          </Td>
        </Tr>
      ))}
    </DocTable>

    <Note>
      {showBranch
        ? "⚠️ Bir nechta filialda ishlaydigan xodim HAR FILIAL uchun alohida qatorda turadi: topshiriqni kim bergan, kim tekshirgan va jarimasi qayerda yozilgani — hammasi o'sha filialga tegishli. Yuqoridagi «Ijrochilar» soni esa odamlarni TAKRORSIZ sanaydi."
        : "Ro'yxat berilgan topshiriqlar soni bo'yicha kamayish tartibida."}
    </Note>
  </Section>
);

/* ── 10. Hozirgi holat ──────────────────────────────────────────────── */

const LiveSection = ({ live, index, showBranch }) => {
  const list = (items) => (
    <DocTable
      columns={[
        { label: "№", align: "center", width: "6%" },
        { label: "Topshiriq" },
        { label: "Ijrochi", width: "24%" },
        ...(showBranch ? [{ label: "Filial", width: "16%" }] : []),
        { label: "Muddat", align: "right", width: "18%" },
      ]}
    >
      {items.map((item, i) => (
        <Tr key={item.id}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{text(item.title)}</Td>
          <Td>{text(item.assignee?.name)}</Td>
          {showBranch && (
            <Td className="text-gray-600">{text(item.branchName)}</Td>
          )}
          <Td align="right">{formatDateUz(item.dueDate)}</Td>
        </Tr>
      ))}
    </DocTable>
  );

  return (
    <Section title={`${index}. Hozirgi holat`} breakBefore>
      <DocTable
        columns={[
          { label: "Ko'rsatkich" },
          { label: "Soni", align: "right", width: "18%" },
        ]}
      >
        <Tr highlight>
          <Td className="font-semibold">
            Muddati o&apos;tgan, hali bajarilmagan
          </Td>
          <Count value={live.counts.overdue} tone="text-red-700" bold />
        </Tr>
        <Tr>
          <Td>Muddati yaqin ({live.dueSoonHours} soat ichida)</Td>
          <Count value={live.counts.dueSoon} tone="text-amber-700" />
        </Tr>
        <Tr>
          <Td>Tekshiruv navbatida</Td>
          <Count value={live.counts.review} tone="text-amber-700" />
        </Tr>
      </DocTable>

      <Note>
        Bu uch raqam DAVRGA BOG&apos;LIQ EMAS — ular hisobot
        shakllantirilgan ondagi holat. Quyidagi ro&apos;yxatlarda eng
        kechikkan topshiriqlardan boshlab bir nechtasi keltirilgan.
      </Note>

      {live.overdue.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-1.5 text-[10.5pt] font-bold text-gray-900">
            Eng ko&apos;p kechikkan topshiriqlar
          </h3>
          {list(live.overdue)}
        </div>
      )}

      {live.review.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-1.5 text-[10.5pt] font-bold text-gray-900">
            Tekshiruv navbati
          </h3>
          {list(live.review)}
        </div>
      )}
    </Section>
  );
};

/* ── Hujjat ─────────────────────────────────────────────────────────── */

const TaskNetworkDocument = ({ report }) => {
  const net = Boolean(report.isNetwork);

  /**
   * ⚠️ BO'LIM RAQAMLARI BO'LIM BOR-YO'QLIGIDAN hisoblanadi va SERVER BILAN
   * AYNI SHARTLAR bo'yicha (`taskReportExport.service.js` →
   * `buildTaskReportDocx`):
   *
   *   Umumiy → [Filiallar] → Turlar → [Dinamika] → [Hafta kunlari] →
   *   [Rollar] → Yetakchilar → E'tibor → [Xodimlar] → Hozirgi holat
   *
   * Shartlardan BITTASI ikki tomonda boshqacha bo'lsa, ekrandagi "7-bo'lim"
   * fayldagi "6-bo'lim" bo'lib qolardi.
   */
  const order = [
    "summary",
    net && "branch",
    "shape",
    report.trend.length >= 2 && "trend",
    report.period.days >= 7 && "weekday",
    report.byRole.length > 0 && "role",
    "leaders",
    "attention",
    report.people.length > 0 && "people",
    "live",
  ].filter(Boolean);

  // ⚠️ Yo'q bo'lim uchun `null`: shartni ikki joyda yozmaslik uchun
  // ro'yxatning O'ZI "bo'lim bormi" degan savolga ham javob beradi.
  const indexOf = (key) => {
    const at = order.indexOf(key);
    return at === -1 ? null : at + 1;
  };

  const branchIndex = indexOf("branch");
  const trendIndex = indexOf("trend");
  const weekdayIndex = indexOf("weekday");
  const roleIndex = indexOf("role");
  const peopleIndex = indexOf("people");

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
          Xodimlar topshiriqlari hisoboti
        </h1>

        <p className="mt-1.5 text-[11pt] text-gray-900">
          Davr: {report.period.label}
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

      <SummarySection kpis={report.kpis} index={indexOf("summary")} />

      {net && (
        <BranchSection
          byBranch={report.byBranch}
          kpis={report.kpis}
          index={branchIndex}
        />
      )}

      <ShapeSection
        kinds={report.kinds}
        timing={report.timing}
        index={indexOf("shape")}
      />

      {trendIndex && <TrendSection trend={report.trend} index={trendIndex} />}

      {weekdayIndex && (
        <WeekdaySection weekday={report.weekday} index={weekdayIndex} />
      )}

      {roleIndex && <RoleSection byRole={report.byRole} index={roleIndex} />}

      <LeadersSection
        leaders={report.leaders}
        index={indexOf("leaders")}
        showBranch={net}
      />

      <AttentionSection
        attention={report.attention}
        index={indexOf("attention")}
        showBranch={net}
      />

      {peopleIndex && (
        <PeopleSection
          people={report.people}
          index={peopleIndex}
          showBranch={net}
        />
      )}

      <LiveSection
        live={report.live}
        index={indexOf("live")}
        showBranch={net}
      />

      <section className="mt-8 border-t border-gray-200 pt-3 text-[9pt] text-gray-500">
        <h3 className="mb-1 text-[10pt] font-bold text-gray-700">
          Hisobot haqida
        </h3>
        <p>
          Hisobot topshiriq BERILGAN sana bo&apos;yicha quriladi: shu davrda
          berilgan ishning qanchasi bajarilgani ko&apos;rsatiladi va bitta
          topshiriq ikki davrda ikki marta sanalmaydi. Xodim O&apos;ZIGA
          O&apos;ZI belgilagan topshiriqlar hisobotga KIRMAYDI — ular
          jarimasiz va tasdiqlashsiz yopiladi, ya&apos;ni rahbar bergan
          ishning intizomini ko&apos;rsatmaydi.
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
          Ma&apos;lumot manbai — platformadagi &laquo;Lavozimlar
          markazi&raquo; bo&apos;limi. Hujjat avtomatik shakllantirilgan.
        </p>
      </section>
    </article>
  );
};

export default TaskNetworkDocument;
