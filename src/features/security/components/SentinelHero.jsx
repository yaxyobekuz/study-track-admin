// Icons
import { LogIn, ShieldAlert, ShieldCheck, Users } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useCountUp from "@/shared/hooks/useCountUp";

// Tokens
import {
  CHIP,
  DELAY,
  MOTION,
  SEVERITY,
  SEVERITY_ORDER,
  SURFACE,
  T,
} from "../data/sentinel.tokens";

/**
 * KUZATUV PANELI — xavfsizlik bo'limining yagona og'irlik markazi.
 *
 * ⚠️ UCHTA SAVOL, UCHTA QISM — va ular BIR-BIRINI TAKRORLAMAYDI:
 *
 *   Chap    — "hozir tizimda kim bor?"       (ochiq seanslar)
 *   Markaz  — "qanchalik jiddiy holat?"      (jiddiylik ustunchalari)
 *   O'ng    — "bugun nima bo'ldi?"           (uchta fakt)
 *
 * Bir raqam ikki qismda ko'rinsa, foydalanuvchi "qaysi biri to'g'ri"
 * deb o'ylay boshlardi.
 *
 * ⚠️ HOLAT YAXShI BO'LSA, U ShUNDAY KO'RINADI. Ogohlantirish
 * bo'lmaganda markaz bo'sh qolmaydi — qalqon ikonkasi va yashil
 * yozuv turadi. Bo'sh joy "ma'lumot kelmadi" degan shubha tug'dirardi,
 * holbuki bu bo'limdagi eng yaxshi natija aynan shu.
 *
 * ⚠️ EKRANDAGI YAGONA DOIMIY HARAKAT — `heroScan` (va jonli nuqta).
 * Ogohlantirish ustunchalari CHAQNAMAYDI: jiddiylik rang va balandlik
 * bilan beriladi (`sentinel.tokens.js` sarlavhasidagi qoida).
 *
 * @param {object} props
 * @param {object} [props.data] - `GET /security/overview` javobining `data` qismi
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay] - kirish animatsiyasi kechikishi (ms)
 * @param {string} [props.className]
 */
const SentinelHero = ({ data, isLoading, isError, delay = DELAY.hero, className }) => {
  const now = data?.now;
  const scope = data?.scope;

  // ⚠️ `alerts.counts.open` EMAS, jiddiylik yig'indisi: ustunchalar
  // aynan shu obyektdan chiziladi va "hech narsa yo'q" xulosasi ham
  // ular bilan bitta manbadan chiqishi kerak. Ikki manba bo'lsa,
  // "Ochiq ogohlantirish yo'q" yozuvi ostida to'lgan ustun turishi
  // mumkin edi.
  const severity = data?.alerts?.severity;
  const columns = SEVERITY_ORDER.map((key) => ({
    key,
    label: SEVERITY[key].label,
    hex: SEVERITY[key].hex,
    count: Number(severity?.[key] ?? 0),
  }));
  const alertTotal = columns.reduce((sum, column) => sum + column.count, 0);

  const contentDelay = delay + DELAY.content;

  // Ma'lumot chegaralanganini yashirish YOLG'ON bo'lardi — izohlar
  // heroning eng pastida, lekin doim ko'rinadi
  const notes = [];
  if (scope && scope.allBranches === false) {
    notes.push(
      scope.branchName ? `Faqat ${scope.branchName} filiali` : "Faqat bitta filial",
    );
  }
  if (data?.collecting) {
    notes.push(
      data.sinceLabel
        ? `Ma'lumot yig'ilmoqda — ${data.sinceLabel} dan boshlab`
        : "Ma'lumot yig'ilmoqda",
    );
  }

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-5 sm:px-6", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Fon qatlamlari — ikkalasi ham bezak, kontent emas */}
      <span className={SURFACE.heroGlow} aria-hidden="true" />
      <span className={SURFACE.heroGlowAlt} aria-hidden="true" />
      <span className={SURFACE.heroScan} aria-hidden="true" />

      {isError ? (
        <HeroError />
      ) : isLoading ? (
        <HeroSkeleton />
      ) : (
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
          <LiveSessions
            sessions={now?.liveSessions}
            users={now?.liveUsers}
            delay={contentDelay}
          />

          <SeverityColumns
            columns={columns}
            total={alertTotal}
            delay={contentDelay}
          />

          <TodayTiles now={now} delay={contentDelay} />
        </div>
      )}

      {/* ── Chegaralanish izohlari ─────────────────────────────────── */}
      {!isLoading && !isError && notes.length > 0 && (
        <div className="relative mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {notes.map((note, index) => (
            <span key={note} className={cn(T.metaDark, "flex items-center gap-2.5")}>
              {index > 0 && (
                <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
              )}
              {note}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

/* ═══════════════════════ CHAP — HOZIR TIZIMDA ═══════════════════════ */

/**
 * OCHIQ SEANSLAR — heroning eng katta raqami.
 *
 * ⚠️ SEANS VA FOYDALANUVCHI — IKKI XIL SON va ikkalasi ham kerak.
 * Bitta odam uchta qurilmadan kirgan bo'lishi mumkin; faqat seansni
 * ko'rsatsak "35 kishi ishlayapti" degan yolg'on chiqardi, faqat
 * odamni ko'rsatsak esa o'ngdagi "bir nechta seansli hisob" signali
 * qayerdan chiqqani tushunarsiz bo'lardi.
 */
const LiveSessions = ({ sessions, users, delay }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-2">
      <span className={MOTION.liveDot} aria-hidden="true">
        <span className={MOTION.liveRing} />
        <span className={cn(MOTION.liveCore, "relative")} />
      </span>
      <p className={T.labelDark}>Hozir tizimda</p>
    </div>

    <p className="mt-3">
      <CountValue value={sessions} delay={delay} className={cn(T.valueHero, T.size3xl)} />
    </p>

    <p className={cn(T.metaDark, "mt-2.5")}>ochiq seans</p>
    <p className={cn(T.metaDark, "mt-1")}>
      {users == null ? "—" : `${users} ta foydalanuvchi`}
    </p>
  </div>
);

/* ═══════════════════════ MARKAZ — JIDDIYLIK ═══════════════════════ */

/** Ustun maydonining balandligi (px) — foiz shu qutidan olinadi. */
const COLUMN_BOX = 76;

/**
 * JIDDIYLIK USTUNCHALARI — to'rt pog'ona bitta shkalada.
 *
 * ⚠️ BALANDLIK ENG KATTASIGA NISBATAN, mutlaq songa emas: 40 ta "past"
 * va 2 ta "jiddiy" bo'lgan holatda mutlaq shkala jiddiy ustunni
 * ko'rinmas qilardi, holbuki ekran aynan shu ikkitasi uchun ochiladi.
 *
 * ⚠️ NOL USTUN SEVERITY RANGIDA EMAS, so'nik oq chiziq. To'liq quyuq
 * rose "asos" chizig'i "bitta jiddiy ogohlantirish bor" deb yolg'on
 * aytardi; chiziqning o'zi esa kerak — usiz to'rt ustun qatorida
 * teshik paydo bo'lib, yorliqlar qaysi ustunga tegishli ekani
 * bilinmasdi.
 *
 * ⚠️ Rang YAGONA belgi emas: har ustun ostida SONI va YORLIG'I turadi
 * (tokens fayldagi qoida) — rangni ajrata olmaydigan ko'z uchun.
 */
const SeverityColumns = ({ columns, total, delay }) => {
  if (total === 0) return <AllClear delay={delay} />;

  const max = Math.max(...columns.map((column) => column.count), 1);

  return (
    <div className="min-w-0">
      <p className={T.labelDark}>Jiddiylik bo'yicha</p>

      <div className="mt-3 flex items-end gap-2 sm:gap-3">
        {columns.map((column, index) => {
          // Nolga 3% "asos", qolganiga kamida 12%: bitta hodisa ham
          // ko'rinadigan bo'lishi kerak, aks holda "1 ta jiddiy"
          // yorlig'i ostida bo'sh joy turardi
          const ratio = column.count > 0 ? Math.max(12, (column.count / max) * 100) : 3;

          return (
            <div key={column.key} className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className="flex w-full items-end"
                style={{ height: `${COLUMN_BOX}px` }}
              >
                {/* ⚠️ `animate-grow-y` sinfi to'g'ridan-to'g'ri yozilgan:
                    `MOTION` faqat bo'lim bo'ylab TAKRORLANADIGAN
                    harakatlarni saqlaydi, tik to'lish esa Sentinelda
                    faqat shu yerda uchraydi */}
                <span
                  className={cn(
                    "w-full rounded-t-[3px] origin-bottom",
                    "motion-safe:animate-grow-y",
                  )}
                  style={{
                    height: `${ratio}%`,
                    background: column.count > 0 ? column.hex : "rgba(255,255,255,0.12)",
                    animationDelay: `${delay + index * 90}ms`,
                  }}
                  aria-hidden="true"
                />
              </div>

              <CountValue
                value={column.count}
                delay={delay + index * 90}
                className={cn(T.valueHero, T.sizeMd, "mt-2.5")}
              />
              <span className={cn(T.metaDark, "mt-1 truncate")}>{column.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * OGOHLANTIRISH YO'Q — bu HOLAT, bo'shliq emas.
 *
 * ⚠️ Yashil bu ekranda "muammo yo'q" degan yagona ma'noni tashiydi
 * (tokens: shuning uchun muvaffaqiyatli kirish KO'K). Shu sababli
 * emerald faqat shu yerda va jonli nuqtada ishlatiladi.
 *
 * ⚠️ HOLAT MATNI tipografiyasi `T` dan emas: `T` o'lchov va yorliq
 * uchun, holat xabari esa `Panel` dagi "Ma'lumotni yuklab bo'lmadi"
 * bilan bir oilada — ikkalasi bitta naqsh (shu fayldagi `HeroError`
 * ham shunday).
 */
const AllClear = ({ delay }) => (
  <div
    className={cn("flex min-w-0 flex-col items-center justify-center gap-2 py-2", MOTION.enterUp)}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="flex size-11 items-center justify-center rounded-full bg-emerald-400/12">
      <ShieldCheck className="size-5 text-emerald-300" strokeWidth={2} />
    </span>
    <p className="text-[12.5px] font-semibold text-emerald-200">Ochiq ogohlantirish yo'q</p>
    <p className={T.metaDark}>Barcha pog'onalar bo'sh</p>
  </div>
);

/* ═══════════════════════ O'NG — BUGUNGI FAKTLAR ═══════════════════════ */

/**
 * UCHTA PLITKA — bugungi kunning uchta faktik soni.
 *
 * ⚠️ "Bir nechta seansli hisob" BIRINCHI turadi va nolga teng
 * bo'lmaganda rose ohangga o'tadi: bitta login bilan bir necha
 * qurilmadan kirish — parol tarqalganining eng erta belgisi, ya'ni
 * ekrandagi ASOSIY signal. Qolgan ikkitasi kontekst beradi.
 */
const TodayTiles = ({ now, delay }) => {
  const shared = Number(now?.multiSessionUsers ?? 0);

  const tiles = [
    {
      key: "multi",
      icon: Users,
      label: "Bir nechta seansli hisob",
      value: now?.multiSessionUsers,
      suffix: "ta hisob",
      alert: shared > 0,
    },
    {
      key: "success",
      icon: LogIn,
      label: "Bugun kirdi",
      value: now?.todaySuccess,
      suffix: "marta",
    },
    {
      key: "failed",
      icon: ShieldAlert,
      label: "Bugun rad etildi",
      value: now?.todayFailed,
      suffix: "urinish",
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* ⚠️ `key` spread'dan AJRATIB olinadi: `{...tile}` ichida ham
          `key` maydoni bor va React uni "spread orqali kelgan key" deb
          ogohlantiradi — u propga aylanmaydi, faqat shovqin qiladi */}
      {tiles.map(({ key, ...tile }, index) => (
        <FactTile key={key} {...tile} delay={delay + index * 70} />
      ))}
    </div>
  );
};

const FactTile = ({ icon: Icon, label, value, suffix, alert = false, delay }) => (
  <div
    className={cn(
      SURFACE.tileDark,
      "flex items-center gap-3 px-3.5 py-2.5",
      MOTION.enterUp,
      // ⚠️ `bg-rose-500/[0.13]` `tileDark` fonini ALMAShTIRADI (twMerge
      // bitta xususiyatning oxirgisini qoldiradi) — signal plitkasi
      // qolgan ikkitasidan darhol ajralib turishi kerak
      alert && "bg-rose-500/[0.13]",
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <Icon
      className={cn("size-4 shrink-0", alert ? "text-rose-300" : "text-white/35")}
      strokeWidth={2}
      aria-hidden="true"
    />

    <div className="min-w-0 flex-1">
      <p className={cn(T.labelDark, "truncate")}>{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <CountValue value={value} delay={delay} className={cn(T.valueHero, T.sizeLg)} />
        <span className={T.metaDark}>{suffix}</span>
      </p>
    </div>

    {alert && (
      <span className={cn(CHIP.base, CHIP.toneDark.alert, "shrink-0")}>Tekshiring</span>
    )}
  </div>
);

/* ═══════════════════════ UMUMIY ═══════════════════════ */

/**
 * SANALADIGAN SON.
 *
 * ⚠️ `null`/`undefined` → em-dash, NOL EMAS. "Ma'lumot kelmadi" bilan
 * "hech kim yo'q" bir xil ko'rinsa, bo'sh ekran ishonch hosil qilardi.
 */
const CountValue = ({ value, delay, className }) => {
  const target = value == null || Number.isNaN(Number(value)) ? null : Number(value);
  const counted = useCountUp(target, { delay, duration: 1100 });

  return (
    <span className={className}>
      {counted == null ? "—" : counted.toLocaleString("uz-UZ")}
    </span>
  );
};

/**
 * YUKLANISh — heroning SHAKLINI saqlagan skelet.
 *
 * ⚠️ Spinner EMAS: uch qismli tuzilma joyida qoladi va kontent
 * kelganda blok "sakramaydi" (`Panel` dagi bilan bitta qoida).
 */
const HeroSkeleton = () => (
  <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
    <div>
      <div className="h-2.5 w-24 rounded-full bg-white/10 motion-safe:animate-breathe" />
      <div className="mt-3.5 h-9 w-24 rounded-lg bg-white/10 motion-safe:animate-breathe" />
      <div className="mt-3 h-2 w-32 rounded-full bg-white/10 motion-safe:animate-breathe" />
    </div>

    <div>
      <div className="h-2.5 w-28 rounded-full bg-white/10 motion-safe:animate-breathe" />
      <div className="mt-3 flex items-end gap-2 sm:gap-3" style={{ height: `${COLUMN_BOX}px` }}>
        {[64, 44, 30, 18].map((height, index) => (
          <div
            key={height}
            className="flex-1 rounded-t-[3px] bg-white/10 motion-safe:animate-breathe"
            style={{ height: `${height}%`, animationDelay: `${index * 140}ms` }}
          />
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-[54px] rounded-2xl bg-white/[0.06] motion-safe:animate-breathe"
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </div>
  </div>
);

/** Xato — hero shakli saqlanadi, lekin birorta son ko'rsatilmaydi. */
const HeroError = () => (
  <div className="relative flex min-h-[128px] flex-col items-center justify-center gap-2">
    <ShieldAlert className="size-5 text-white/30" strokeWidth={1.8} aria-hidden="true" />
    <p className="text-[12.5px] font-medium text-white/60">Ma'lumotni yuklab bo'lmadi</p>
    <p className={T.metaDark}>Sahifani yangilab ko'ring</p>
  </div>
);

export default SentinelHero;
