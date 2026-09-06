// React
import { useMemo } from "react";

// Icons
import { LogIn } from "lucide-react";

// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { CHIP, DELAY, HUE, MOTION, SURFACE, T, contentDelay } from "../data/sentinel.tokens";

// Components
import Panel from "./Panel";

/**
 * KIRISHLAR DINAMIKASI — kunlik urinishlar, ikki qatlamli USTUN.
 *
 * ⚠️ USTUN, MAYDON (`Area`) EMAS — va bu bo'limlar orasidagi eng muhim
 * farq. Faollik dashboardidagi `TrendChart` maydon bilan chiziladi,
 * chunki u yerdagi savol "TENDENSIYA qanday": foydalanuvchi soni
 * uzluksiz kattalik va uni chiziq bilan ko'rsatish to'g'ri. Bu yerdagi
 * savol esa boshqa — "O'SHA KUNI nechta urinish rad etildi". Rad etilgan
 * urinish DISKRET hodisa: u kunga bog'langan va qo'shni kunga
 * "oqib o'tmaydi". Uzluksiz chiziqda bitta yomon kun ikki qo'shnisi
 * bilan silliqlanib, umumiy egrilikda ko'zdan yo'qolardi; ustun esa
 * o'sha kunni alohida qoldiradi.
 *
 * ⚠️ IKKALASI BITTA USTUNDA (stacked), yonma-yon EMAS. Ustunning to'liq
 * balandligi — o'sha kungi JAMI urinishlar, ya'ni "yuklama"; ustidagi
 * qizil bo'lak esa uning rad etilgan ULUShI. Yonma-yon ikki ustun
 * bo'lsa, ko'z ularni taqqoslashga urinardi — aslida savol taqqoslash
 * emas, NISBAT.
 *
 * ⚠️ MUVAFFAQIYATLI PASTDA. Rad etilgan urinish har doim USTIDA turadi:
 * u nol chizig'idan emas, ko'z osongina ilg'aydigan ustun UChIDAN
 * o'sadi. Teskarisi bo'lsa, qizil bo'lak katta ko'k massa ostida
 * ko'rinmay qolardi.
 */

/**
 * X o'qi yorlig'i — serverning to'liq `label` idan faqat kun-oy qismi.
 *
 * ⚠️ SANA QO'LDA YIG'ILMAYDI. Server "6-sentabr, 2026" beradi; bu yerda
 * faqat vergulgacha bo'lgan bo'lak KESIB olinadi ("6-sentabr").
 * `toLocaleDateString`/`Intl` bilan qayta formatlansa, natija brauzer
 * locale'iga bog'liq bo'lib qolardi.
 */
const shortDay = (label) => (label ? String(label).split(",")[0] : "—");

/** O'q ko'rinishi — recharts SVG atributlari (Tailwind sinfi u yerga yetmaydi). */
const AXIS = {
  tick: { fontSize: 10.5, fill: HUE.axis, fontWeight: 500 },
  axisLine: false,
  tickLine: false,
};

/**
 * Qatlamlar — afsona, `Bar` va tooltip AYNAN shu ro'yxatdan chiziladi.
 *
 * ⚠️ Tartib MA'NOLI: ro'yxatdagi birinchi element ustunning PASTIDA
 * turadi. Uchta joyda uchta qo'lda yozilgan ro'yxat bo'lsa, rang bir
 * joyda almashtirilib, afsona diagrammaga yolg'on gapirib turardi.
 */
const SERIES = [
  { key: "success", name: "Muvaffaqiyatli", tone: "success", color: HUE.success },
  { key: "failed", name: "Rad etildi", tone: "alert", color: HUE.failed },
];

const LoginTrend = ({ data, isLoading, isError, delay = 0, className }) => {
  // ⚠️ `data?.trend ?? []` bog'liqlik ro'yxatiga CHIQARILMAYDI: har
  // renderda yangi massiv hosil bo'lib, memo hech qachon keshlanmasdi.
  const series = useMemo(
    () =>
      (data?.trend ?? []).map((row) => ({
        ...row,
        success: Number(row.success) || 0,
        failed: Number(row.failed) || 0,
        shortLabel: shortDay(row.label),
      })),
    [data],
  );

  /**
   * Yorliqlarni siyraklashtirish — 30 kunda ~6 ta yorliq qoladi.
   *
   * ⚠️ `interval="preserveStartEnd"` YETMAYDI: u recharts o'ziga qulay
   * sonini tanlaydi va 90 kunlik davrda yorliqlar bir-birining ustiga
   * chiqib ketadi. Qadam ATAYLAB qattiq hisoblanadi.
   */
  const tickInterval = Math.max(0, Math.ceil(series.length / 6) - 1);

  // Bo'sh davr — nol ustunlar qatori emas, matn: nol balandlikdagi
  // ustunlar "ma'lumot yo'q" ni emas, "hech kim kirmagan" ni bildirardi.
  const hasData = series.some((row) => row.success > 0 || row.failed > 0);
  const days = data?.period?.days ?? series.length;

  return (
    <Panel
      title="Kirishlar dinamikasi"
      hint={`${days} kunlik urinishlar`}
      icon={LogIn}
      tone="session"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      emptyText="Bu davrda kirish urinishlari qayd etilmagan"
      className={className}
    >
      {/* ── Afsona ─────────────────────────────────────────────────
          Sarlavha ostida, chipda: qaysi rang nimani bildirishi
          diagrammaga QARAMASDAN o'qilishi kerak. */}
      <div
        className={cn("flex flex-wrap items-center gap-1.5", MOTION.enterUp)}
        style={{ animationDelay: `${contentDelay(delay, 0)}ms` }}
      >
        {SERIES.map((item) => (
          <span key={item.key} className={cn(CHIP.base, CHIP.tone[item.tone])}>
            {/* `bg-current` — nuqta chipning o'z ohangini oladi, ikkinchi
                rang manbai paydo bo'lmaydi */}
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {item.name}
          </span>
        ))}
      </div>

      {/* ── Diagramma ──────────────────────────────────────────────── */}
      <div
        className={cn("mt-3 h-[240px] w-full", MOTION.enterUp)}
        style={{ animationDelay: `${contentDelay(delay, 1)}ms` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
            {/* ⚠️ Faqat GORIZONTAL to'r: tik chiziqlar ustunlar orasiga
                tushib, diagrammani "panjara" qilardi */}
            <CartesianGrid vertical={false} stroke={HUE.grid} strokeDasharray="0" />

            <XAxis
              dataKey="shortLabel"
              {...AXIS}
              interval={tickInterval}
              tickMargin={8}
              minTickGap={4}
            />
            {/* Urinish soni — butun son; `allowDecimals` bo'lsa o'qda
                "0.5 urinish" paydo bo'lardi */}
            <YAxis {...AXIS} allowDecimals={false} width={34} tickMargin={4} />

            {/* ⚠️ Kursor — CHIZIQ emas, USTUN maydoni. Maydon
                diagrammasida kursor "shu X nuqtani o'qing" deydi, bu
                yerda esa o'qish birligi butun KUN: kunning ustuni
                yoritiladi. */}
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ fill: HUE.grid, fillOpacity: 0.55 }}
            />

            {/* ⚠️ IKKALA QATLAM BIR VAQTDA o'sadi (`animationBegin` bir
                xil). Faollik diagrammasida qatlamlar 160ms farq bilan
                keladi — u yerda ular MUSTAQIL chiziqlar. Bu yerda esa
                ular bitta ustunning bo'laklari: qizil bo'lak oldin
                kelsa, u o'sib kelayotgan ko'k bo'lak ustida havoda
                osilib turardi. */}
            <Bar
              dataKey="success"
              name="Muvaffaqiyatli"
              stackId="attempts"
              fill={HUE.success}
              shape={<StackTopCap />}
              maxBarSize={26}
              animationDuration={700}
              animationBegin={delay + DELAY.content}
            />
            <Bar
              dataKey="failed"
              name="Rad etildi"
              stackId="attempts"
              fill={HUE.failed}
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
              animationDuration={700}
              animationBegin={delay + DELAY.content}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
};

/**
 * PASTKI BO'LAK — yumaloq uchi FAQAT rad etish bo'lmagan kunda.
 *
 * ⚠️ `radius` ni to'g'ridan-to'g'ri `Bar` ga berib bo'lmaydi: u BARCHA
 * kunlarga birdek qo'llanadi va rad etish bo'lgan kunda stack'ning
 * O'RTASI yumaloqlanib, ikki bo'lak orasida oq tirqish paydo bo'lardi
 * — ustun ikkiga bo'linib ko'rinardi. Shu sababli pastki bo'lakning
 * shakli har kunning o'z qatoridan hal qilinadi: usti ochiq bo'lsa
 * (`failed === 0`) yumaloq, ustida qizil bo'lak bo'lsa tekis.
 *
 * ⚠️ `minPointSize` ISHLATILMAYDI: recharts hujjati uni stacked
 * diagrammada tavsiya etmaydi (bo'laklar zich joylashganda hurmat
 * qilinmaydi va stack balandligi yolg'on bo'lib qoladi). Bitta rad
 * etilgan urinish piksel ostida qolsa, uni tooltip va yonidagi
 * "Rad etilgan urinishlar" bloki aytadi.
 */
const StackTopCap = ({ x, y, width, height, fill, payload }) => (
  <Rectangle
    x={x}
    y={y}
    width={width}
    height={height}
    fill={fill}
    radius={payload?.failed > 0 ? 0 : [3, 3, 0, 0]}
  />
);

/**
 * TOOLTIP — kun va ikkala son.
 *
 * ⚠️ Recharts'ning standart tooltip'i ISHLATILMAYDI: u kulrang
 * chegarali quti chizadi va bu ekrandagi yagona "chegarali" element
 * bo'lib qolardi (`sentinel.tokens.js` — chegara o'rniga signal relsi).
 * Qobiq `SURFACE.card` dan olinadi — tooltip kichik oq karta, ya'ni
 * ekrandagi boshqa sirtlar bilan bitta oiladan.
 *
 * ⚠️ Sarlavhada TO'LIQ `label` turadi ("6-sentabr, 2026"), o'qdagi
 * qisqartma emas: o'q siyraklashtirilgani uchun sichqoncha turgan
 * kunning aniq sanasi faqat shu yerda ko'rinadi. Matn SERVERDAN keladi
 * — bu yerda sana yig'ilmaydi.
 *
 * ⚠️ Raqamlar o'ngga tekislangan (`ml-auto`): ikki qator TIK
 * taqqoslanadi ("12 dan 3 tasi rad etildi"), yorliqlar esa har xil
 * uzunlikda.
 */
const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className={cn(SURFACE.card, "rounded-xl px-3 py-2.5")}>
      <p className={T.title}>{row?.label ?? "—"}</p>

      <div className="mt-1.5 space-y-1">
        {SERIES.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <span className={T.td}>{item.name}:</span>
            <span className={cn(T.tdNum, "ml-auto")}>{row?.[item.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginTrend;
