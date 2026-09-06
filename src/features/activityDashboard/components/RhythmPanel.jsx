// React
import { useMemo } from "react";

// Icons
import { Clock, Radio } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { DAYS_UZ } from "@/shared/utils/date.utils";

// Hooks
import useCountUp from "@/shared/hooks/useCountUp";

// Tokens
import {
  BAR,
  CHIP,
  HUE,
  MOTION,
  ROW,
  T,
  WEEKDAYS_SHORT,
  contentDelay,
  heatColor,
  pct,
} from "../data/pulse.tokens";

// Components
import Panel from "./Panel";

/* ═══════════════════════ UMUMIY YORDAMCHILAR ═══════════════════════ */

/**
 * Soat raqamini vaqt yorlig'iga soladi: `9` → `"09:00"`.
 *
 * ⚠️ Bu SANA emas, VAQT: `dates.md` dagi vaqt formati `HH:mm` va u nol
 * bilan to'ldiriladi. Kun raqamidagi "noldan boshlanmaydi" qoidasi bu
 * yerga tegishli emas — aks holda lentaning ostidagi yorliqlar bir xil
 * kenglikda turmasdi va ustun bo'lib tekislanmasdi.
 *
 * @param {number} hour - 0..23
 * @returns {string}
 */
const hourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

/** "seshanba" → "Seshanba" — chipda mustaqil yorliq sifatida turadi. */
const capitalize = (text) => (text ? text[0].toUpperCase() + text.slice(1) : "—");

/**
 * Kirish animatsiyasidagi qator raqamining SHIFTI.
 *
 * ⚠️ Qadam cheklanmasa, uzun ro'yxatning oxirgi qatori bir necha soniya
 * kutib turardi: kechikish "ro'yxat to'layapti" degan ma'noni beradi,
 * "sahifa osilib qoldi" degan emas.
 */
const stepIndex = (index) => Math.min(index, 10);

/* ═══════════════════════ FOYDALANISH RITMI ═══════════════════════ */

/**
 * Issiqlik katakchalari orasidagi kechikish (ms).
 *
 * ⚠️ 24 ta katakcha uchun `DELAY.rowStep` (42ms) juda uzun bo'lardi —
 * lenta bir soniyadan ko'proq to'lib, "sekin sahifa" ta'sirini berardi.
 * 12ms esa butun lentani ~0.3s da yopadi: harakat sezilarli, lekin
 * kutish emas.
 */
const HOUR_STEP = 12;

/** Butun soat lentasi kirib bo'lgunga qadar ketadigan vaqt (ms). */
const HOUR_SWEEP = 24 * HOUR_STEP;

/**
 * Ostida raqam turadigan soatlar.
 *
 * ⚠️ 24 ta yorliq O'QILMAYDI: 13px kenglikdagi katakcha ostida ikki
 * xonali son yonma-yon turib, kulrang shovqinga aylanadi. Beshta
 * tayanch nuqta (tun / ertalab / tush / kech / kun oxiri) lentani
 * o'qish uchun yetarli.
 */
const HOUR_TICKS = new Set([0, 6, 12, 18, 23]);

/**
 * KUNLIK RITM — soat kesimi (issiqlik lentasi) va hafta kuni (barlar).
 *
 * ⚠️ IKKI O'LCHOV BITTA KARTADA va bu ataylab. "Qachon foydalanishadi"
 * degan savolning ikkita mustaqil javobi bor — SUTKA ichida va HAFTA
 * ichida — va ular faqat YONMA-YON turganda ma'no beradi: "kechqurun
 * 19:00, asosan seshanba" degan xulosa ikki alohida kartadan chiqmasdi.
 *
 * ⚠️ ISSIQLIK LENTASI, MATRITSA EMAS. To'liq 7×24 matritsa (168 katak)
 * server javobida yo'q — u ikkita mustaqil proyeksiya beradi. Matritsa
 * ko'rinishida chizilsa, ikki proyeksiyani ko'paytirib TO'QIB
 * chiqarishga to'g'ri kelardi va ekranda mavjud bo'lmagan ma'lumot
 * paydo bo'lardi.
 *
 * @param {object} props
 * @param {object} props.data - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0]
 * @param {string} [props.className]
 */
export const HourHeatmap = ({ data, isLoading, isError, delay = 0, className }) => {
  // ⚠️ Shart `useMemo` ICHIDA: `data?.hourly ?? []` bog'liqlik ro'yxatiga
  // chiqarilsa har renderda yangi massiv hosil bo'lib, memo hech qachon
  // keshlanmasdi (etalon `MetricStrip` dagi bilan bir xil tuzoq).
  const view = useMemo(() => {
    const hourly = data?.hourly ?? [];
    const weekly = data?.weekday ?? [];

    const hourMax = hourly.reduce((max, row) => Math.max(max, row.value ?? 0), 0);
    const dayMax = weekly.reduce((max, row) => Math.max(max, row.value ?? 0), 0);

    // Cho'qqi — qiymati NOLDAN katta bo'lgandagina topiladi: bo'sh davrda
    // "eng faol: 00:00" degan yolg'on chip chiqmasligi kerak.
    const peakHour = hourly.reduce(
      (best, row) => ((row.value ?? 0) > (best?.value ?? 0) ? row : best),
      null,
    );
    const peakDay = weekly.reduce(
      (best, row) => ((row.value ?? 0) > (best?.value ?? 0) ? row : best),
      null,
    );

    /**
     * ⚠️ DUSHANBADAN BOSHLANADI, serverdagi tartibda EMAS. Server
     * PostgreSQL DOW ni beradi (0 = yakshanba) va bu MASHINA tartibi;
     * maktab haftasi esa dushanbadan boshlanadi va dam olish kuni
     * oxirida turadi. Yakshanba birinchi ustunda tursa, "hafta oxirida
     * faollik tushadi" degan naqsh ro'yxatning ikki chekkasiga
     * bo'linib, ko'rinmay qolardi. Yorliq baribir `row.day` bo'yicha
     * olinadi, ya'ni tartib o'zgarishi nomni siljitmaydi.
     */
    const days = [...weekly].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));

    return { hourly, days, hourMax, dayMax, peakHour, peakDay };
  }, [data]);

  const chipDelay = contentDelay(delay);

  return (
    <Panel
      title="Foydalanish ritmi"
      hint="Toshkent vaqti bo'yicha"
      icon={Clock}
      tone="bot"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={view.hourMax === 0 && view.dayMax === 0}
      emptyText="Bu davrda birorta harakat qayd etilmagan"
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Cho'qqi — kartaning bitta jumlali xulosasi: qolgan hamma
            narsa shu ikki raqamning tafsiloti */}
        {view.peakHour && (
          <div className={MOTION.enterUp} style={{ animationDelay: `${chipDelay}ms` }}>
            <span className={cn(CHIP.base, CHIP.tone.bot)}>
              Eng faol: {hourLabel(view.peakHour.hour)}
              {view.peakDay ? ` · ${capitalize(DAYS_UZ[view.peakDay.day] ?? "")}` : ""}
            </span>
          </div>
        )}

        {/* ── Soat kesimi ─────────────────────────────────────────── */}
        <div className="mt-3">
          <p className={T.label}>Soat kesimi</p>

          {/*
            ⚠️ 24 ustun ARBITRAR qiymat bilan: Tailwind standartda faqat
            `grid-cols-12` gacha beradi va konfigni kengaytirish butun
            tizimga ta'sir qiladi. Mobilda 12 ustun — lenta ikki qatorga
            bo'linadi, ya'ni katakcha barmoq uchun yetarli kattalikda
            qoladi.
          */}
          <div className="mt-2 grid grid-cols-12 gap-1 sm:grid-cols-[repeat(24,minmax(0,1fr))]">
            {view.hourly.map((row, index) => (
              <div key={row.hour} className="flex flex-col items-center gap-1">
                {/*
                  ⚠️ Yorliq HAR katakchaning O'Z ustunida turadi (ostiga
                  alohida qator chizilmaydi): mobilda lenta ikki qatorga
                  bo'linadi va mustaqil yorliq qatori o'sha yerda
                  katakchalardan ajralib qolardi.
                */}
                <span
                  title={`${hourLabel(row.hour)} — ${row.value ?? 0} harakat`}
                  className={cn("block aspect-square w-full rounded-[5px]", MOTION.tick)}
                  style={{
                    backgroundColor: heatColor(row.value ?? 0, view.hourMax),
                    animationDelay: `${chipDelay + index * HOUR_STEP}ms`,
                  }}
                />
                <span className={cn(T.meta, "h-3 leading-3 tabular-nums")}>
                  {HOUR_TICKS.has(row.hour) ? String(row.hour).padStart(2, "0") : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hafta kuni ──────────────────────────────────────────── */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <p className={T.label}>Hafta kuni</p>

          {/*
            ⚠️ BU RO'YXAT EMAS, ETTITA BAR — shuning uchun `ROW.base`
            hairline'lari bu yerda QO'LLANMAYDI: yetti qatorning har
            biriga ajratuvchi chizilsa, o'lchov jadvalga aylanib,
            yonidagi issiqlik lentasi bilan raqobatlashardi. Ajratuvchi
            vazifasini barning o'zi bajaradi — u to'ldirilgan uzunlik
            bilan qatorni ko'rsatadi.
          */}
          <ul className="mt-2 flex flex-1 flex-col justify-center gap-1.5">
            {view.days.map((row, index) => (
              <WeekdayBar
                key={row.day}
                row={row}
                max={view.dayMax}
                // ⚠️ Barlar soat lentasi TO'LGANDAN keyin boshlanadi:
                // ikki blok bir vaqtda kirsa, ko'z qaysi birini
                // kuzatishni bilmay, ikkalasini ham o'qimay qolardi.
                delay={contentDelay(delay, stepIndex(index)) + HOUR_SWEEP}
              />
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
};

/**
 * Bitta hafta kuni — qisqa nom, to'lgan bar va son.
 *
 * ⚠️ Alohida komponent, chunki `useCountUp` HOOK: uni `.map()` ichida
 * chaqirib bo'lmaydi. Sonlar davr bo'yicha yig'ilgani uchun to'rt
 * xonaga chiqishi mumkin — sanoq shu yerda ma'noli.
 *
 * ⚠️ Yorliq va raqam QAT'IY KENGLIKDA (`w-9` / `w-14`): barning ikki
 * cheti hamma qatorda bir xil vertikalda turishi kerak, aks holda
 * uzunliklarni ko'z bilan taqqoslab bo'lmasdi.
 */
const WeekdayBar = ({ row, max, delay }) => {
  const value = useCountUp(row.value ?? 0);

  // ⚠️ Nolga TENG bo'lmagan kun har doim ko'rinadi (eng kamida 2%):
  // 5000 dan 3 ta harakat matematik jihatdan 0% bo'lib, bar butunlay
  // yo'qolardi va "3 harakat" bilan "harakat yo'q" bir xil ko'rinardi.
  const ratio = max > 0 ? ((row.value ?? 0) / max) * 100 : 0;
  const width = row.value > 0 ? Math.max(2, Math.round(ratio)) : 0;

  return (
    <li
      className={cn("flex items-center gap-3", MOTION.enterUp)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={cn(T.meta, "w-9 shrink-0")}>{WEEKDAYS_SHORT[row.day] ?? "—"}</span>

      {/* ⚠️ Bu IKKILAMCHI o'lchov — `BAR.sheen` YO'Q. Doimiy harakat
          faqat kartaning asosiy ko'rsatkichida bo'ladi; yetti barda
          bir vaqtda yugursa, ekran chaqnab turgan bo'lardi. */}
      <div className={cn(BAR.track, "min-w-0 flex-1")}>
        <div
          className={cn(BAR.fill, "bg-violet-500")}
          style={{ width: `${width}%`, animationDelay: `${delay + 60}ms` }}
        />
      </div>

      <span className={cn(T.tdNum, "w-14 shrink-0 text-right")}>
        {Number(value ?? 0).toLocaleString("uz-UZ")}
      </span>
    </li>
  );
};

/* ═══════════════════════ KANALLAR ═══════════════════════ */

/**
 * Ikki HEX orasidagi oraliq rang.
 *
 * @param {string} from - "#RRGGBB"
 * @param {string} to - "#RRGGBB"
 * @param {number} t - 0..1
 * @returns {string} "#RRGGBB"
 */
const mixHex = (from, to, t) => {
  const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (a, b) =>
    Math.round(a + (b - a) * t)
      .toString(16)
      .padStart(2, "0");

  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
};

/**
 * SKY OHANGINING POG'ONASI — `HUE.panel` (to'q) dan `HUE.panelSoft`
 * (och) gacha.
 *
 * ⚠️ QOTIB QOLGAN HEX RO'YXATI EMAS. Kanallar katalogi serverdan
 * keladi va o'sishi mumkin (hozir bot + beshta panel). Qat'iy ro'yxat
 * yo tugab qolardi, yo aylanib ikki kanalga bir xil rang berardi —
 * ikkalasi ham "rang nimani bildiradi" degan savolni buzardi. Ikki
 * TOKEN orasidagi oraliq esa nechta kanal bo'lsa ham tartibli qoladi.
 *
 * ⚠️ Ohang bitta (sky) — kamalak emas: kanallar TARTIBLANGAN ro'yxat,
 * har biriga mustaqil rang berilsa, ular o'zaro bog'liq emasdek
 * ko'rinardi.
 */
const skyStep = (index, count) =>
  count <= 1 ? HUE.panel : mixHex(HUE.panel, HUE.panelSoft, index / (count - 1));

/**
 * KANALLAR — qaysi ilovadan foydalanishadi.
 *
 * ⚠️ ULUSH NOYOB ODAMLAR bo'yicha, harakatlar bo'yicha EMAS. Bitta
 * xodim bir kunda yuzlab harakat qiladi, ota-ona esa bir-ikkita:
 * harakatlar bo'yicha bo'linsa, o'nlab xodim minglab ota-onadan
 * "kattaroq" ko'rinardi. Harakatlar soni baribir qatorda turadi —
 * u boshqa savolning (yuklama) javobi.
 *
 * ⚠️ Bot BINAFSHA, qolganlari SKY va bu rang siyosati (`pulse.tokens`):
 * violet — tashqi jalb qilinganlik, sky — ichki foydalanish. Ikkalasi
 * bitta ro'yxatda tursa ham, ular ikki xil savolga tegishli.
 *
 * @param {object} props
 * @param {object} props.data - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0]
 * @param {string} [props.className]
 */
export const ChannelSplit = ({ data, isLoading, isError, delay = 0, className }) => {
  const view = useMemo(() => {
    const rows = data?.channels ?? [];
    const totalUsers = rows.reduce((sum, row) => sum + (row.users ?? 0), 0);

    // ⚠️ Kattadan kichikka saralanadi, server tartibida emas: bu
    // TAQQOSLASH ro'yxati va tartibsiz barlarni taqqoslash uchun ko'z
    // ro'yxat bo'ylab oldinga-orqaga yugurishi kerak bo'lardi.
    const sorted = [...rows].sort(
      (a, b) => (b.users ?? 0) - (a.users ?? 0) || (b.events ?? 0) - (a.events ?? 0),
    );

    // Sky pog'onalari faqat bot BO'LMAGAN kanallar orasida taqsimlanadi:
    // bot ro'yxatning qayerida tursa ham o'z rangini saqlaydi.
    //
    // ⚠️ Kalitlar ro'yxati OLDIN yig'iladi va pog'ona `indexOf` bilan
    // topiladi — `map()` ichidagi o'suvchi hisoblagich EMAS: render
    // paytida o'zgaruvchini mutatsiya qilish React compiler qoidasini
    // buzadi (`react-hooks/immutability`) va qayta renderda tartib
    // siljib ketishi mumkin. Kanal soni oltitadan oshmaydi, ya'ni
    // qidiruvning narxi yo'q.
    const panelKeys = sorted.filter((row) => row.key !== "bot").map((row) => row.key);

    const items = sorted.map((row) => {
      const share = totalUsers > 0 ? Math.round(((row.users ?? 0) / totalUsers) * 100) : 0;

      return {
        ...row,
        share,
        // Bar eni ulushdan biroz FARQ QILADI: 0% ga yaxlitlangan, lekin
        // odamlari bor kanal ko'rinib turishi kerak.
        width: row.users > 0 ? Math.max(2, share) : 0,
        color:
          row.key === "bot"
            ? HUE.bot
            : skyStep(panelKeys.indexOf(row.key), panelKeys.length),
      };
    });

    return { items, totalUsers };
  }, [data]);

  const isEmpty =
    view.items.length === 0 || view.items.every((row) => !row.users && !row.events);

  return (
    <Panel
      title="Kanallar"
      hint="Qaysi ilovadan foydalanishadi"
      icon={Radio}
      tone="panel"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      emptyText="Bu davrda birorta kanalda faollik yo'q"
      className={className}
    >
      {/*
        ⚠️ QATORLAR HAIRLINE BILAN AJRALADI (`ROW.list`), hover bilan
        EMAS. Ilgari qatorni faqat sichqoncha ustida turganda ko'rish
        mumkin edi — sichqonchasiz ekranda oq fonda matn oqimi turardi.
        Ro'yxat karta chetigacha cho'ziladi (`-mx-5`), shuning uchun
        ajratuvchi kontur emas, fonning tabiiy bo'linishi bo'lib ko'rinadi.
      */}
      <ul className={cn(ROW.list, "min-h-0 flex-1")}>
        {view.items.map((row, index) => (
          <ChannelRow
            key={row.key}
            row={row}
            // ⚠️ Sheen faqat BIRINCHI qatorda: ro'yxat ulush bo'yicha
            // kamayib boradi, ya'ni birinchi qator — "asosiy kanal".
            // Har barda bo'lsa, harakat "bu yerga qara" degan ma'nosini
            // yo'qotardi.
            isPrimary={index === 0 && (row.users ?? 0) > 0}
            delay={contentDelay(delay, stepIndex(index))}
          />
        ))}
      </ul>
    </Panel>
  );
};

/**
 * Bitta kanal qatori.
 *
 * ⚠️ Alohida komponent — `useCountUp` hookini `.map()` ichida chaqirib
 * bo'lmaydi (`WeekdayBar` dagi bilan bir xil sabab).
 *
 * ⚠️ Qator BOSILMAYDI — shuning uchun `div`, `button` emas va
 * `ROW.clickable` qo'yilmaydi: bosilmaydigan narsaga kursor va fokus
 * halqasi berilsa, foydalanuvchi uni bosib ko'rib, hech narsa
 * ochilmaganda tizimni "buzuq" deb hisoblardi.
 */
const ChannelRow = ({ row, isPrimary, delay }) => {
  const users = useCountUp(row.users ?? 0);

  return (
    <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      <div className={cn(ROW.base, ROW.hover)}>
        {/* Chap aksent — hover'da ochiladi. Rang siyosati: bot binafsha,
            panellar sky (`pulse.tokens` sarlavhasi) */}
        <span
          aria-hidden="true"
          className={cn(ROW.rail, row.key === "bot" ? "bg-violet-500" : "bg-sky-500")}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cn(T.tdName, "truncate")}>{row.label}</span>
            <span className={cn(T.meta, "shrink-0 tabular-nums")}>
              {Number(row.events ?? 0).toLocaleString("uz-UZ")} ta harakat
            </span>
          </div>

          {/* Rang HEX bilan (inline): u kanalning O'ZIGA bog'liq va ro'yxat
              uzunligiga qarab hisoblanadi — Tailwind sinfi bilan
              ifodalab bo'lmaydi */}
          <div className={cn(BAR.track, "mt-2")}>
            <div
              className={BAR.fill}
              style={{
                width: `${row.width}%`,
                backgroundColor: row.color,
                animationDelay: `${delay + 60}ms`,
              }}
            >
              {isPrimary && <span aria-hidden="true" className={BAR.sheen} />}
            </div>
          </div>
        </div>

        {/* ⚠️ Raqamlar O'NGGA tekislangan va qat'iy kenglikda: ustundagi
            sonlar bir-birining ostiga tushmasa, ro'yxat "sakrab"
            ko'rinadi va taqqoslash imkoni yo'qoladi. */}
        <div className="w-[86px] shrink-0 text-right">
          <p className={cn(T.tdNum, "leading-tight")}>
            {Number(users ?? 0).toLocaleString("uz-UZ")}
            <span className={cn(T.meta, "ml-1")}>kishi</span>
          </p>
          <p className={cn(T.meta, "mt-1 tabular-nums leading-tight")}>
            {pct(row.share)} ulush
          </p>
        </div>
      </div>
    </li>
  );
};

export default HourHeatmap;
