// Recharts
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Hooks
import useFitRows from "@/shared/hooks/useFitRows";
import useCountUp from "@/shared/hooks/useCountUp";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import CardLink from "./CardLink";

// Data
import {
  AXIS,
  GRADE_COLORS,
  formatByUnit,
} from "../data/academicDashboard.data";
import { MOTION, T, contentDelay } from "../data/dashboard.tokens";

/**
 * Diagrammadagi IKKI OY ustunining rangi.
 *
 * ⚠️ Joriy oy to'q ko'k, taqqoslash oyi esa o'sha ko'kning ochiq soyasi:
 * ikkalasi bir xil rangning ikki darajasi bo'lishi shart, aks holda ular
 * "ikki xil ko'rsatkich" bo'lib o'qilardi.
 */
const SERIES = {
  current: "#2563eb",
  previous: "#bfdbfe",
  attendance: "#10b981",
};

/**
 * SVG ICHIDAGI MATN RANGI — `dashboard.tokens.js` ning HEX ko'zgusi.
 *
 * ⚠️ Recharts o'q, legenda va yorliq matnini `<text fill>` bilan chizadi,
 * ya'ni Tailwind sinf satri u yerga o'tmaydi. Shu sababli tokenlardagi
 * ikki rang shu yerda hex ko'rinishida takrorlanadi va BOSHQA rang
 * qo'shilmaydi: `label` = `T.label` (slate-500), `num` = `T.tableNum`
 * (slate-900). O'lcham ham tokenga mos: o'q/legenda 10.5px (`T.valueMeta`
 * darajasi), ustun yorlig'i 10px (`T.label` darajasi).
 */
const INK = {
  label: "#64748b",
  num: "#0f172a",
};
const AXIS_FONT = 10.5;
const AXIS_TICK = { ...AXIS, tick: { fontSize: AXIS_FONT, fill: INK.label } };

/**
 * ⚠️ Baho ranglari `academicDashboard.data.js` dagi `GRADE_COLORS` dan —
 * bu yerda o'z nusxasi TUTILMAYDI. Nusxa bor edi va u ajralib ketgan edi:
 * halqada "5" sariq, "1" esa binafsha chiqib, "yashil = yaxshi, qizil =
 * past" degan yagona shkala aynan shu diagrammada buzilgan edi.
 */

/**
 * ANIMATSIYA — RECHARTS'NING O'ZI, TASHQI KUTUBXONA YO'Q.
 *
 * ⚠️ `isAnimationActive="auto"` (recharts 3): `true` EMAS. `auto` rejimda
 * recharts `prefers-reduced-motion: reduce` ni o'zi tekshiradi va harakatni
 * o'chiradi — bu tizim talabi ("hammasi o'chadi"), va uni har diagrammada
 * qo'lda `matchMedia` bilan takrorlash o'rniga kutubxonaning o'z
 * mexanizmiga tayanildi (`node_modules/recharts/es6/animation/*.js`).
 *
 * XOREOGRAFIYA: karta bo'sh kirib (`fade-up`, `delay`), kontent undan
 * `DELAY.content` (140ms) keyin boshlanadi — `animationBegin` har
 * diagrammada `contentDelay(delay)` dan olinadi. Konteyner → kontent:
 * diagramma karta hali ko'rinmay turib chizilsa, harakat bekor ketardi.
 *
 * Barcha recharts animatsiyalari BIR MARTALIK. Yagona cheksiz harakat —
 * davomat chizig'idagi oxirgi nuqtaning `breathe` nafasi (opacity, CSS).
 */
const ANIM = "auto";

/** Diagramma harakat davomiyligi (ms) — uchala kartada bir tizim. */
const DURATION = {
  bars: 800,
  line: 1400,
  ring: 900,
};

/**
 * DIAGRAMMA MAYDONI — QAT'IY PIKSEL EMAS.
 *
 * ⚠️ `DashboardCard` ning `height` propi OLIB TASHLANDI. Bir ekranli
 * rejimda karta balandligini to'r beradi va diagramma qat'iy 200px bo'lsa,
 * yo kartadan oshib ketardi, yo pastida bo'sh joy qolardi — ikkalasi ham
 * foydalanuvchi rad etgan holat. Endi maydon `h-full` bilan kartaning
 * o'ziga qolgan joyni to'ldiradi, `ResponsiveContainer` esa 100%×100%.
 *
 * ⚠️ `h-[200px]` — FAQAT kichik ekran uchun (bir ekranli rejim yo'q, sahifa
 * odatdagidek suriladi). U yerda karta balandligi `auto` bo'ladi va
 * `height: 100%` foizi hech nimaga tayanmay 0 ga aylanardi — diagramma
 * umuman ko'rinmasdi. `fitscreen` da esa karta balandligi aniq va `h-full`
 * to'g'ri hisoblanadi.
 */
const CHART_AREA = "h-[200px] w-full fitscreen:h-full";

/**
 * Ustun ustidagi qiymat yorliqlari uchun ENG KAM balandlik.
 *
 * ⚠️ Yorliq o'q yorliqlaridan va ustun uchidan joy talab qiladi: maydon
 * 150px dan past bo'lganda "4.45" raqamlari ustunning o'zi va yuqoridagi
 * legenda bilan to'qnashardi. Shuning uchun kichik maydonda yorliq UMUMAN
 * chizilmaydi — qiymat tultipda qoladi (kesishgan matndan ko'ra yo'q matn
 * yaxshiroq).
 */
const LABEL_MIN_HEIGHT = 150;

/** Panjara va o'q uslubi — uchala diagrammada bir xil. */
const GRID = { strokeDasharray: "3 3", stroke: "#f1f5f9" };

/**
 * Legenda matni — recharts har elementni SERIYA rangida chizadi (ko'k
 * ustiga ko'k matn), bu esa o'qilmaydi va ierarxiyani buzadi: legenda
 * yorliq, ya'ni `T.label` rangida (slate-500) bo'lishi kerak.
 */
const legendText = (value) => <span style={{ color: INK.label }}>{value}</span>;

/**
 * Tultip qutisi — oq karta, `ring-slate-200`, yumshoq soya, 150ms fade.
 *
 * ⚠️ Animatsiya faqat PAYDO BO'LISHDA: recharts tultip konteynerini doim
 * ushlab turadi, ichidagi bu div esa `active=false` da unmount bo'ladi.
 * Ya'ni sichqoncha bir ustundan ikkinchisiga o'tganda div qayta
 * tug'ilmaydi va fade qayta ishlamaydi — aks holda har siljishda
 * "lipillab" turardi. Zoom YO'Q — faqat opacity.
 */
const TOOLTIP_BOX =
  "rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 " +
  "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_28px_-12px_rgba(15,23,42,0.18)] " +
  "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150";

/**
 * Diagramma tultipi — moliya dashboardidagi `MoneyTooltip` ning akademik
 * juftligi. ⚠️ Alohida, chunki u yerda qiymat pul, bu yerda esa baho yoki
 * foiz: bitta tultip ikkalasini ham to'g'ri formatlay olmasdi.
 *
 * Ierarxiya tokenlardan: sarlavha `T.tableName`, seriya nomi `T.tableSub`,
 * qiymat `T.tableNum` — jadval kartalari bilan bir xil uch daraja.
 */
const AcademicTooltip = ({
  active,
  payload,
  label,
  unit = "grade",
  // O'q yorlig'i qisqartirilgan bo'lsa (kun raqami "8"), tultip sarlavhasi
  // uchun to'liq matn qatorning o'zidan olinadi ("8-sentabr, 2026").
  labelKey = null,
}) => {
  // ⚠️ `tooltipType="none"` FAQAT standart tultipni to'xtatadi
  // (`DefaultTooltipContent`), maxsus `content` ga esa recharts butun
  // `payload` ni beradi va uni filtrlash BIZNING zimmamizda. Recharts
  // bayroqni qatorning `type` maydoniga yozadi (`cartesian/Area.js`),
  // shuning uchun tekshiruv ham o'sha yerda. Usiz bezak uchun qo'yilgan
  // `Area` tultipda ikkinchi qator bo'lib chiqadi va `name` yo'qligi
  // uchun "rate 93.8%" ko'rinishida — davomat dinamikasi kartasida
  // aynan shu bo'lgan edi.
  const rows = payload?.filter((row) => row && row.type !== "none") ?? [];
  if (!active || rows.length === 0) return null;

  return (
    <div className={TOOLTIP_BOX}>
      <p className={T.tableName}>
        {(labelKey && rows[0]?.payload?.[labelKey]) || label}
      </p>

      <ul className="mt-1 space-y-0.5">
        {rows.map((row) => (
          <li key={row.dataKey} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className={T.tableSub}>{row.name}</span>
            <span className={cn("ml-auto", T.tableNum)}>
              {formatByUnit(row.value, unit)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * BAHOLAR TAHLILI — fanlar bo'yicha o'rtacha baho.
 *
 * ⚠️ IKKI USTUN: joriy oy va o'tgan oy. Bittasi bilan "matematika 4.45"
 * degan raqam yaxshimi-yomonmi, aytib bo'lmaydi — javob faqat o'tgan oy
 * yonida turganda ko'rinadi.
 *
 * ⚠️ O'Q 0 DAN EMAS, ROSA SHKALADAN (1..5) boshlanadi: 4.45 va 4.05
 * orasidagi farq 0 dan boshlangan o'qda ko'zga umuman tashlanmasdi.
 * O'lchandi: 200px li maydonda chizish balandligi ~170px, ya'ni [0,5]
 * shkalada 0.4 balllik farq ~13px, [1,5] da esa ~17px — birinchisida
 * sakkizta ustun deyarli bir xil ko'rinardi, holbuki kartaning yagona
 * vazifasi aynan shu farqni ko'rsatish.
 *
 * ⚠️ Ustun ustidagi yorliq FAQAT joriy oyda: ikkala seriyada ham qo'yilsa,
 * sakkiz fanga o'n olti raqam tushib, ular bir-birining ustiga chiqib
 * ketardi.
 *
 * ⚠️ Fan nomlari `interval={0}` bilan MAJBURAN chizilmaydi. 1280–1366px
 * da bitta fanga ~47px slot qoladi, "Matematika" esa 11px shriftda ~58px
 * joy egallaydi — o'lchandi: sakkiz yorliqdan 4-5 tasi qo'shnisi bilan
 * kesishardi. Standart interval recharts ga to'qnashganini tashlab
 * yuborishga ruxsat beradi: kesishgan matndan ko'ra kamroq yorliq
 * o'qiladi (qolgani tultipda).
 *
 * ANIMATSIYA: ustunlar pastdan o'sib chiqadi (800ms, ease-out), kartadan
 * 140ms keyin; o'tgan oy seriyasi yana 120ms kechikib — ikki seriya
 * "birga sakramaydi", avval joriy, ortidan taqqoslash. Yorliqlar
 * ustunlar o'sib BO'LGACH (karta + 140 + 800) paydo bo'ladi.
 */
export const SubjectChart = ({ data, isLoading, isError, delay = 0 }) => {
  const rows = (data?.subjects ?? []).map((row) => ({
    ...row,
    current: row.average == null ? null : Number(row.average),
    previous: row.previousAverage == null ? null : Number(row.previousAverage),
  }));
  const begin = contentDelay(delay);

  /**
   * Yorliq chizilsinmi — PIKSEL TAXMIN QILINMAYDI, O'LCHANADI.
   *
   * ⚠️ `useFitRows` bu yerda "qator soni" uchun emas, BITTA HA/YO'Q
   * javobi uchun ishlatiladi: `rowHeight` — talab qilinadigan eng kam
   * balandlik, `min: 0` / `max: 1` esa natijani "0 yoki 1" ga qisadi.
   * Alohida `ResizeObserver` yozilmadi — ikkinchi o'lchov kodi bo'lsa,
   * birinchisidagi tuzatish (0 balandlik, render tsikli, jsdom fallback)
   * bu yerga ko'chmay qolardi.
   *
   * ⚠️ `ResizeObserver` yo'q muhitda `max` (=1) qaytadi → yorliqlar
   * chiziladi. Bu to'g'ri zaxira: u muhitda maydon `h-[200px]`.
   */
  const [chartRef, labelFits] = useFitRows({
    rowHeight: LABEL_MIN_HEIGHT,
    min: 0,
    max: 1,
  });
  const withLabels = labelFits > 0;

  return (
    <DashboardCard
      // ⚠️ Qavs ichidagi izoh SARLAVHADAN IZOH SATRIGA ko'chirildi:
      // bir ekranli rejimda sarlavha bir qatorda turadi (`dense`) va
      // 45 belgilik nom kartaning kengligiga sig'may, kesilib qolardi.
      // Matn yo'qolmadi — u pastdagi izoh satrida to'liq turibdi.
      title="Baholar tahlili"
      hint="Fanlar bo'yicha o'rtacha baho"
      category="grades"
      delay={delay}
      dense
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda baho qo'yilmagan"
      footer={<CardLink to="/grades">Barcha fanlar bo'yicha batafsil</CardLink>}
    >
      <div ref={chartRef} className={CHART_AREA}>
        <ResponsiveContainer width="100%" height="100%">
          {/* ⚠️ Yuqori chekka yorliqqa qarab o'zgaradi: yorliq yo'q bo'lsa
              24px bo'sh joy chizish maydonidan behuda o'g'irlanardi — past
              kartada aynan o'sha piksellar diagrammani tekislab qo'yardi. */}
          <BarChart
            data={rows}
            margin={{ top: withLabels ? 24 : 8, right: 8, left: 0, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid vertical={false} {...GRID} />
            <XAxis dataKey="name" {...AXIS_TICK} tickMargin={6} />
            <YAxis
              {...AXIS_TICK}
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              width={28}
            />
            {/* Hover: fan ustunining orqasi och kulrang bilan yoritiladi —
                ustunning o'zi esa `activeBar` bilan biroz ochlashadi */}
            <Tooltip
              content={<AcademicTooltip unit="grade" />}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="square"
              iconSize={9}
              formatter={legendText}
              wrapperStyle={{ fontSize: AXIS_FONT, paddingBottom: 8 }}
            />

            <Bar
              dataKey="current"
              // Yorliqda oy nomi bor — legenda "qaysi ustun qaysi oy" degan
              // savolga tultipsiz javob berishi kerak
              name={
                data?.monthLabel
                  ? `O'rtacha baho (${data.monthLabel})`
                  : "O'rtacha baho"
              }
              fill={SERIES.current}
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              isAnimationActive={ANIM}
              animationBegin={begin}
              animationDuration={DURATION.bars}
              animationEasing="ease-out"
              activeBar={{ fillOpacity: 0.85 }}
            >
              {withLabels && (
                <LabelList
                  dataKey="current"
                  position="top"
                  fontSize={10}
                  fontWeight={600}
                  fill={INK.num}
                  formatter={(value) =>
                    value == null ? "" : Number(value).toFixed(2)
                  }
                  // ⚠️ Yorliq ustunlar o'sib bo'lgach ko'rinadi: recharts
                  // `LabelList` ni animatsiya qilmaydi, shuning uchun CSS —
                  // `className`/`style` har bir `<text>` ga o'tadi.
                  // `fill-mode-both` MAJBURIY: usiz kechikish davomida
                  // yorliq to'liq ko'rinib turib, keyin "qayta" paydo
                  // bo'lardi. Reduced-motion'da `motion-safe:` tufayli
                  // yorliq darhol ko'rinadi.
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 motion-safe:fill-mode-both"
                  style={{ animationDelay: `${begin + DURATION.bars}ms` }}
                />
              )}
            </Bar>
            <Bar
              dataKey="previous"
              name={data?.compareMonthLabel ?? "O'tgan oy"}
              fill={SERIES.previous}
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              isAnimationActive={ANIM}
              animationBegin={begin + 120}
              animationDuration={DURATION.bars}
              animationEasing="ease-out"
              activeBar={{ fillOpacity: 0.85 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

/**
 * DAVOMAT DINAMIKASI — tanlangan oyning KUNLIK chizig'i.
 *
 * ⚠️ OYLIK EMAS. Oylik o'rtacha davomat yil bo'yi 92-95% da tekis yotadi
 * va diagramma hech narsa ko'rsatmasdi; ustiga bazada bitta oy ma'lumot
 * bo'lsa, 12 oydan 11 tasi `total = 0` bo'lib filtrlanib, karta yolg'iz
 * bitta nuqta bilan qolardi. Kerakli savol — "qaysi KUNI davomat
 * cho'kdi", javob esa faqat kun kesimida ko'rinadi.
 *
 * ⚠️ O'QDA FAQAT KUN RAQAMI (`dayShort`), tultipda esa to'liq sana
 * (`dayLabel`) — ikkalasi ham SERVERDAN keladi, chunki frontendda oy
 * nomlari massivini nusxalash taqiqlangan (`.claude/rules/dates.md`).
 * Oy o'qda takrorlanmaydi: u kartaning izohida turibdi.
 *
 * ⚠️ `interval={0}` YO'Q. Bir oyda 31 tagacha katak bor va uch ustunli
 * to'rda bitta kartaga ~590px to'g'ri keladi, ya'ni bitta kunga ~17px —
 * "31" esa 10px shriftda ~13px joy egallaydi va tor ekranda yorliqlar
 * bir-biriga tegib ketardi. `preserveStartEnd` recharts ga oraliqni
 * o'zi tanlashga ruxsat beradi, oyning boshi va oxiri esa har doim
 * ko'rinadi.
 *
 * ⚠️ O'Q 0 DAN EMAS: davomat amalda 85–97% oralig'ida yuradi va [0,100]
 * shkalada kunlar orasidagi butun farq ~20 PIKSELGA siqilardi — grafik
 * tekis chiziqqa aylanib, kartaning ma'nosi yo'qolardi. Kun pastga
 * tushsa (masalan 40%), `domain` uni ham ko'rsatadi.
 *
 * ⚠️ Chiziq ustida QIYMAT YORLIG'I YO'Q: "94.2%" 10px shriftda ~30px
 * joy egallaydi, bitta kunga esa ~17px slot qoladi — yorliqlar
 * bir-birining ustiga chiqardi. Qiymat tultipda, nuqta ustiga
 * borilganda ko'rinadi.
 *
 * ANIMATSIYA: chiziq chapdan o'ngga "chiziladi" (1400ms, ease-in-out),
 * ostida yumshoq gradient maydon u bilan birga to'ladi. OXIRGI NUQTA
 * "jonli" — halqa EMAS, nuqtaning o'zi sekin nafas oladi (`breathe`,
 * opacity): bu "oxirgi belgilangan kun" degan belgi.
 * Kengayib so'nadigan ping halqasi olib tashlandi — u e'tiborni
 * diagrammadan o'g'irlab, "bachkana" o'qilardi.
 *
 * Rang — davomat toifasi (emerald), sarlavha nuqtasi bilan bir xil:
 * ko'z kartani rangdan tanib oladi.
 *
 * ⚠️ `LineChart` → `ComposedChart`: gradient maydon (`Area`) chiziq bilan
 * bitta diagrammada turishi uchun. Props va o'lchov bir xil.
 */
export const AttendanceTrendChart = ({
  data,
  isLoading,
  isError,
  delay = 0,
}) => {
  // ⚠️ `total > 0` — davomat BELGILANGAN kunlar. Server oyning hamma
  // kunini qaytaradi (yakshanba va bayram ham), aks holda "belgilanmagan
  // kun" bilan "0% davomat" farqlanmasdi; chizishga esa faqat belgilangani
  // yaraydi — bo'sh kunlar chiziqni nolga tushirib yuborardi.
  const rows = (data?.attendanceTrend ?? []).filter((row) => row.total > 0);
  const begin = contentDelay(delay);

  // Eng past qiymatdan bir pog'ona past — o'nlikka yaxlitlangan.
  const lowest = rows.reduce((min, row) => Math.min(min, row.rate ?? 100), 100);
  const floor = Math.max(0, Math.min(50, Math.floor((lowest - 5) / 10) * 10));
  const lastIndex = rows.length - 1;

  /**
   * Nuqta chizuvchisi — oddiy nuqtalar r=3 oq hoshiya bilan, oxirgisi
   * r=4.5 va nafas oladi. `breathe` faqat opacity — transform yo'q,
   * shuning uchun SVG `transform-origin` tuzog'i ham yo'q.
   */
  const renderDot = ({ cx, cy, index }) => {
    if (cx == null || cy == null) return null;
    const isLast = index === lastIndex;

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={isLast ? 4.5 : 3}
        fill={SERIES.attendance}
        stroke="#ffffff"
        strokeWidth={1.5}
        className={isLast ? MOTION.breathe : undefined}
      />
    );
  };

  return (
    <DashboardCard
      title="Davomat dinamikasi"
      hint={data?.monthLabel ?? "Kunlik"}
      category="attendance"
      delay={delay}
      dense
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Davomat belgilanmagan"
      footer={
        <CardLink to="/attendance/reports/students">
          Batafsil davomat tahlili
        </CardLink>
      }
    >
      <div className={CHART_AREA}>
        <ResponsiveContainer width="100%" height="100%">
          {/* ⚠️ Yuqori chekka 20 → 12: chiziqda yorliq yo'q, shuning uchun
              tepada faqat eng baland nuqtaning aylanasi (r=4.5) sig'sa
              yetadi. Past kartada bu 8 piksel chizish maydoniga qo'shiladi. */}
          <ComposedChart
            data={rows}
            margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Chiziq ostidagi to'ldirish: tepada 18% rang, pastda shaffof —
                  panjara va o'q yorliqlari orqasidan o'qilaverishi uchun */}
              <linearGradient
                id="attendance-trend-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={SERIES.attendance}
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor={SERIES.attendance}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} {...GRID} />
            <XAxis
              dataKey="dayShort"
              {...AXIS_TICK}
              interval="preserveStartEnd"
              tickMargin={6}
            />
            <YAxis
              {...AXIS_TICK}
              domain={[floor, 100]}
              tickFormatter={(value) => `${value}%`}
              width={40}
            />
            <Tooltip
              content={<AcademicTooltip unit="percent" labelKey="dayLabel" />}
            />

            {/* ⚠️ `tooltipType="none"` va `legendType="none"`: maydon FAQAT
                bezak, u chiziq bilan bir xil qiymatni ko'rsatadi. Usiz
                tultipda qiymat ikki marta chiqardi ("rate" va "Davomat")
                — filtrlash `AcademicTooltip` ichida. */}
            <Area
              type="monotone"
              dataKey="rate"
              stroke="none"
              fill="url(#attendance-trend-fill)"
              tooltipType="none"
              legendType="none"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={ANIM}
              animationBegin={begin}
              animationDuration={DURATION.line}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="rate"
              name="Davomat"
              stroke={SERIES.attendance}
              strokeWidth={2}
              dot={renderDot}
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 1.5 }}
              connectNulls
              isAnimationActive={ANIM}
              animationBegin={begin}
              animationDuration={DURATION.line}
              animationEasing="ease-in-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

/**
 * Halqaning HOVER holatidagi bo'lagi — tashqi radius 4px kattaroq.
 *
 * ⚠️ Recharts 3 da `activeShape` tultipning faol indeksi orqali ishlaydi
 * (`selectActiveTooltipIndex`), ya'ni alohida `onMouseEnter`/`activeIndex`
 * state kerak emas — sichqoncha bo'lakdan ketganda o'zi qaytadi.
 *
 * ⚠️ Faqat kerakli maydonlar olinadi, `{...props}` YO'Q: recharts sektor
 * propslari ichida `payload`, `percent`, `tooltipPayload` bor va ular
 * `<path>` atributi bo'lib React ogohlantirishi berardi.
 */
const ActiveSector = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
}) => (
  <Sector
    cx={cx}
    cy={cy}
    innerRadius={innerRadius}
    outerRadius={outerRadius + 4}
    startAngle={startAngle}
    endAngle={endAngle}
    fill={fill}
    stroke="none"
  />
);

/**
 * Halqa markazidagi SANALADIGAN son — ALOHIDA komponent.
 *
 * ⚠️ `useCountUp` har kadrda state yozadi (~70 render / 1.2s). U karta
 * darajasida chaqirilsa, har kadr `PieChart` ham qayta chizilar va `rows`
 * massivi yangi identifikator bilan kelib, recharts halqa animatsiyasini
 * qayta boshlab yuborardi. Sanoq shu kichik elementda qolsa, har kadr
 * qayta chiziladigan narsa — bitta `<p>`.
 *
 * `duration` — kechikish + halqa davomiyligi: hookda `delay` yo'q, sanoq
 * mount'da boshlanadi va halqa bilan BIR VAQTDA tugaydi (KPI kartalari
 * bilan bir xil usul). `tabular-nums` (`T.value` ichida) — sanash paytida
 * raqam kengligi o'zgarib matn "titramasin".
 */
const AnimatedTotal = ({ total, duration }) => {
  const animated = useCountUp(total, { duration });

  return (
    <p className={cn(T.value, T.valueRing)}>
      {formatByUnit(animated ?? total, "count")}
    </p>
  );
};

/**
 * BAHOLAR TAQSIMOTI — halqa va uning O'NG TOMONIDA legenda.
 *
 * Ro'yxat MAJBURIY qism, bezak emas: halqaning o'zi "qaysi bo'lak nechchi
 * foiz" ni aytadi, lekin "nechta baho" ni aytmaydi — ikkalasi ham kerak.
 *
 * ⚠️ Legenda CHEKLANMAYDI va `useFitRows` ham qo'llanmaydi: baho darajalari
 * BESHTA, ular har qanday karta balandligida sig'adi (5 × ~18px ≈ 90px).
 * Cheklov qo'yilsa "1" bahosi olganlar ro'yxatdan tushib qolardi — halqada
 * esa ko'rinib turardi, ya'ni ekranda o'ziga qarama-qarshi ikki javob
 * paydo bo'lardi.
 *
 * ⚠️ Markazdagi son — O'QUVCHILAR soni: har bir o'quvchi o'rtacha bahosi
 * bo'yicha bitta chelakka tushadi. Qo'yilgan baholar soni bu yerda EMAS
 * (u ko'p dars oladigan sinfni ustun qilib ko'rsatardi).
 *
 * ⚠️ Bu son KPI dagi "Jami o'quvchilar" ga TENG EMAS va bo'lishi ham shart
 * emas: bu yerda faqat shu oyda BAHO OLGANLAR sanaladi. Bahosi yo'q
 * o'quvchi (masalan bog'cha guruhi yoki oy oxirida kelgan bola) taqsimotga
 * kirmaydi — shuning uchun markazda "Jami" emas, "Baho olgan" deb turadi.
 *
 * ANIMATSIYA: kartadan 140ms keyin halqa aylanib chiziladi (900ms,
 * ease-out), markazdagi son shu vaqt ichida yakuniy qiymatgacha sanaydi,
 * legenda esa BITTA `fade-up` bilan halqa bilan birga kiradi — qatorma-
 * qator stagger YO'Q (besh qatorning ketma-ket sakrashi "bachkana"
 * o'qilardi). Uch harakat bir vaqtda tugaydi.
 */
export const DistributionCard = ({ data, isLoading, isError, delay = 0 }) => {
  const rows = (data?.distribution ?? []).filter((row) => row.count > 0);
  const total = rows.reduce((acc, row) => acc + row.count, 0);
  const begin = contentDelay(delay);
  const enter = { animationDelay: `${begin}ms` };

  return (
    <DashboardCard
      title="Baholar taqsimoti"
      hint={data?.monthLabel || ""}
      category="grades"
      delay={delay}
      dense
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda baho qo'yilmagan"
      footer={<CardLink to="/grades">Batafsil baholar tahlili</CardLink>}
    >
      {/* `min-h-0` — bir ekranli rejimda to'r bo'g'inining har birida
          bo'lishi shart: bittasi tushib qolsa, flex bolasining standart
          `min-height: auto` si kartani yorib chiqaradi. */}
      <div className="flex h-full min-h-0 flex-col items-center gap-3 sm:flex-row sm:items-stretch">
        {/* ⚠️ Halqa QAT'IY 170px EMAS, konteyner balandligiga moslashadi:
            `fitscreen` da balandlik kartadan keladi (`h-full`), kenglik esa
            `aspect-square` bilan undan chiqadi — halqa doim doira bo'lib
            qoladi. `max-w-[46%]` — juda past emas, juda BALAND kartadan
            himoya: halqa kengayib legendani siqib qo'ymasin.
            Kichik ekranda (bir ekranli rejim yo'q) o'lchov qat'iy, chunki
            u yerda kartaning balandligi `auto` va foiz hech nimaga
            tayanmasdi. */}
        <div className="relative h-[170px] w-[170px] shrink-0 fitscreen:aspect-square fitscreen:h-full fitscreen:w-auto fitscreen:max-w-[46%]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* ⚠️ Radiuslar FOIZDA: recharts foizni konteynerning KICHIK
                  o'lchamidan hisoblaydi, ya'ni karta pasayganda halqa o'zi
                  kichrayadi va hech qachon kesilmaydi.
                  `outerRadius` 90% → 88%: hover'da bo'lak +4px kengayadi va
                  90% da konteyner chetidan kesilib qolardi. */}
              <Pie
                data={rows}
                dataKey="count"
                nameKey="label"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={ANIM}
                animationBegin={begin}
                animationDuration={DURATION.ring}
                animationEasing="ease-out"
                activeShape={ActiveSector}
              >
                {rows.map((row) => (
                  <Cell
                    key={row.grade}
                    fill={GRADE_COLORS[row.grade] ?? "#a3a3a3"}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className={TOOLTIP_BOX}>
                      <p className={T.tableName}>
                        {payload[0].payload.grade} ({payload[0].payload.label})
                      </p>
                      <p className={cn("mt-0.5", T.tableSub)}>
                        <span className={T.tableNum}>
                          {payload[0].payload.count} ta
                        </span>
                        {" · "}
                        {payload[0].payload.share}%
                      </p>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Halqa markazi — SVG ichida emas, ustiga qo'yilgan matn:
              `<text>` ning vertikal markazi shrift metrikasiga bog'liq
              bo'lib, uch qatorli yozuv halqada qiyshiq turardi.
              Uch daraja tokendan: yorliq (`T.label`) → son (`T.value`) →
              izoh (`T.valueMeta`); markaz halqa bilan birga kiradi. */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center",
              MOTION.enter,
            )}
            style={enter}
          >
            {/* ⚠️ "Jami" EMAS. Markazdagi son — shu oyda KAMIDA BITTA
                bahosi bor o'quvchilar, ya'ni u KPI dagi "Jami o'quvchilar"
                dan kam bo'lishi TABIIY (bahosi yo'q bola bu yerda
                sanalmaydi). "Jami" deb yozib qo'yilgani uchun ikki karta
                ikki xil raqam ko'rsatyapti degan savol tug'ilardi. */}
            <p className={T.label}>Baho olgan</p>
            <AnimatedTotal total={total} duration={begin + DURATION.ring} />
            <p className={T.valueMeta}>o'quvchi</p>
          </div>
        </div>

        {/* Legenda halqaning yonida VERTIKAL MARKAZDA turadi: `items-stretch`
            bilan ustun balandligi halqanikiga teng bo'ladi, `justify-center`
            esa besh qatorni o'sha ustunning o'rtasiga qo'yadi.
            Butun ro'yxat BITTA `fade-up` — `both` fill-mode bilan kechikish
            davomida ko'rinmaydi, keyin halqa bilan birga ko'tariladi. */}
        <ul
          className={cn(
            "flex w-full min-w-0 flex-1 flex-col justify-center gap-1.5",
            MOTION.enter,
          )}
          style={enter}
        >
          {rows.map((row) => (
            <li key={row.grade} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: GRADE_COLORS[row.grade] ?? "#a3a3a3",
                }}
              />
              {/* Bir qator, kesilmaydi — ikkinchi qatorga o'tsa, besh
                  yorliqning balandligi oldindan bilinmay qolardi. */}
              <span className={cn("truncate", T.tableCell)}>
                {row.grade} ({row.label})
              </span>
              <span className={cn("ml-auto shrink-0", T.tableNum)}>
                {row.share}%
              </span>
              <span
                className={cn(
                  "w-12 shrink-0 text-right tabular-nums",
                  T.tableSub,
                )}
              >
                {row.count} ta
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
};
