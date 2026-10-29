// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz, formatDateTimeUz } from "@/shared/utils/date.utils";
import { PHONE_PAIR_LABEL, phonePairLines } from "@/shared/utils/phone.utils";

// Data
import {
  MINUS,
  docToneOfNet,
  negativePercentText,
  percentText,
  signedNumber,
} from "../data/movement.data";

/**
 * O'QUVCHILAR HARAKATI — HUJJAT KO'RINISHI.
 *
 * ⚠️ BU EKRANDAGI WORD HUJJATINING O'ZI: bo'limlar, raqamlash va
 * jadvallar `studentMovementExport.service.js` dagi `.docx` bilan BIR
 * XIL tartibda. Foydalanuvchi "Word'da yuklab olish" ni bossa, aynan
 * ko'rib turgan hujjatni oladi — boshqacha bo'lsa, yuklab olingan fayl
 * "noto'g'ri" bo'lib ko'rinardi.
 *
 * ⚠️ RAQAM BU YERDA HISOBLANMAYDI. Hammasi serverdan keladi
 * (`studentMovement.service.js`): panel foizni o'zi hisoblasa, u Word
 * fayli bilan asta-sekin uzoqlashardi.
 *
 * ⚠️ HISOBOT HOZIRCHA FAQAT "UMUMIY — BARCHA FILIALLAR" ko'rinishida
 * ochiladi (`isNetwork: true`), lekin komponent bitta filial shaklini ham
 * biladi: server ikkalasini AYNI shaklda qaytaradi va farq faqat shu
 * bayroqda. Shunday qilingani — bir kun bo'lim filial ichida ham kerak
 * bo'lsa, bu yerda hech narsa o'zgarmasligi uchun.
 *
 * A4 o'lchovi (210 mm) ataylab: hujjat chop etilganda ham, Word'da
 * ochilganda ham bir xil ko'rinishi kerak. Kichik ekranda kenglik
 * qisqaradi, keng jadvallar esa o'z ichida suriladi.
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
 * ⚠️ GLOBAL `<table>` USLUBLARI BU YERDA O'CHIRILADI. `styles/index.css`
 * har bir jadvalga o'z ko'rinishini majburlaydi: ko'k sarlavha, OQ KATTA
 * HARFLAR, `min-w-[934px]` va oxirgi qatorga kulrang fon
 * (qo'shni bo'limlar shu sababdan `<table>` o'rniga grid ishlatadi).
 * Hujjatda esa sarlavha Word fayli bilan BIR XIL bo'lishi shart —
 * ekranda "KO'RSATKICH", faylda "Ko'rsatkich" bo'lib qolsa, yuklab
 * olingan fayl "boshqa hujjat" bo'lib ko'rinardi. Shuning uchun
 * `normal-case`, o'lcham va fon ANIQ yoziladi (utilities qatlami global
 * `base` qatlamidan ustun turadi).
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

/**
 * TELEFON KATAGI — ikki qator: o'quvchining o'z raqami, so'ng ota-onasiniki.
 *
 * ⚠️ Word nusxasida AYNI matn bitta katakda `<w:br/>` bilan ikki qator
 * bo'lib chiqadi (`studentMovementExport.service.js`). Nega ikkita ustun
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

/* ── Umumiy ko'rsatkichlar ───────────────────────────────────────── */

const SummarySection = ({ totals, index }) => {
  const hasMoves = totals.movedIn > 0 || totals.movedOut > 0;

  return (
  <Section title={`${index}. Umumiy ko'rsatkichlar`}>
    <DocTable
      columns={[
        { label: "Ko'rsatkich" },
        { label: "Soni", align: "right", width: "18%" },
        { label: "Foiz", align: "right", width: "18%" },
      ]}
    >
      <Tr>
        <Td>Davr boshida o&apos;qiyotganlar</Td>
        <Td align="right" className="font-bold">
          {totals.openCount}
        </Td>
        <Td align="right" className="text-gray-400">
          —
        </Td>
      </Tr>
      <Tr>
        <Td>Yangi kelganlar</Td>
        <Td align="right" className="font-bold text-emerald-700">
          {signedNumber(totals.joined)}
        </Td>
        <Td align="right" className="text-emerald-700">
          {percentText(totals.joinedPercent)}
        </Td>
      </Tr>
      <Tr>
        <Td className="pl-6 text-gray-500">shundan birinchi marta kelgan</Td>
        <Td align="right" className="text-gray-500">
          {totals.joinedNew}
        </Td>
        <Td align="right" className="text-gray-400">
          —
        </Td>
      </Tr>
      <Tr>
        <Td className="pl-6 text-gray-500">shundan qaytib kelgan</Td>
        <Td align="right" className="text-gray-500">
          {totals.joinedReturned}
        </Td>
        <Td align="right" className="text-gray-400">
          —
        </Td>
      </Tr>
      <Tr>
        <Td>Chiqib ketganlar</Td>
        <Td align="right" className="font-bold text-red-700">
          {totals.left ? `${MINUS}${totals.left}` : "0"}
        </Td>
        <Td align="right" className="text-red-700">
          {negativePercentText(totals.leftPercent)}
        </Td>
      </Tr>
      <Tr highlight>
        <Td className="font-bold">O&apos;zgarish (o&apos;sish / tushish)</Td>
        <Td align="right" className={cn("font-bold", docToneOfNet(totals.net))}>
          {signedNumber(totals.net)}
        </Td>
        <Td align="right" className={cn("font-bold", docToneOfNet(totals.net))}>
          {percentText(totals.growthPercent)}
        </Td>
      </Tr>
      {/* ⚠️ KO'CHISH "o'zgarish" bilan "davr oxirida" ORASIDA: jadval
          yuqoridan pastga o'qilganda arifmetika ko'rinib boradi. */}
      {hasMoves && (
        <>
          <Tr>
            <Td className="text-gray-600">
              Boshqa filialdan ko&apos;chib kelgan
            </Td>
            <Td align="right" className="text-gray-600">
              {signedNumber(totals.movedIn)}
            </Td>
            <Td align="right" className="text-gray-400">
              —
            </Td>
          </Tr>
          <Tr>
            <Td className="text-gray-600">
              Boshqa filialga ko&apos;chib ketgan
            </Td>
            <Td align="right" className="text-gray-600">
              {totals.movedOut ? `${MINUS}${totals.movedOut}` : "0"}
            </Td>
            <Td align="right" className="text-gray-400">
              —
            </Td>
          </Tr>
        </>
      )}

      <Tr>
        <Td>Davr oxirida o&apos;qiyotganlar</Td>
        <Td align="right" className="font-bold">
          {totals.closeCount}
        </Td>
        <Td align="right" className="text-gray-400">
          —
        </Td>
      </Tr>
    </DocTable>

    {/* Arifmetika OCHIQ yoziladi: rahbar raqamni qo'shib-ayirib tekshira
        olishi kerak (`BranchSplit` dagi AYNI qaror). */}
    <p className="mt-2 text-[8.5pt] text-gray-500">
      Foiz davr boshidagi o&apos;quvchilar soniga nisbatan hisoblangan: (
      {totals.joined} {MINUS} {totals.left}) ÷ {totals.openCount || 0}.
    </p>

    {/* ⚠️ IZOHSIZ "keldi 5, ketdi 2, lekin oxirida 20 ta ko'paydi" degan
        jadval hisob xatosi bo'lib o'qilardi. */}
    {hasMoves && (
      <p className="mt-1 text-[8.5pt] text-gray-500">
        Filiallararo ko&apos;chish &laquo;kelgan&raquo; va
        &laquo;ketgan&raquo; soniga KIRMAYDI: o&apos;quvchi maktabni tashlab
        ketmagan, faqat boshqa filialga o&apos;tgan. Shuning uchun davr
        oxiridagi son = davr boshi + kelgan {MINUS} ketgan + ko&apos;chib
        kelgan {MINUS} ko&apos;chib ketgan.
      </p>
    )}
  </Section>
  );
};

/* ── Oylar kesimi ────────────────────────────────────────────────── */

const MonthlySection = ({ byMonth, index }) => {
  // ⚠️ Ustun faqat haqiqatan ko'chish bo'lganda: doimiy "0" ustuni
  // jadvalni toraytirib, hech narsa aytmasdi.
  const hasMoves = byMonth.some((item) => item.movedIn || item.movedOut);

  return (
  <Section title={`${index}. Oylar kesimi`}>
    <DocTable
      columns={[
        { label: "Oy" },
        { label: "Oy boshida", align: "right" },
        { label: "Keldi", align: "right" },
        { label: "Ketdi", align: "right" },
        { label: "Farq", align: "right" },
        { label: "Foiz", align: "right" },
        ...(hasMoves ? [{ label: "Ko'chish", align: "right" }] : []),
        { label: "Oy oxirida", align: "right" },
      ]}
    >
      {byMonth.map((item) => (
        <Tr key={item.month} highlight={item.isCurrent}>
          <Td>
            {item.label}
            {item.isCurrent && (
              <span className="ml-1 text-[8pt] text-gray-500">
                (davom etmoqda)
              </span>
            )}
          </Td>
          <Td align="right">{item.openCount}</Td>
          <Td align="right" className={item.joined ? "text-emerald-700" : "text-gray-400"}>
            {signedNumber(item.joined)}
          </Td>
          <Td align="right" className={item.left ? "text-red-700" : "text-gray-400"}>
            {item.left ? `${MINUS}${item.left}` : "0"}
          </Td>
          <Td align="right" className={cn("font-bold", docToneOfNet(item.net))}>
            {signedNumber(item.net)}
          </Td>
          <Td align="right" className={docToneOfNet(item.net)}>
            {percentText(item.growthPercent)}
          </Td>
          {hasMoves && (
            <Td align="right" className="text-gray-500">
              {signedNumber(item.moveNet)}
            </Td>
          )}
          <Td align="right" className="font-bold">
            {item.closeCount}
          </Td>
        </Tr>
      ))}
    </DocTable>
  </Section>
  );
};

/* ── Filiallar kesimi (faqat umumiy ko'rinish) ──────────────────────── */

/**
 * ⚠️ TARMOQ JAMISI SAVOLNING FAQAT YARMIGA JAVOB BERADI: "+10" ning
 * orqasida bitta filial +40, boshqasi −30 bo'lishi mumkin va qaror aynan
 * shu farqqa qarab qabul qilinadi.
 *
 * ⚠️ "Jami" qatoridagi foiz ustunlardagi foizlarning O'RTACHASI EMAS — u
 * yig'indidan qayta hisoblangan (server, `combineMetrics`). Shuning uchun
 * jadval ostida buni ochiq yozadigan izoh turibdi: usiz raqam hisob
 * xatosi bo'lib ko'rinardi.
 */
const BranchSection = ({ byBranch, totals, index }) => {
  // ⚠️ Filial darajasida bu ENG MUHIM ustun: tarmoq jamisida ko'chish
  // o'zini yo'qotadi, filialda esa aynan u "nega o'sdi" ni tushuntiradi.
  const hasMoves = byBranch.some((item) => item.movedIn || item.movedOut);

  return (
  <Section title={`${index}. Filiallar kesimi`}>
    <DocTable
      columns={[
        { label: "Filial" },
        { label: "Davr boshida", align: "right" },
        { label: "Keldi", align: "right" },
        { label: "Ketdi", align: "right" },
        { label: "Farq", align: "right" },
        { label: "Foiz", align: "right" },
        ...(hasMoves ? [{ label: "Ko'chish", align: "right" }] : []),
        { label: "Davr oxirida", align: "right" },
      ]}
    >
      {byBranch.map((item) => (
        <Tr key={item.branchId}>
          <Td className="font-semibold">{item.branchName}</Td>
          <Td align="right">{item.openCount}</Td>
          <Td align="right" className={item.joined ? "text-emerald-700" : "text-gray-400"}>
            {signedNumber(item.joined)}
          </Td>
          <Td align="right" className={item.left ? "text-red-700" : "text-gray-400"}>
            {item.left ? `${MINUS}${item.left}` : "0"}
          </Td>
          <Td align="right" className={cn("font-bold", docToneOfNet(item.net))}>
            {signedNumber(item.net)}
          </Td>
          <Td align="right" className={docToneOfNet(item.net)}>
            {percentText(item.growthPercent)}
          </Td>
          {hasMoves && (
            <Td align="right" className="text-gray-500">
              {signedNumber(item.moveNet)}
            </Td>
          )}
          <Td align="right" className="font-bold">
            {item.closeCount}
          </Td>
        </Tr>
      ))}

      <Tr highlight>
        <Td className="font-bold">Jami (tarmoq)</Td>
        <Td align="right" className="font-bold">
          {totals.openCount}
        </Td>
        <Td align="right" className="font-bold text-emerald-700">
          {signedNumber(totals.joined)}
        </Td>
        <Td align="right" className="font-bold text-red-700">
          {totals.left ? `${MINUS}${totals.left}` : "0"}
        </Td>
        <Td align="right" className={cn("font-bold", docToneOfNet(totals.net))}>
          {signedNumber(totals.net)}
        </Td>
        <Td align="right" className={cn("font-bold", docToneOfNet(totals.net))}>
          {percentText(totals.growthPercent)}
        </Td>
        {hasMoves && (
          <Td align="right" className="font-bold text-gray-500">
            {signedNumber(totals.moveNet)}
          </Td>
        )}
        <Td align="right" className="font-bold">
          {totals.closeCount}
        </Td>
      </Tr>
    </DocTable>

    <p className="mt-2 text-[8.5pt] text-gray-500">
      Har filialning foizi O&apos;Z davr boshidagi soniga nisbatan
      hisoblangan. Tarmoq foizi esa filiallar foizining o&apos;rtachasi emas
      — u yig&apos;indidan qayta hisoblangan, ya&apos;ni katta filial
      natijaga ko&apos;proq ta&apos;sir qiladi.
    </p>
  </Section>
  );
};

/* ── Sabablar ────────────────────────────────────────────────────── */

const ReasonSection = ({ byReason, total, index }) => (
  <Section title={`${index}. Chiqib ketish sabablari`}>
    <DocTable
      columns={[
        { label: "Sabab" },
        { label: "Soni", align: "right", width: "18%" },
        { label: "Ulushi", align: "right", width: "18%" },
      ]}
    >
      {byReason.map((item) => (
        <Tr key={item.key}>
          <Td>{item.label}</Td>
          <Td align="right" className="font-bold">
            {item.count}
          </Td>
          <Td align="right" className="text-gray-600">
            {item.percent == null ? "—" : percentText(item.percent, { withSign: false })}
          </Td>
        </Tr>
      ))}
      <Tr highlight>
        <Td className="font-bold">Jami</Td>
        <Td align="right" className="font-bold">
          {total}
        </Td>
        <Td align="right" className="font-bold">
          {total ? "100,0%" : "—"}
        </Td>
      </Tr>
    </DocTable>
  </Section>
);

/* ── Kelganlar ───────────────────────────────────────────────────── */

/**
 * ⚠️ UMUMIY KO'RINISHDA "FILIAL" USTUNI QO'SHILADI (Word nusxasida ham):
 * tarmoq ro'yxatida "kim keldi" degan savolning javobi "qayerga keldi"
 * bilan birga bo'lmasa, ism sinf nomi bilan yolg'iz qolib, qaysi
 * filialniki ekani yo'qolardi.
 */
const JoinedSection = ({ items, index, showBranch }) => (
  <Section
    breakBefore
    title={`${index}. Yangi kelgan o'quvchilar${items.length ? ` (${items.length} ta)` : ""}`}
  >
    {items.length === 0 ? (
      <p className="text-gray-500">Bu davrda yangi o&apos;quvchi qabul qilinmagan.</p>
    ) : (
      <DocTable
        columns={[
          { label: "№", align: "center", width: "5%" },
          { label: "F.I.Sh." },
          { label: PHONE_PAIR_LABEL, width: showBranch ? "22%" : "24%" },
          ...(showBranch ? [{ label: "Filial", width: "14%" }] : []),
          { label: "Sinf", width: showBranch ? "13%" : "17%" },
          { label: "Kelgan sana", align: "center", width: showBranch ? "13%" : "16%" },
          { label: "Holati", align: "center", width: showBranch ? "11%" : "13%" },
        ]}
      >
        {items.map((item, i) => (
          <Tr key={item.id}>
            <Td align="center" className="text-gray-500">
              {i + 1}
            </Td>
            <Td className="font-semibold">{item.name}</Td>
            <PhoneTd contact={item} />
            {showBranch && <Td className="text-gray-600">{item.branchName || "—"}</Td>}
            <Td>{item.className || "—"}</Td>
            <Td align="center">{formatDateUz(item.date)}</Td>
            <Td
              align="center"
              className={item.kind === "new" ? "text-emerald-700" : "text-gray-500"}
            >
              {item.kindLabel}
            </Td>
          </Tr>
        ))}
      </DocTable>
    )}
  </Section>
);

/* ── Ketganlar ───────────────────────────────────────────────────── */

const LeftSection = ({ items, index, showBranch }) => (
  <Section title={`${index}. Chiqib ketgan o'quvchilar${items.length ? ` (${items.length} ta)` : ""}`}>
    {items.length === 0 ? (
      <p className="text-gray-500">Bu davrda birorta o&apos;quvchi maktabdan ketmagan.</p>
    ) : (
      <DocTable
        columns={[
          { label: "№", align: "center", width: "4%" },
          { label: "F.I.Sh." },
          { label: PHONE_PAIR_LABEL, width: showBranch ? "19%" : "21%" },
          ...(showBranch ? [{ label: "Filial", width: "11%" }] : []),
          { label: "Sinf", width: showBranch ? "10%" : "13%" },
          { label: "Ketgan sana", align: "center", width: showBranch ? "11%" : "13%" },
          { label: "Sababi", align: "center", width: showBranch ? "11%" : "13%" },
          { label: "Izoh", width: showBranch ? "14%" : "18%" },
        ]}
      >
        {items.map((item, i) => (
          <Tr key={item.id}>
            <Td align="center" className="text-gray-500">
              {i + 1}
            </Td>
            <Td className="font-semibold">{item.name}</Td>
            <PhoneTd contact={item} />
            {showBranch && <Td className="text-gray-600">{item.branchName || "—"}</Td>}
            <Td>{item.className || "—"}</Td>
            <Td align="center">{formatDateUz(item.date)}</Td>
            <Td align="center" className="text-red-700">
              {item.reasonLabel}
            </Td>
            {/* Toifa — faqat kesim uchun; "nega" degan savolning asl
                javobi aynan erkin izohda turadi. */}
            <Td className="text-gray-600">
              {[item.reasonNote, item.note].filter(Boolean).join(" · ") || "—"}
            </Td>
          </Tr>
        ))}
      </DocTable>
    )}
  </Section>
);

/* ── Filiallararo ko'chganlar ───────────────────────────────────────── */

/**
 * ⚠️ BU BO'LIM ULAR "KELDI/KETDI" DAN CHIQARILGANI UCHUN KERAK: jadvaldagi
 * "ko'chish: +12" raqamining orqasida kim borligi ko'rinmasa, sanoqchi jim
 * qolgan bo'lardi (`wipedByDiscount` bilan AYNI mulohaza). Ko'chish
 * bo'lmasa bo'lim umuman chizilmaydi.
 */
const MovedSection = ({ items, index }) => (
  <Section title={`${index}. Filiallararo ko'chganlar (${items.length} ta)`}>
    <DocTable
      columns={[
        { label: "№", align: "center", width: "5%" },
        { label: "F.I.Sh." },
        { label: PHONE_PAIR_LABEL, width: "20%" },
        { label: "Sinf", width: "13%" },
        { label: "Qaysi filialdan", align: "center", width: "15%" },
        { label: "Qaysi filialga", align: "center", width: "15%" },
        { label: "Sana", align: "center", width: "13%" },
      ]}
    >
      {items.map((item, i) => (
        <Tr key={`${item.studentId}-${item.date}`}>
          <Td align="center" className="text-gray-500">
            {i + 1}
          </Td>
          <Td className="font-semibold">{item.name}</Td>
          <PhoneTd contact={item} />
          <Td>{item.className || "—"}</Td>
          <Td align="center" className="text-gray-600">
            {item.fromBranch || "—"}
          </Td>
          <Td align="center" className="text-emerald-700">
            {item.toBranch || "—"}
          </Td>
          <Td align="center">{formatDateUz(item.date)}</Td>
        </Tr>
      ))}
    </DocTable>

    <p className="mt-2 text-[8.5pt] text-gray-500">
      Bu o&apos;quvchilar maktabni tashlab ketmagan — ular tarmoq ichida
      boshqa filialga o&apos;tgan, shuning uchun &laquo;kelgan&raquo; va
      &laquo;ketgan&raquo; ro&apos;yxatlariga kirmaydi.
    </p>
  </Section>
);

/* ── Hujjat ─────────────────────────────────────────────────────────── */

const MovementDocument = ({ report }) => {
  const net = Boolean(report.isNetwork);
  const hasMonthly = report.byMonth.length >= 2;

  /**
   * ⚠️ BO'LIM RAQAMLARI BO'LIM BOR-YO'QLIGIDAN hisoblanadi va SERVER BILAN
   * AYNI TARTIBDA (`studentMovementExport.service.js` → `buildMovementDocx`):
   *
   *   Umumiy → [Filiallar] → [Oylar] → Sabablar → Kelganlar → Ketganlar
   *
   * Ilgari ular qo'lda yozilib, oxirgi ikkitasi `hasMonthly ? 3 : 2` dan
   * chiqarilardi — yangi bo'lim ("Filiallar kesimi") qo'shilishi bilan
   * ekranda "3" ikki marta turib, yuklab olingan fayl bilan farq qilardi.
   */
  const optional = (net ? 1 : 0) + (hasMonthly ? 1 : 0);

  const summaryIndex = 1;
  const branchIndex = 2;
  const monthlyIndex = 2 + (net ? 1 : 0);
  const reasonIndex = 2 + optional;
  const joinedIndex = reasonIndex + 1;
  const leftIndex = reasonIndex + 2;
  const movedIndex = reasonIndex + 3;

  const moved = report.movedStudents ?? [];

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
          O&apos;quvchilar harakati hisoboti
        </h1>

        <p className="mt-1.5 text-[11pt] text-gray-900">
          Davr: {report.range.label}
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

      <SummarySection totals={report.totals} index={summaryIndex} />

      {net && (
        <BranchSection
          byBranch={report.byBranch}
          totals={report.totals}
          index={branchIndex}
        />
      )}

      {hasMonthly && (
        <MonthlySection byMonth={report.byMonth} index={monthlyIndex} />
      )}

      <ReasonSection
        byReason={report.byReason}
        total={report.totals.left}
        index={reasonIndex}
      />

      <JoinedSection
        items={report.joinedStudents}
        index={joinedIndex}
        showBranch={net}
      />

      <LeftSection
        items={report.leftStudents}
        index={leftIndex}
        showBranch={net}
      />

      {moved.length > 0 && (
        <MovedSection items={moved} index={movedIndex} />
      )}

      {/* Ikki xil "o'quvchilar soni" farqi — yashirilmaydi */}
      <section className="mt-8 border-t border-gray-200 pt-3 text-[9pt] text-gray-500">
        <h3 className="mb-1 text-[10pt] font-bold text-gray-700">
          Hisobot haqida
        </h3>
        <p>
          Ro&apos;yxatdagi o&apos;quvchilar (arxivlanmagan)
          {net ? " (barcha filiallar bo'yicha)" : ""}:{" "}
          {report.context.listed} ta. O&apos;qish davri ochiq o&apos;quvchilar:{" "}
          {report.context.studying} ta.
        </p>

        {report.context.withoutOpenEnrollment > 0 && (
          <p className="mt-0.5">
            Farq: {report.context.withoutOpenEnrollment} ta o&apos;quvchining
            o&apos;qish davri yopilgan yoki umuman yozilmagan — ular hisobotda
            &laquo;o&apos;qiyotgan&raquo; deb sanalmaydi.
          </p>
        )}

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
          Ma&apos;lumot manbai — o&apos;quvchilarning o&apos;qish davrlari:
          davrning ochilishi &laquo;keldi&raquo;, yopilishi esa
          &laquo;ketdi&raquo; degani. Hujjat platformada avtomatik
          shakllantirilgan.
        </p>
      </section>
    </article>
  );
};

export default MovementDocument;
