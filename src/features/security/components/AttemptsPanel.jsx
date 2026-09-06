// Icons
import {
  AlertTriangle,
  HelpCircle,
  KeyRound,
  Monitor,
  MonitorSmartphone,
  ShieldX,
  Smartphone,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { BAR, MOTION, RAIL, ROW, T, contentDelay } from "../data/sentinel.tokens";

// Components
import Panel from "./Panel";

/**
 * KIRISH URINISHLARI BLOKI — uchta karta bitta faylda.
 *
 * Uchalasi BITTA savolning uch qirrasi: "kim kirdi, nega kirmadi va
 * nimadan kirdi". Ular bitta ma'lumot tugunidan (`data.attempts`,
 * `data.devices`) oziqlanadi va bir xil qatordan (urinish) chiqadi —
 * shu sababli bitta faylda turadi. Alohida fayllarga bo'linsa, qator
 * shakli (nuqta → nom → texnik ma'lumot) uch joyda mustaqil
 * o'zgarardi.
 *
 * ⚠️ QATORLAR ENDI HAIRLINE BILAN AJRALADI (`ROW.*`), HOVER BILAN EMAS.
 * Ilgari qator o'z chegarasini faqat sichqoncha ustida turganda
 * ko'rsatardi va sichqonchasiz ekranda oq fonda matn oqimi qolardi:
 * ko'z bir qator qayerda tugab, ikkinchisi qayerdan boshlanganini
 * topa olmasdi. Bu ro'yxatlarning butun ma'nosi esa QATORMA-QATOR
 * taqqoslash — ya'ni ajratuvchi hovering'ga bog'liq bo'lishi mumkin
 * emas. Qatorlar `-mx-5` bilan karta chetigacha cho'ziladi
 * (`ROW.list`): ichkarida qolgan ajratuvchi "jadval" bo'lib
 * ko'rinardi, chetgacha cho'zilgani esa fonning tabiiy bo'linishi.
 */

/* ═══════════════════════ UMUMIY YORDAMCHILAR ═══════════════════════ */

/**
 * Butun sonlarni guruhlaydi — "12 480".
 *
 * ⚠️ Modul darajasida bir marta yaratiladi (`MetricStrip.jsx` dagi
 * qoida): `Intl.NumberFormat` konstruktori qimmat va uni har render
 * qatorida chaqirish uzun ro'yxatda sezilarli bo'lardi.
 */
const countFormatter = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 });

/** Bo'sh/yaroqsiz son → em-dash (sana qoidasidagi kabi "bo'sh — chiziq"). */
const formatCount = (value) =>
  Number.isFinite(value) ? countFormatter.format(Math.round(value)) : "—";

/** Bar kengligi uchun foizni 0..100 oralig'iga qisadi. */
const clampPct = (value) => Math.min(100, Math.max(0, Number(value) || 0));

/**
 * DOIMIY RELS — `ROW.rail` NING O'RNIGA, faqat urinishlar lentasida.
 *
 * ⚠️ `ROW.rail` `scale-y-0` bilan turadi va faqat hover/fokusda
 * ochiladi, chunki u BEZAK: "shu qator tanlandi" degan javob. Urinish
 * qatoridagi rels esa MA'NO tashiydi — kirish o'tdimi yoki yo'qmi
 * degan javob sichqoncha qatorning ustida turgan-turmaganiga bog'liq
 * bo'lishi mumkin emas. Shakl `AlertsPanel` dagi jiddiylik relsi bilan
 * AYNAN bir xil (3px): bir ekranda yonma-yon turgan ikki ro'yxat
 * relslari boshqa qalinlikda bo'lsa, ular boshqa narsani bildirayotgandek
 * ko'rinardi.
 */
const STATE_RAIL = "absolute inset-y-0 left-0 w-[3px]";

/**
 * Qurilma nomi → lucide ikonkasi.
 *
 * ⚠️ Server qurilmani ERKIN MATN sifatida beradi ("iPhone · iOS 17",
 * "Windows 10"), ya'ni qat'iy enum yo'q. Shu sababli moslashtirish
 * QISM-SATR bo'yicha va kichik harfda ishlaydi; tanib bo'lmagani
 * `HelpCircle` oladi va bu HALOL javob — noma'lum qurilmani
 * "kompyuter" deb chizsak, ekran o'zi bilmagan narsani tasdiqlagan
 * bo'lardi.
 *
 * ⚠️ Telefon TEKSHIRUVI BIRINCHI: "macOS" ichida "ios" qism-satri yo'q,
 * lekin kelajakda "iPadOS" kabi qiymat qo'shilsa, telefon shoxi uni
 * to'g'ri ushlab qoladi.
 *
 * @param {string} [device]
 * @returns {React.ComponentType}
 */
const deviceIcon = (device) => {
  const value = String(device ?? "").toLowerCase();

  if (
    value.includes("ios") ||
    value.includes("iphone") ||
    value.includes("ipad") ||
    value.includes("android")
  ) {
    return Smartphone;
  }

  if (
    value.includes("windows") ||
    value.includes("macos") ||
    value.includes("mac os") ||
    value.includes("linux")
  ) {
    return Monitor;
  }

  return HelpCircle;
};

/**
 * To'ldiriladigan bar — uchala kartada bir xil shakl (`BAR.*`).
 *
 * ⚠️ `aria-hidden`: bar yonidagi raqamning TAKRORI, uchinchi marta
 * aytilmaydi. Ekran o'qigich uchun qatorda son allaqachon bor.
 *
 * ⚠️ `sheen` (doimiy yorug'lik) FAQAT kartaning ASOSIY ko'rsatkichida
 * yoqiladi. Har ustunda bo'lsa, ekran chaqnab turgan bo'lardi va
 * harakat ma'nosini yo'qotardi — u "bu yerga qara" deb aytishi kerak,
 * "men bezakman" deb emas.
 *
 * @param {object} props
 * @param {number} props.width - 0..100
 * @param {string} props.tone - to'ldirish rangi (tailwind bg-*)
 * @param {number} props.delay - to'lish animatsiyasi kechikishi (ms)
 * @param {boolean} [props.sheen=false]
 * @param {string} [props.className]
 */
const Bar = ({ width, tone, delay, sheen = false, className }) => (
  <div aria-hidden="true" className={cn(BAR.track, className)}>
    <div
      className={cn(BAR.fill, tone)}
      style={{ width: `${clampPct(width)}%`, animationDelay: `${delay}ms` }}
    >
      {sheen && <span aria-hidden="true" className={BAR.sheen} />}
    </div>
  </div>
);

/* ═══════════════════════ KIRISH URINISHLARI ═══════════════════════ */

/**
 * URINISHLAR LENTASI — vaqt o'qi, eng yangisi tepada.
 *
 * ⚠️ MUVAFFAQIYATLI VA MUVAFFAQIYATSIZ URINISH BITTA RO'YXATDA. Faqat
 * rad etishlarni ko'rsatuvchi lenta "kecha soat ikkida shu IP dan o'n
 * marta xato parol, o'n birinchisida esa KIRDI" degan ketma-ketlikni
 * ikkiga bo'lib yuborardi — hujum belgisi esa aynan shu qo'shnilikda
 * ko'rinadi.
 *
 * ⚠️ QAYTA SARALANMAYDI: server tartibi — vaqt tartibi. Bu yerda
 * `sort` chaqirilsa, lentaning butun ma'nosi (ketma-ketlik) yo'qolardi.
 *
 * @param {object} props
 * @param {object} [props.data] - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {(userId: string) => void} [props.onSelectUser] - nomni bosganda
 * @param {number} [props.delay=0] - kirish animatsiyasi kechikishi (ms)
 * @param {string} [props.className]
 */
export const AttemptsFeed = ({
  data,
  isLoading = false,
  isError = false,
  onSelectUser,
  delay = 0,
  className,
}) => {
  const rows = data?.attempts?.recent ?? [];

  return (
    <Panel
      title="Kirish urinishlari"
      hint="Oxirgi urinishlar — o'tgani ham, o'tmagani ham"
      icon={KeyRound}
      tone="warn"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu davrda kirish urinishi qayd etilmagan"
      className={className}
    >
      {/* ⚠️ Ro'yxat KARTA ICHIDA suriladi, sahifa emas: urinishlar soni
          oldindan noma'lum (bir kunda yuzta ham bo'lishi mumkin) va
          blok qo'shnilarini pastga surib yuborsa, to'r buzilardi.
          Balandlik shu blokda 460px — u lenta va qo'shni kartalardan
          uzunroq bo'lishi kerak, shuning uchun `ROW.scroll` ning 420px i
          ataylab qayta yoziladi. */}
      <ul className={cn(ROW.list, ROW.scroll, "max-h-[460px] min-h-0 flex-1")}>
        {rows.map((row, index) => (
          <AttemptRow
            key={row.id}
            row={row}
            onSelectUser={onSelectUser}
            // ⚠️ Kirish kechikishi O'NINCHI QATORDA TO'XTAYDI: yuzta
            // urinish kelganda oxirgisi bir necha soniya kutib
            // turmasligi kerak — ro'yxat darhol to'liq bo'lishi shart.
            delay={contentDelay(delay, Math.min(index, 10))}
          />
        ))}
      </ul>
    </Panel>
  );
};

/**
 * BITTA URINISH QATORI.
 *
 * ⚠️ `userId === null` — MAVJUD BO'LMAGAN LOGIN bilan urinish va bu
 * qatorlar ro'yxatning eng muhim qatorlari. Xodim parolni adashtirsa,
 * login TO'G'RI bo'ladi va qator odatdagi ko'rinishda qoladi; login
 * ham topilmasa, demak kimdir NOM TANLAB ko'ryapti — aynan shu
 * ketma-ket qatorlar (ko'pincha bitta IP dan) hujum belgisi. Shu
 * sababli ular kursiv + ogohlantirish ikonkasi bilan ajratiladi.
 *
 * ⚠️ Bunday qator BOSILMAYDI ham: ortida foydalanuvchi yo'q. Bosiladigan
 * qilib qo'yilsa, interfeys mavjud bo'lmagan kartochkaga yo'l ko'rsatib,
 * "bu odam bizda bor" degan yolg'on taassurot berardi.
 *
 * ⚠️ CHAPDAGI HOLAT NUQTASI OLIB TAShLANDI. Endi holatni QATOR RELSI
 * aytadi (ko'k — o'tdi, qizil — o'tmadi) va nuqta o'sha ma'noni ikkinchi
 * marta, undan zaifroq qilib takrorlar edi: rels qatorning butun
 * balandligiga cho'ziladi, nuqta esa 6px. Ikkalasi yonma-yon qolsa,
 * ko'z ikkita signalni taqqoslashga majbur bo'lardi. Nuqta ketgani bilan
 * chap ustun ham bo'shab, nom relsdan boshlanadi.
 *
 * ⚠️ Rang yagona belgi EMAS: yonida ekran o'qigich uchun yashirin izoh
 * turadi va rad etish sababi matn bilan yoziladi.
 *
 * ⚠️ BOSISH MAYDONI — BUTUN QATOR, nomning o'zi emas. 12px lik matn
 * nishoni sichqonchada ham, teginishda ham noqulay edi; qator esa
 * `ROW.clickable` bilan klaviatura fokusini ham to'liq oladi. Nom
 * `group-hover` orqali javob beradi — ya'ni qayerni bosish mumkinligi
 * baribir ko'rinadi.
 */
const AttemptRow = ({ row, onSelectUser, delay }) => {
  const isUnknownLogin = row.userId == null;
  const name = row.name || row.username || "—";
  const canSelect = !isUnknownLogin && Boolean(row.userId) && typeof onSelectUser === "function";

  // Sabab va qurilma — bitta izoh qatori; IP mono shriftda, chunki u
  // O'QILMAYDI, taqqoslanadi (ustunda belgilar tik tekislanadi)
  const meta = [row.reasonLabel, row.device].filter(Boolean);

  // Bosiladigan qator tugma, bosilmaydigani oddiy blok bo'ladi:
  // interaktiv bo'lmagan qatorga `button` berilsa, klaviatura undan
  // ham to'xtab o'tardi
  const Shell = canSelect ? "button" : "div";

  return (
    <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      <Shell
        type={canSelect ? "button" : undefined}
        onClick={canSelect ? () => onSelectUser(row.userId) : undefined}
        className={cn(
          ROW.base,
          ROW.hover,
          // Indigo — bu bo'limning interaktiv ohangi (`SessionsPanel`
          // bilan bir xil); jiddiylik shkalasidagi ranglar band
          canSelect && cn(ROW.clickable, "ring-indigo-400/60"),
        )}
      >
        {/* Holat relsi — DOIMIY, hover'ga bog'liq emas */}
        <span
          aria-hidden="true"
          className={cn(STATE_RAIL, row.success ? RAIL.tone.success : RAIL.tone.alert)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            {isUnknownLogin && (
              <AlertTriangle className="size-3 shrink-0 text-amber-500" strokeWidth={2.4} />
            )}

            <span
              className={cn(
                T.tdName,
                "truncate",
                isUnknownLogin && "italic",
                canSelect &&
                  "underline-offset-2 transition-colors duration-200 " +
                    "group-hover:text-indigo-600 group-hover:underline",
              )}
            >
              {isUnknownLogin ? row.username || "—" : name}
            </span>

            {/* Rang yagona belgi emas — holat matn bilan ham aytiladi */}
            <span className="sr-only">
              {row.success ? "kirish o'tdi" : "kirish o'tmadi"}
              {isUnknownLogin && ", bunday login mavjud emas"}
            </span>
          </div>

          <p className={cn(T.meta, "mt-0.5 truncate text-slate-400")}>
            {meta.length > 0 ? meta.join(" · ") : "—"}
            {row.ip && (
              <>
                <span aria-hidden="true"> · </span>
                <span className={T.mono}>{row.ip}</span>
              </>
            )}
          </p>
        </div>

        {/* ⚠️ Sana SERVERDAN tayyor matn (`createdLabel`) — bu yerda
            formatlash YO'Q (sana qoidasi: yagona manba serverda) */}
        <span className={cn(T.meta, "ml-auto shrink-0 tabular-nums text-slate-400")}>
          {row.createdLabel || "—"}
        </span>
      </Shell>
    </li>
  );
};

/* ═══════════════════════ RAD ETISH SABABLARI ═══════════════════════ */

/**
 * RAD ETISH SABABLARI SHKALASI — bitta ohangning pog'onalari.
 *
 * ⚠️ Tokens fayliga QO'ShILMADI: bu yangi rang emas, `RAIL.tone.alert`
 * (rose-500) ning FREKVENSIYA pog'onalari va u faqat shu kartaga
 * tegishli. Jiddiylik shkalasi (`SEVERITY`) bu yerga TO'G'RI KELMAYDI:
 * u "qanchalik xavfli" ni, bu ro'yxat esa "qanchalik ko'p" ni
 * ko'rsatadi — bittasini ikkinchisi o'rniga ishlatish rangni
 * o'rganib bo'lmas holga keltirardi.
 */
const FAIL_BARS = ["bg-rose-500", "bg-rose-400", "bg-rose-300", "bg-rose-200"];

/** Muvaffaqiyatli kirish — ko'k (tokendagi `success` ohangi). */
const OK_BAR = RAIL.tone.success;

/**
 * SABABLAR KESIMI + ENG KO'P URINILGAN IP LAR.
 *
 * ⚠️ IKKI SHKALA, BITTA RO'YXAT. "Muvaffaqiyatli" qatori BUTUN
 * ro'yxatning maksimumiga, rad etish sabablari esa faqat O'ZARO
 * taqqoslanadi. Sabab: normal ishlayotgan maktabda muvaffaqiyatli
 * kirishlar rad etishlardan o'nlab barobar ko'p va bitta shkalada
 * qolgan barcha barlar ko'rinmas ipga aylanardi. Bu kartaning savoli
 * esa "nima uchun kirish o'tmadi", ya'ni taqqoslash aynan rad etishlar
 * ORASIDA bo'lishi kerak.
 *
 * ⚠️ IP BLOKI ENDI PLITKA (`SURFACE.tile`) EMAS, QATORLAR. Ilgari u
 * kulrang fonli quti edi va buning sababi bor edi: "karta ichiga
 * ajratuvchi chiziq qo'yilsa, chegarasiz karta qoidasi o'z ichida
 * buzilardi". Endi bu sabab kuchini yo'qotdi — `ROW.list` dagi hairline
 * KARTA KONTURI emas, ichki TARTIB chizig'i va u kartaning shaklini
 * o'zgartirmaydi. Quti esa yuqoridagi sabablar ro'yxati bilan bir xil
 * ma'lumotni (nom + son) butunlay boshqa shaklda ko'rsatib turardi.
 * Bo'lim endi sarlavha yorlig'i bilan ajraladi, qatorlari esa relssiz
 * va zichroq: IP — ikkilamchi ma'lumot, sabablar ro'yxatidan e'tiborni
 * tortib olmasligi kerak.
 *
 * @param {object} props
 * @param {object} [props.data] - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0]
 * @param {string} [props.className]
 */
export const ReasonsPanel = ({
  data,
  isLoading = false,
  isError = false,
  delay = 0,
  className,
}) => {
  const reasons = data?.attempts?.byReason ?? [];
  const topIps = data?.attempts?.topIps ?? [];

  // Maksimumlar: umumiy (ko'k qator uchun) va faqat rad etishlar
  const maxAll = Math.max(1, ...reasons.map((row) => Number(row.count) || 0));
  const maxFailed = Math.max(
    1,
    ...reasons.filter((row) => row.key !== "ok").map((row) => Number(row.count) || 0),
  );

  // Rad etish sabablarining tartib raqami — bar ohangining pog'onasi.
  // ⚠️ Render ichida sanagich O'ZGARTIRILMAYDI (render-dagi mutatsiya
  // qayta render'da boshqa natija berardi) — tartib oldindan tayyorlanadi;
  // server eng ko'pini birinchi beradi va shu tartib saqlanadi
  const failedRank = new Map(
    reasons.filter((row) => row.key !== "ok").map((row, index) => [row.key, index]),
  );

  return (
    <Panel
      title="Rad etish sabablari"
      hint="Nima uchun kirish o'tmadi"
      icon={ShieldX}
      tone="alert"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={reasons.length === 0 && topIps.length === 0}
      emptyText="Bu davrda kirish urinishlari qayd etilmagan"
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ul className={ROW.list}>
          {reasons.map((row, index) => {
            const isOk = row.key === "ok";
            const count = Number(row.count) || 0;
            const rank = failedRank.get(row.key) ?? 0;
            const rowDelay = contentDelay(delay, Math.min(index, 10));

            return (
              <li
                key={row.key}
                className={MOTION.enterUp}
                style={{ animationDelay: `${rowDelay}ms` }}
              >
                <div className={cn(ROW.base, ROW.hover)}>
                  {/* Rels sabab TURINI aytadi: o'tgan kirish — ko'k,
                      rad etish — qizil (bar ohangi bilan bir xil o'q) */}
                  <span
                    aria-hidden="true"
                    className={cn(ROW.rail, isOk ? RAIL.tone.success : RAIL.tone.alert)}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={cn(T.td, "truncate")}>{row.label}</span>
                      <span className={cn(T.tdNum, "shrink-0")}>{formatCount(count)}</span>
                    </div>

                    {/*
                      ⚠️ Yorug'lik (`sheen`) FAQAT eng katta RAD ETISH
                      sababida. U kartaning asosiy javobi — "kirish
                      ko'pincha ANA SHU sababdan o'tmayapti". Ikkinchi
                      sababda ham bo'lsa, ikkalasi bir-biri bilan
                      raqobatlashib, birinchisining ustunligi yo'qolardi.
                      Bu qator rad etishlar shkalasida har doim 100% ni
                      egallaydi, ya'ni yorug'lik trekning bo'sh qismiga
                      chiqib ketmaydi.
                    */}
                    <Bar
                      className="mt-1.5"
                      width={isOk ? (count / maxAll) * 100 : (count / maxFailed) * 100}
                      tone={isOk ? OK_BAR : FAIL_BARS[Math.min(rank, FAIL_BARS.length - 1)]}
                      sheen={!isOk && rank === 0}
                      delay={rowDelay}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ⚠️ IP bloki bo'sh bo'lsa UMUMAN chizilmaydi: "ma'lumot yo'q"
            deb turgan bo'sh sarlavha kartaning pastini ma'nosiz
            egallab, sabablar ro'yxatidan e'tiborni tortib olardi */}
        {topIps.length > 0 && (
          <div className="mt-4">
            <p
              className={cn(T.label, MOTION.enterUp)}
              style={{
                animationDelay: `${contentDelay(delay, Math.min(reasons.length, 10))}ms`,
              }}
            >
              Eng ko'p urinilgan IP
            </p>

            <ul className={cn(ROW.list, "mt-1")}>
              {topIps.slice(0, 5).map((row, index) => (
                <li
                  key={row.ip ?? `noma'lum-${index}`}
                  className={MOTION.enterUp}
                  style={{
                    animationDelay: `${contentDelay(
                      delay,
                      Math.min(reasons.length + 1 + index, 10),
                    )}ms`,
                  }}
                >
                  {/* Relssiz va zichroq (`py-1.5`): bu ikkilamchi ro'yxat */}
                  <div className={cn(ROW.base, ROW.hover, "py-1.5")}>
                    <span className={cn(T.mono, "min-w-0 flex-1 truncate")}>{row.ip || "—"}</span>
                    <span className={cn(T.tdNum, "ml-auto shrink-0")}>
                      {formatCount(Number(row.count))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
};

/* ═══════════════════════ QURILMALAR ═══════════════════════ */

/**
 * QURILMALAR KESIMI — "davr ichida nimadan kirishgan".
 *
 * ⚠️ ULUSH MAXRAJI — RO'YXATNING JAMISI, eng katta qator emas.
 * Sabablar kartasidan farqli o'laroq, bu yerda savol "qaysi qurilma
 * ustun" emas, "qanday taqsimlangan": barlar yig'ilib bir butunni
 * tashkil qiladi va shu sababli 100% dan olingan ulush to'g'ri javob
 * beradi.
 *
 * ⚠️ HAMMA BAR BIR XIL KULRANG (`RAIL.tone.device`). Qurilma turi
 * xavfsizlik BAHOSI emas — telefondan kirish kompyuterdan kirishdan
 * yaxshi ham, yomon ham emas. Har qatorga o'z rangi berilsa, ekran
 * baho bermagan joyda baho bergandek ko'rinardi; farqni IKONKA
 * ko'rsatadi. Shu sababli rels ham kulrang va YORUG'LIK YO'Q: bu
 * kartada "bu yerga qara" deb ko'rsatiladigan qator yo'q.
 *
 * @param {object} props
 * @param {object} [props.data] - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0]
 * @param {string} [props.className]
 */
export const DevicesPanel = ({
  data,
  isLoading = false,
  isError = false,
  delay = 0,
  className,
}) => {
  const rows = data?.devices ?? [];
  const total = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0);

  return (
    <Panel
      title="Qurilmalar"
      hint="Davr ichida kirish uchun ishlatilganlar"
      icon={MonitorSmartphone}
      tone="device"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Qurilma ma'lumoti yig'ilmagan"
      className={className}
    >
      <ul className={cn(ROW.list, ROW.scroll, "max-h-[360px] min-h-0 flex-1")}>
        {rows.map((row, index) => {
          const Icon = deviceIcon(row.device);
          const count = Number(row.count) || 0;
          const rowDelay = contentDelay(delay, Math.min(index, 10));

          return (
            <li
              key={row.device ?? `noma'lum-${index}`}
              className={MOTION.enterUp}
              style={{ animationDelay: `${rowDelay}ms` }}
            >
              <div className={cn(ROW.base, ROW.hover)}>
                <span aria-hidden="true" className={cn(ROW.rail, RAIL.tone.device)} />

                <Icon className="size-3.5 shrink-0 text-slate-400" strokeWidth={2.2} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cn(T.tdName, "truncate")}>
                      {row.device || "Noma'lum qurilma"}
                    </span>
                    <span className={cn(T.tdNum, "shrink-0")}>{formatCount(count)}</span>
                  </div>

                  <Bar
                    className="mt-1.5"
                    width={total > 0 ? (count / total) * 100 : 0}
                    tone={RAIL.tone.device}
                    delay={rowDelay}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default AttemptsFeed;
