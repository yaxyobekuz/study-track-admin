// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "@/shared/components/dashboard/MiniTable";
import CardLink from "./CardLink";

// Hooks
import useFitRows from "@/shared/hooks/useFitRows";
import useMediaQuery from "@/shared/hooks/useMediaQuery";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { formatByUnit, gradeTone, linkLabel, percentTone } from "../data/academicDashboard.data";
// ⚠️ Tipografiya, ton va harakat FAQAT dizayn tizimidan. Komponentda
// qo'lda yozilgan "text-[11px] text-gray-400" QOLMAYDI — aks holda uchta
// jadval bir-biridan va qolgan kartalardan jimgina ajralib ketadi.
import { MOTION, T, TONE, contentDelay } from "../data/dashboard.tokens";
// ⚠️ Bir ekranli rejim sharti YAGONA manbadan (`tailwind.config.js` dagi
// `fitscreen` ekrani bilan aynan bir xil matn) — nusxa ko'chirilgan
// media so'rovi ikki rejim orasida jimgina ajralib ketardi.
import { FIT_QUERY } from "../data/fitscreen.data";

/**
 * Dashboard jadvallarining UMUMIY uslubi.
 *
 * ⚠️ `MiniTable` ning O'ZI o'zgartirilmaydi: u SHARED va moliya
 * dashboardi ham undan foydalanadi — ustun sarlavhasining o'lchamini u
 * yerda o'zgartirsak, ikkinchi ekran jimgina siljib ketardi. Shuning
 * uchun maket o'lchamlari shu faylda, utility qatlamidagi variantlar
 * bilan beriladi (`[&_th]:...`) — ular faqat shu fayldagi jadvallarga
 * tegadi.
 */
const TABLE = [
  // ⚠️ `min-w-0 table-fixed` — GORIZONTAL SURGICH TAQIQLANGAN. `MiniTable`
  // ildizida `min-w-max` turibdi: u jadvalni eng uzun katak bo'yicha
  // kengaytirib, kartadan chiqarib yuborardi va karta ichida ikkinchi
  // (yotiq) surgich paydo bo'lardi. `table-fixed` esa ustun kengligini
  // sarlavhadan oladi — jadval har doim kartaning kengligiga sig'adi,
  // uzun matn esa `truncate` bilan qisqaradi (to'liq matni `title` da).
  "min-w-0 table-fixed",

  // Katak matni JADVAL ILDIZIDA beriladi va meros bo'lib tushadi: variant
  // bilan (`[&_td]:...`) berilsa, u alohida katakdagi rangdan kuchliroq
  // bo'lib qolib, "ismi to'q, raqami kulrang" degan tafovutni yozib
  // bo'lmasdi. Manba — `T.tableCell` (12.5px, slate-700).
  T.tableCell,

  // ⚠️ Sarlavha QAT'IY 34px va IKKI QATORGA o'ralishi mumkin
  // (`whitespace-normal`). Sig'dirish uchun "O'rtacha baho" ni "Baho" ga
  // qisqartirish maketdan chekinish bo'lardi; o'ralish esa maketdagi
  // matnni saqlaydi va balandlikni baribir qat'iy qoldiradi —
  // `useFitRows` aynan shunga tayanadi.
  // `break-words` — HIMOYA: `whitespace-normal` faqat BO'SHLIQdan
  // o'radi, ustundan kengroq BITTA so'z esa katakdan chiqib, qo'shnisining
  // ustiga tushardi. O'lchov bo'yicha hozir eng uzun yorliq ("TOPSHIRIQ")
  // ustun ichiga 0.1px bilan sig'yapti — bu sinf o'sha chekkani
  // xavfsiz qiladi va matn sig'gan holatda hech narsani o'zgartirmaydi.
  "[&_thead_th]:h-[34px] [&_thead_th]:whitespace-normal [&_thead_th]:break-words",
  "[&_thead_th]:leading-[1.15]",
  "[&_thead_th]:pb-1 [&_thead_th]:align-bottom",

  // JADVAL BOSHI — `T.tableHead` ning KO'ZGUSI (fonli, semibold,
  // uppercase, slate-500). `MiniTable` (SHARED) `thead` ga sinf qabul
  // qilmaydi va tokenni `[&_thead_th]:` variantiga dasturiy prefiks
  // bilan o'girib bo'lmaydi — Tailwind sinf nomini MANBA MATNIDAN
  // skanerlaydi, yig'ilgan satr CSS'ga tushmaydi. Shuning uchun token
  // shu yerda so'zma-so'z takrorlanadi; tokenda o'zgarish bo'lsa shu
  // qatorlar ham yangilanadi.
  //
  // ⚠️ TRACKING ATAYLAB `tracking-wide` (0.025em), tokendagi 0.06em EMAS:
  // ustun kengliklari pikselgacha O'LCHANGAN ("TOPSHIRIQ" 2xl da ustun
  // ichiga 0.1px bilan sig'adi, "O'RTACHA" xl da ≈3px zaxira bilan).
  // 0.06em har harfga +0.35px qo'shib, 8-9 harfli yorliqni ~3px
  // kengaytiradi — u UCH qatorga o'ralib, 34px sarlavha o'sib ketardi va
  // `useFitRows` oxirgi qatorni yarim kesardi (uch marta rad etilgan
  // nuqson). Fon, vazn, rang va o'lcham tokendagidek.
  "[&_thead_th]:text-[10px] [&_thead_th]:font-semibold [&_thead_th]:uppercase",
  "[&_thead_th]:tracking-wide [&_thead_th]:text-slate-500 [&_thead_th]:bg-slate-50/80",

  // ⚠️ QATOR BALANDLIGI QAT'IY (26px). O'lchov shu songa tayanadi: katak
  // ichidagi matn balandlikni o'zgartira olsa (`py-*`, ko'p qatorli matn),
  // hisob bir qatorga adashib, oxirgi qator yarim ko'rinib qolardi.
  "[&_tbody_tr]:h-[26px]",
  "[&_tbody_td]:h-[26px] [&_tbody_td]:py-0 [&_tbody_td]:leading-none [&_tbody_td]:truncate",

  // ⚠️ UCH USTUNLI TO'RDA (xl dan boshlab) katak yon bo'shlig'i 12 → 6px.
  // O'LCHANGAN: 1280px da (yon panel ochiq, karta ~325px, jadval ~301px)
  // `px-3` bilan besh ustunli jadvalda ustun ichiga 32px qolib,
  // "O'QUVCHILAR" (≈75px) va "DAVOMAT" (≈55px) `break-words` bilan
  // HARFMA-HARF bo'linib sarlavhani 68-84px qilardi — oxirgi qator yarim
  // kesilardi (foydalanuvchi uch marta rad etgan nuqson). 1920px da ham
  // (karta ~539px, olti ustun) `px-3` "O'RTACH/A BAHO", "TOPSHIR/IQ" deb
  // bo'lardi — shuning uchun 2xl da ham `px-3` QAYTMAYDI. xl dan tor
  // ekranda to'r bir ustunli va jadval keng — `MiniTable` ning `px-3` i.
  "xl:[&_th]:px-1.5 xl:[&_td]:px-1.5",
].join(" ");

/**
 * Sarlavha yorlig'ining IKKI SHAKLI — tor kartada (xl..2xl) qisqasi.
 *
 * ⚠️ Faqat sarlavha matni; ma'lumot ustuni o'zgarmaydi. "O'QUVCHILAR SONI"
 * so'zi tor ustunga (≈62px) sig'maydi (≈75px) va harfma-harf bo'linardi;
 * "O'QUVCHI" (≈55px) sig'adi. xl dan tor ekranda to'r bir ustunli, jadval
 * keng — to'liq shakl qaytadi.
 */
const narrowLabel = (full, short) => (
  <>
    <span className="xl:hidden 2xl:inline">{full}</span>
    <span className="hidden xl:inline 2xl:hidden">{short}</span>
  </>
);

/**
 * O'LCHOV KONSTANTALARI — jadvalning O'Z CSS'idan olingan.
 *
 * ⚠️ `ROW_H` qator balandligidan 1px KATTA: qatorlar orasida `border-t`
 * bor va u ham joy egallaydi. Ataylab ORTIG'I bilan olinadi — kam olinsa
 * oxirgi qator kesilardi (taqiqlangan), ko'p olinsa faqat bir necha piksel
 * bo'sh joy qoladi.
 */
const ROW_H = 27;
/** Sarlavha 34px + 2px zaxira (uch qatorga o'ralib ketgan uzun yorliq uchun). */
const HEAD_H = 36;
/** JAMI qatori ham oddiy qator balandligida. */
const TOTAL_ROW_H = ROW_H;
/** Eng kam qator: bittasi qolgan jadval "ro'yxat" bo'lib ko'rinmaydi. */
const MIN_ROWS = 2;

/**
 * ⚠️ `useFitRows` ga `max` MA'LUMOTDAN BERILMAYDI (`rows.length` emas).
 * Hook `max` ni DASTLABKI qiymat sifatida ham ishlatadi, birinchi
 * renderda esa ro'yxat hali bo'sh — ya'ni `max` nol bo'lardi va
 * `ResizeObserver` yo'q muhitda (jsdom komponent testi, juda eski
 * brauzer) jadval ma'lumot kelgandan keyin ham BO'SH qolardi.
 * Chegarasiz qiymat esa o'sha muhitda halol zaxira beradi: hamma qator
 * chiziladi, sahifa odatdagidek oqadi. Ko'rinadigan sonni baribir
 * `rows.slice` cheklaydi.
 */
const NO_MAX = Infinity;

/**
 * Qatorlar orasidagi ingichka chiziq. Birinchi qatorniki to'qroq — u
 * ayni paytda fonli sarlavha bilan tana orasidagi chiziq vazifasini
 * bajaradi (`MiniTr` har qatorga `border-t` beradi, shuning uchun
 * sarlavhaga alohida `border-b` qo'yilsa, ikki qavat chiziq bo'lib
 * ko'rinardi).
 */
const rowTone = (index) => (index === 0 ? "border-slate-100" : "border-slate-50");

/**
 * Qator: hover foni (`T.tableRow`) + chiziq toni.
 *
 * ⚠️ Qator ALOHIDA ANIMATSIYA QILINMAYDI. Ilgari har qator chapdan
 * stagger bilan kirardi — bu "bachkana" o'qildi. Endi butun jadval tanasi
 * BITTA `fade-up` bilan, karta kirganidan keyin (`contentDelay`) kiradi:
 * konteyner → kontent, motion dizayn tamoyili.
 *
 * ⚠️ `hover:bg-slate-50` `MiniTable` dagi `[&_tbody_tr]:bg-transparent`
 * dan kuchliroq (spetsifikasi 0,2,0 > 0,1,2) — shuning uchun ishlaydi.
 */
const rowClass = (index) => cn(rowTone(index), T.tableRow);

/**
 * JAMI qatori — `T.tableTotal` (bold, slate-900, slate-200 chiziq, fon).
 *
 * ⚠️ Fon KATAKLARGA ham beriladi: `MiniTable` (SHARED) dagi
 * `[&_tbody_tr]:bg-transparent` (0,1,2) qatorning o'z `bg-slate-50` idan
 * (0,1,0) kuchliroq va uni yutib yuborardi. Katakdagi fon esa qatorning
 * o'zi shaffof bo'lsa ham ko'rinadi. Bu tipografiya emas, spetsifika
 * chetlab o'tish — shuning uchun tokenda emas, shu yerda.
 */
const TOTAL_ROW = cn(T.tableTotal, "[&>td]:bg-slate-50");

/**
 * FOIZ KATAGI — raqam TON RANGIDA va SEMIBOLD, ostida 2px chiziqcha,
 * kengligi = foiz, rangi raqamniki (`bg-current`).
 *
 * Chiziqcha `absolute` va raqamning `inline-block` o'ramiga nisbatan
 * joylashadi: katak balandligi (26px) O'ZGARMAYDI. Raqam `leading-none`
 * bilan ~12px, katakda vertikal markazda — ostida ~7px zaxira bor,
 * chiziqcha 3px pastda turadi va katakning `overflow: hidden`
 * (`truncate`) chegarasidan chiqmaydi.
 *
 * Rang `percentTone` dan (YAGONA shkala, `academicDashboard.data.js`),
 * vazn `T.tableNum` dan — `twMerge` tokendagi `text-slate-900` ni ton
 * rangi bilan almashtiradi, `font-semibold tabular-nums` qoladi. Bu
 * ikkinchi rang xaritasi EMAS: raqam ham, chiziqcha ham bitta manbadan.
 *
 * `null` qiymatda chiziqcha chizilmaydi — "—" ostida bo'sh chiziq
 * "0%" deb o'qilardi.
 *
 * `delay` — kartadan keyingi kontent kechikishi (ms): chiziqcha tana
 * kirganidan keyin o'sadi (`grow-x`).
 */
const PercentCell = ({ value, delay = 0 }) => {
  const number = value == null ? null : Math.max(0, Math.min(100, Number(value)));

  return (
    <MiniTd align="right" className={cn(T.tableNum, percentTone(value))}>
      <span className="relative inline-block">
        {formatByUnit(value, "percent")}
        {number != null && (
          <span
            aria-hidden
            className={cn(
              "absolute -bottom-[3px] left-0 h-0.5 rounded-full bg-current opacity-60",
              MOTION.growX,
            )}
            style={{ width: `${number}%`, animationDelay: `${delay}ms` }}
          />
        )}
      </span>
    </MiniTd>
  );
};

/**
 * O'LCHANADIGAN KONTEYNER.
 *
 * `h-full` — fitscreen rejimida ota maydon (`DashboardCard` tanasi)
 * qat'iy balandlikda bo'ladi va bu div aynan shuni oladi; oddiy oqimda
 * esa `h-full` hech narsani o'zgartirmaydi (ota balandligi `auto`).
 *
 * ⚠️ `overflow-hidden`, `overflow-y-auto` EMAS: karta ichida surgich
 * bo'lmaydi. Bu yerda `overflow-hidden` "kesib tashlash" uchun emas —
 * sig'maydigan qator umuman chizilmaydi — u faqat bir kadrlik nomuvofiqlik
 * (ma'lumot keldi, o'lchov hali yetib bormadi) ekranga chiqmasligi uchun
 * turibdi.
 *
 * ⚠️ KIRISH ANIMATSIYASI BU DIVDA EMAS, ichidagi `Enter` o'ramida.
 * `useFitRows` dastlabki o'lchovni `getBoundingClientRect` bilan oladi,
 * u esa `transform` ni HISOBGA OLADI: `fade-up` ning `scale(.985)`
 * kadrida balandlik ~2px kam o'lchanib, bitta qator yo'qolishi mumkin
 * edi. Ichki o'ram esa o'lchovga umuman ta'sir qilmaydi.
 */
const BODY = "h-full min-h-0 overflow-hidden";

/**
 * Jadval tanasining KIRISHI — bitta `fade-up`, karta kechikishi + 140ms
 * (`contentDelay`). Faqat `opacity`/`transform`: layout va o'lchov
 * o'zgarmaydi.
 */
const Enter = ({ delay, children }) => (
  <div className={MOTION.enter} style={{ animationDelay: `${contentDelay(delay)}ms` }}>
    {children}
  </div>
);

/**
 * SINFLAR BO'YICHA NATIJA — dizayndagidek SINF DARAJALARI kesimida
 * (1-4, 5-6, 7-8, 9-11).
 *
 * ⚠️ Manba `data.levels`: dizayndagi jadval to'rt qatordan iborat va u
 * yerda "9-A", "9-B" emas, bosqichlar turadi. Har bir sinf kesimi
 * kerak bo'lganda pastdagi havola `/classes` sahifasiga olib boradi.
 *
 * ⚠️ Oxirgi qator — JAMI/O'RTACHA va u serverdagi KPI kartasi bilan AYNAN
 * bir xil manbadan olinadi (`data.kpi`), jadval ustunlarini qo'shib
 * chiqarilmaydi: ikki joyda ikki xil hisob bo'lsa, ular bir kun kelib
 * ajralib ketardi.
 *
 * ⚠️ JAMI qatori HAR DOIM chiziladi va O'LCHOVDAN TASHQARIDA: uning
 * balandligi `headerHeight` ga QO'SHIB yuboriladi, ya'ni bosqich
 * qatorlariga qolgan joy o'shancha kam bo'ladi. Aks holda eng muhim
 * qator — yig'indi — birinchi bo'lib kesilib qolardi. (U jismonan shu
 * jadvalda qoladi, chunki ustunlar bir xil kenglikda turishi shart:
 * alohida element qilib chiqarilsa, ikkinchi jadvalning ustunlari
 * birinchisiga tekislanmasdi.)
 *
 * ⚠️ "O'quvchilar soni" ustunining YIG'INDISI JAMI ga TENG. Buni server
 * ta'minlaydi: har o'quvchi faqat bitta sinfga sanaladi va sinfga
 * biriktirilmaganlari "Boshqa sinflar" qatoriga tushadi.
 *
 * `delay` — kartaning to'rdagi kirish kechikishi (ms), sahifadan keladi;
 * kontent undan +140ms keyin kiradi.
 */
export const ClassesCard = ({ data, isLoading, isError, delay = 0 }) => {
  const rows = data?.levels ?? [];
  const hasTotal = Boolean(data?.kpi);

  // ⚠️ "A'lo va yaxshi" ustuni SHARTLI: baho qo'yilmagan oyda bo'sh ustun
  // chizib qo'yish "bu daraja bo'yicha ma'lumot yo'q" degan yolg'on
  // taassurot berardi.
  const hasQuality = rows.some((row) => row.qualityRate != null);

  const isFit = useMediaQuery(FIT_QUERY);
  const [bodyRef, fitRows] = useFitRows({
    rowHeight: ROW_H,
    // JAMI qatori bor bo'lsa uning joyi OLDINDAN ajratiladi
    headerHeight: HEAD_H + (hasTotal ? TOTAL_ROW_H : 0),
    min: MIN_ROWS,
    max: NO_MAX,
  });

  const visible = rows.slice(0, isFit ? fitRows : rows.length);
  const hidden = rows.length - visible.length;
  const barDelay = contentDelay(delay);

  return (
    <DashboardCard
      title="Sinflar bo'yicha natija"
      hint={data ? `${data.monthLabel} · bosqichlar kesimi` : ""}
      category="classes"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Sinf ma'lumoti yo'q"
      dense
      footer={<CardLink to="/classes">{linkLabel("Barcha sinflar bo'yicha", hidden)}</CardLink>}
    >
      <div ref={bodyRef} className={BODY}>
        <Enter delay={delay}>
          <MiniTable
            // Birinchi ustun — bosqich nomi ("9-11 sinflar"), qolganlari raqam:
            // `table-fixed` da kenglik sarlavhadan olinadi, shuning uchun nomga
            // ataylab kengroq ulush beriladi
            className={cn(
              TABLE,
              "[&_th:nth-child(1)]:w-[26%]",
              // ⚠️ "A'lo va yaxshi" ustuni TOR KARTADA (xl..2xl) YASHIRINADI:
              // besh ustun 301px ga sig'maydi — O'LCHANGAN (yuqoridagi
              // `TABLE` izohi). Yo'qotish eng kami: umumiy sifat KPI kartasida
              // turibdi, bosqich kesimi esa 2xl dan keng ekranda qaytadi.
              // `nth-child(4)` faqat `hasQuality` da sifat ustuni — aks holda u
              // "Davomat" bo'lardi.
              hasQuality &&
                "xl:[&_th:nth-child(4)]:hidden xl:[&_td:nth-child(4)]:hidden 2xl:[&_th:nth-child(4)]:table-cell 2xl:[&_td:nth-child(4)]:table-cell",
            )}
            columns={[
              { label: "Sinf" },
              { key: "students", label: narrowLabel("O'quvchilar soni", "O'quvchi"), align: "right" },
              { label: "O'rtacha baho", align: "right" },
              ...(hasQuality ? [{ label: "A'lo va yaxshi", align: "right" }] : []),
              { label: "Davomat", align: "right" },
            ]}
          >
            {visible.map((row, index) => (
              <MiniTr key={row.key} className={rowClass(index)}>
                <MiniTd className={T.tableName} title={row.label}>
                  {row.label}
                </MiniTd>
                <MiniTd align="right">{formatByUnit(row.studentCount, "count")}</MiniTd>
                {/* ⚠️ Rang SHKALADAN (`gradeTone` / `percentTone`), qo'lda
                    yozilgan `text-emerald-600` dan emas: qotib qolgan yashil
                    bilan 2.10 lik o'rtacha baho ham, 45% lik davomat ham
                    "yaxshi" bo'lib ko'rinardi. Vazn `T.tableNum` dan —
                    ton rangi `twMerge` orqali tokendagi rangni almashtiradi. */}
                <MiniTd align="right" className={cn(T.tableNum, gradeTone(row.average))}>
                  {formatByUnit(row.average, "grade")}
                </MiniTd>
                {/* Chiziqcha tana kirganidan KEYIN o'sadi (karta + 140ms) */}
                {hasQuality && <PercentCell value={row.qualityRate} delay={barDelay} />}
                <PercentCell value={row.attendanceRate} delay={barDelay} />
              </MiniTr>
            ))}

            {hasTotal && (
              <MiniTr className={TOTAL_ROW}>
                <MiniTd>Jami / O'rtacha</MiniTd>
                <MiniTd align="right">{formatByUnit(data.kpi.students?.value, "count")}</MiniTd>
                <MiniTd align="right">{formatByUnit(data.kpi.averageGrade?.value, "grade")}</MiniTd>
                {hasQuality && (
                  <MiniTd align="right">
                    {formatByUnit(data.kpi.qualityRate?.value, "percent")}
                  </MiniTd>
                )}
                <MiniTd align="right">
                  {formatByUnit(data.kpi.attendanceRate?.value, "percent")}
                </MiniTd>
              </MiniTr>
            )}
          </MiniTable>
        </Enter>
      </div>
    </DashboardCard>
  );
};

/**
 * SERVER CHEGARASI: har fandan bitta, jami beshta qator.
 *
 * ⚠️ Bu `useFitRows` ning o'rnini bosmaydi — u YUQORI chegara: sarlavhada
 * "top 5" deb yozilgan va server ham beshta yuboradi (`TOP_STUDENT_LIMIT`).
 * Chegara ikki joyda ajralib ketsa, "top 5" nomli kartada oltita qator
 * turib qolardi. Nechtasi CHIZILISHINI esa baribir o'lchov hal qiladi.
 */
const TOP_STUDENT_ROWS = 5;

/**
 * FANLAR BO'YICHA TOP 5 O'QUVCHI.
 *
 * ⚠️ Har fandan BITTA o'quvchi. Bitta fandan besh o'quvchi chiqsa, jadval
 * "eng kuchli sinf" ro'yxatiga aylanib qolardi.
 *
 * ⚠️ Ro'yxatga kamida uchta bahosi bor o'quvchi tushadi: bittagina "5"
 * olgan o'quvchi o'rtachasi 5.00 bilan boshiga chiqib, butun jadvalni
 * ishonchsiz qilardi.
 *
 * ⚠️ Sarlavha yonida OY TANLAGICHI YO'Q, faqat oy YORLIG'I turadi:
 * ma'lumot butun dashboard bilan bitta so'rovdan keladi (`overview`), ya'ni
 * bu karta o'z oyini mustaqil tanlay olmaydi.
 *
 * Ierarxiya: o'quvchi ismi QORA-QALIN (`T.tableName`) — qator kim haqida
 * ekani birinchi o'qiladi; fan va sinf ikkilamchi (`T.tableSub`); baho
 * asosiy raqam (`T.tableNum`).
 */
export const TopStudentsCard = ({ data, isLoading, isError, delay = 0 }) => {
  const rows = (data?.topStudents ?? []).slice(0, TOP_STUDENT_ROWS);

  const isFit = useMediaQuery(FIT_QUERY);
  const [bodyRef, fitRows] = useFitRows({
    rowHeight: ROW_H,
    headerHeight: HEAD_H,
    min: MIN_ROWS,
    max: NO_MAX,
  });

  const visible = rows.slice(0, isFit ? fitRows : rows.length);
  const hidden = rows.length - visible.length;

  return (
    <DashboardCard
      title="Fanlar bo'yicha top 5 o'quvchi"
      // ⚠️ Oy yorlig'i `action` da EMAS, izoh satrida — qolgan sakkiz
      // kartadagi kabi. Sarlavha yonida turganda u bir ekranli rejimda
      // o'z qatoriga tushib (yoki sarlavhani qisqartirib), kartaning
      // o'lchanadigan maydonidan 24px, ya'ni deyarli bitta QATOR
      // o'g'irlardi.
      hint={
        data?.monthLabel
          ? `${data.monthLabel} · har fanning eng yuqori o'rtachasi · kamida 3 ta baho`
          : "Har fanning eng yuqori o'rtachasi · kamida 3 ta baho"
      }
      category="students"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Yetarli baho yo'q"
      dense
      footer={<CardLink to="/grades">{linkLabel("Barcha fanlar bo'yicha", hidden)}</CardLink>}
    >
      <div ref={bodyRef} className={BODY}>
        <Enter delay={delay}>
          <MiniTable
            // Ikkita NOM ustuni (fan, o'quvchi) uchun kengroq ulush; sinf va
            // baho ustunlari kalta qiymat saqlaydi
            className={cn(
              TABLE,
              "[&_th:nth-child(1)]:w-[28%] [&_th:nth-child(2)]:w-[32%] [&_th:nth-child(3)]:w-[16%]",
            )}
            columns={[
              { label: "Fan" },
              { label: "O'quvchi" },
              { label: "Sinf" },
              { label: "O'rtacha baho", align: "right" },
            ]}
          >
            {visible.map((row, index) => (
              <MiniTr key={row.subjectId} className={rowClass(index)}>
                <MiniTd className={T.tableSub} title={row.subjectName}>
                  {row.subjectName}
                </MiniTd>
                <MiniTd className={T.tableName} title={row.studentName}>
                  {row.studentName}
                </MiniTd>
                <MiniTd className={T.tableSub}>{row.className}</MiniTd>
                <MiniTd align="right" className={T.tableNum}>
                  {formatByUnit(row.average, "grade")}
                </MiniTd>
              </MiniTr>
            ))}
          </MiniTable>
        </Enter>
      </div>
    </DashboardCard>
  );
};

/**
 * O'qituvchi ismi oldidagi rangli nuqta palitrasi.
 *
 * ⚠️ Sinf nomlari TO'LIQ yozilgan: Tailwind sinflarni manba matnidan
 * skanerlaydi va `bg-${color}-500` kabi yig'ilgan nom CSS'ga umuman
 * tushmaydi. Nuqta MA'NO TASHIMAYDI — u faqat uzun ro'yxatda qatorni
 * ko'z bilan ajratish uchun, shuning uchun indeks bo'yicha aylanadi.
 *
 * ⚠️ Hover'da KATTALASHMAYDI (ilgari `group-hover:scale-125` bor edi):
 * "zoom" mikro-harakat bachkana o'qildi. Qator hover'i faqat fon.
 */
const TEACHER_DOTS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-cyan-500",
];

/**
 * O'QITUVCHILAR KPI JADVALINING USTUN KENGLIKLARI.
 *
 * ⚠️ "Fan" ustuni `2xl` dan kichik ekranda YASHIRILADI. Sabab: karta
 * to'rning uchdan biri (≈370px) va olti ustun u yerga sig'masdi — ilgari
 * shu sababli karta ichida YOTIQ SURGICH bor edi, u ham "karta ichidagi
 * scroll", ya'ni taqiqlangan. Yashirish uchun eng kam ma'lumot yo'qotadigan
 * ustun tanlandi: KPI ballning o'zi fan bo'yicha emas, o'qituvchi bo'yicha
 * hisoblanadi, fan esa o'qituvchi ismidan taxmin qilinadi.
 *
 * ⚠️ `nth-child` bilan beriladi, chunki `MiniTable` (SHARED) ustunga
 * `className` qabul qilmaydi va uni faqat shu karta uchun o'zgartirish
 * moliya dashboardidagi jadvallarga ham tegib ketardi.
 */
const TEACHERS_TABLE = [
  // ⚠️ 28% (ilgari 34%): tor kartada (xl..2xl) qolgan uch ustunga ≈72px,
  // ichiga ≈60px qoladi — "O'RTACHA" (≈57px) va "DAVOMAT" (≈55px)
  // bo'linmay sig'adi. 34% da ustun ichi 54px edi va "O'RTACHA" harfma-harf
  // bo'linardi. Ism 72px da `truncate` bilan qisqaradi (to'liq `title` da).
  "[&_th:nth-child(1)]:w-[28%]",
  "[&_th:nth-child(2)]:hidden [&_td:nth-child(2)]:hidden",
  "2xl:[&_th:nth-child(2)]:table-cell 2xl:[&_td:nth-child(2)]:table-cell",
  // 2xl da olti ustun: ism 24% + fan 16% → qolgan to'rttasiga 15% dan
  // (539px kartada ≈77px, ichi ≈65px) — "O'RTACHA" va "TOPSHIRIQ"
  // bo'linmay sig'adi (26% + 18% da ustun ichi 48px edi va so'zlar
  // "O'RTACH/A" deb sinardi — O'LCHANGAN, 1920×965).
  "2xl:[&_th:nth-child(1)]:w-[24%] 2xl:[&_th:nth-child(2)]:w-[16%]",
  // ⚠️ "Topshiriq" ham TOR KARTADA (xl..2xl) yashirinadi: "Fan" siz ham
  // besh ustun 301px ga sig'maydi (O'LCHANGAN — `TABLE` izohi). Yo'qotish
  // eng kami: KPI ballda uning vazni 0.2 (uchtadan eng kichigi) va ball
  // ustuni o'z joyida qoladi. xl dan tor ekranda jadval keng — ustun
  // ko'rinadi; 2xl dan keng ekranda ham qaytadi.
  "xl:[&_th:nth-child(5)]:hidden xl:[&_td:nth-child(5)]:hidden",
  "2xl:[&_th:nth-child(5)]:table-cell 2xl:[&_td:nth-child(5)]:table-cell",
].join(" ");

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
 *
 * ⚠️ Kartada nechta qator turishini O'LCHOV hal qiladi (`useFitRows`),
 * qat'iy son emas: baland ekranda o'nta ham sig'adi, pastroq ekranda esa
 * to'rttasi — ikkala holatda ham na kesilgan qator, na surgich bo'ladi.
 */
export const TeachersCard = ({ data, isLoading, isError, delay = 0 }) => {
  const rows = data?.teachers ?? [];

  const isFit = useMediaQuery(FIT_QUERY);
  const [bodyRef, fitRows] = useFitRows({
    rowHeight: ROW_H,
    headerHeight: HEAD_H,
    min: MIN_ROWS,
    max: NO_MAX,
  });

  const visible = rows.slice(0, isFit ? fitRows : rows.length);
  const hidden = rows.length - visible.length;
  const barDelay = contentDelay(delay);

  return (
    <DashboardCard
      title="O'qituvchilar samaradorligi (KPI)"
      hint="Baho 50% · davomat 30% · topshiriq 20%"
      category="teachers"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda baho qo'yilmagan"
      dense
      footer={
        <CardLink to="/users/staff">{linkLabel("Barcha xodimlar ro'yxati", hidden)}</CardLink>
      }
    >
      <div ref={bodyRef} className={BODY}>
        <Enter delay={delay}>
          <MiniTable
            className={cn(TABLE, TEACHERS_TABLE)}
            columns={[
              { label: "O'qituvchi" },
              { label: "Fan" },
              { label: "O'rtacha baho", align: "right" },
              { label: "Davomat", align: "right" },
              // ⚠️ "Topshiriq bajarish" emas, "Topshiriq": olti ustunli
              // jadvalda uzun yorliq uch qatorga o'ralib, sarlavha uchun
              // ajratilgan qat'iy balandlikdan chiqib ketardi
              { label: "Topshiriq", align: "right" },
              { label: "KPI ball", align: "right" },
            ]}
          >
            {visible.map((row, index) => (
              <MiniTr key={row.teacherId} className={rowClass(index)}>
                <MiniTd className={T.tableName} title={row.name}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        TEACHER_DOTS[index % TEACHER_DOTS.length],
                      )}
                    />
                    {/* Katakning o'zidagi `truncate` ichkaridagi flex bolasiga
                        tegmaydi — ism ALOHIDA qisqaradi, nuqta va "arxiv"
                        belgisi esa o'z joyida qoladi */}
                    <span className="truncate">{row.name}</span>
                    {/* Arxivlangan xodim jadvalda qoladi — uning o'tgan oydagi
                        ishi yo'qolib ketmasligi kerak, lekin belgisi bo'lsin.
                        Neytral chip (10px — dashboardda o'qilishning quyi
                        chegarasi, tokendagidek); `leading-none` katakdan
                        meros — chip 14px, 26px qatorga sig'adi. */}
                    {row.isArchived && (
                      <span className={cn("shrink-0", TONE.neutral.chip)}>arxiv</span>
                    )}
                  </span>
                </MiniTd>
                <MiniTd className={T.tableSub} title={row.subjectNames?.join(", ")}>
                  {row.subjectNames?.join(", ") || "—"}
                </MiniTd>
                <MiniTd align="right" className={T.tableNum}>
                  {formatByUnit(row.averageGrade, "grade")}
                </MiniTd>
                {/* Raqam ham, chiziqcha ham `percentTone` rangida, semibold */}
                <PercentCell value={row.attendanceRate} delay={barDelay} />
                <PercentCell value={row.taskRate} delay={barDelay} />
                {/* ⚠️ BALL, FOIZ EMAS: server 0-100 oralig'idagi vaznlangan
                    ballni qaytaradi. "%" bilan yozilganda u yonidagi
                    "davomat 92%" bilan bir qatorda turib, bajarilish foizi
                    deb o'qilardi. */}
                <MiniTd align="right" className={T.tableNum}>
                  {formatByUnit(row.score, "score")}
                </MiniTd>
              </MiniTr>
            ))}
          </MiniTable>
        </Enter>
      </div>
    </DashboardCard>
  );
};
