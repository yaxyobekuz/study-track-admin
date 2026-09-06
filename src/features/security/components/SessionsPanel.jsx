// Icons
import { Loader2, LogOut, MonitorSmartphone, Users } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Tokens
import {
  CHIP,
  MOTION,
  ROW,
  T,
  channelLabel,
  contentDelay,
} from "../data/sentinel.tokens";

// Components
import Panel from "./Panel";

/**
 * SEANSLAR — IKKI BLOK BITTA FAYLDA.
 *
 * ⚠️ Ikkalasi BITTA QATOR ANATOMIYASINI bo'lishadi (jonli nuqta →
 * qurilma → IP → kanal → oxirgi ko'rinish → tugatish tugmasi) va bitta
 * amalni chaqiradi. Alohida ikki faylga bo'linsa, `RevokeButton`,
 * `LiveDot` va `UserName` yo uchinchi faylga chiqarilishi, yo ikki
 * marta ko'chirilishi kerak bo'lardi — ikkalasi ham qatorlarni
 * asta-sekin bir-biridan uzoqlashtirardi (`PeoplePanels.jsx` dagi
 * bilan bir xil sabab).
 *
 * ⚠️ IKKALASI BIR XIL MA'LUMOTNI KO'RSATADI, LEKIN BOSHQA SAVOLGA
 * JAVOB BERADI. "Ochiq seanslar" — REYESTR ("hozir kim tizimda"),
 * "Bir vaqtda bir nechta seans" esa XULOSA ("shu hisobga ikki joydan
 * kirilgan"). Ikkinchisini birinchisining filtri sifatida qoldirib
 * bo'lmasdi: parol tarqagani ro'yxatni qo'lda ko'zdan kechirganda
 * emas, ALOHIDA blok bo'lganda ko'zga tashlanadi.
 *
 * ⚠️ SANA MATNI SERVERDAN. `lastSeenLabel` tayyor keladi va bu yerda
 * hech qanday formatlash yo'q — panel bo'ylab bitta sana ko'rinishi
 * shu tarzda saqlanadi (`.claude/rules/dates.md`).
 *
 * ⚠️ QATORLAR HAIRLINE BILAN AJRALADI (`ROW.*`), HOVER BILAN EMAS.
 * Ilgari ikkala blokda ham qatorlar faqat sichqoncha ustida turganda
 * ajralardi va sichqoncha yo'q holatda ekranda oq fonda matn oqimi
 * qolardi — holbuki seans ro'yxatining butun ma'nosi QATORMA-QATOR
 * taqqoslash ("shu IP o'shanikimi?", "shu qurilma tanishmi?").
 */

/* ═══════════════════════ UMUMIY QISMLAR ═══════════════════════ */

/** Bo'sh qiymat ekranga em-dash bo'lib chiqadi, bo'sh joy emas. */
const orDash = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;

/**
 * KIRISH ANIMATSIYASI QADAMI — CHEKLANGAN.
 *
 * ⚠️ Ochiq seanslar 60 tagacha bo'ladi. Kechikish har qatorda o'ssa,
 * oxirgi qator ikki soniyadan keyin paydo bo'lardi va ro'yxat
 * "yuklanmayapti" degan taassurot qoldirardi.
 */
const MAX_ROW_ANIM = 10;
const rowDelay = (base, index) => contentDelay(base, Math.min(index, MAX_ROW_ANIM));

/**
 * "HOZIR TIZIMDA" BELGISI.
 *
 * ⚠️ Ekranning yagona doimiy harakati hero'dagi `scan` edi; bu nuqta
 * esa undan tashqarida turgan ikkinchi takror. U ATAYLAB juda mayda
 * (8px) va faqat qator BOSHIDA: "jonli" tushunchasini raqam ham,
 * yorliq ham bera olmaydi — u holat emas, DAVOM ETAYOTGAN narsa.
 */
const LiveDot = ({ className }) => (
  <span className={cn(MOTION.liveDot, "shrink-0", className)} aria-hidden="true">
    <span className={MOTION.liveRing} />
    <span className={MOTION.liveCore} />
  </span>
);

/**
 * FOYDALANUVCHI ISMI.
 *
 * ⚠️ BOSILADIGANLIK `onSelectUser` BORLIGIGA bog'liq: u berilmasa ism
 * oddiy matn bo'lib qoladi. Har doim tugma chizilsa, foydalanuvchi
 * bosib ko'rib, hech narsa ochilmasligini KEYIN bilardi.
 */
const UserName = ({ userId, name, onSelectUser, className }) => {
  const clickable = typeof onSelectUser === "function" && Boolean(userId);

  if (!clickable) {
    return (
      <span className={cn(T.tdName, "block truncate", className)}>{orDash(name)}</span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectUser(userId)}
      className={cn(
        T.tdName,
        "block max-w-full truncate rounded-[6px] text-left outline-none",
        "transition-colors duration-200 ease-out-quint hover:text-indigo-600",
        "focus-visible:ring-2 focus-visible:ring-indigo-400/60",
        className,
      )}
    >
      {orDash(name)}
    </button>
  );
};

/**
 * SEANSNI TUGATISH TUGMASI — ikki og'irlikda.
 *
 * ⚠️ `tone="solid"` FAQAT "barcha seanslar" uchun. Bitta seansni
 * tugatish — mayda tuzatish (unutilgan qurilma), butun hisobni
 * tugatish esa ODAMNI TIZIMDAN CHIQARADI. Ikkalasi bir xil ko'rinsa,
 * kuchliroq amal jimgina bosilib ketardi.
 *
 * ⚠️ `disabled` FAQAT o'ziga tegishli qatorni to'xtatadi (`busyId`
 * taqqoslash chaqiruvchida): bitta seansni tugatish paytida butun
 * ro'yxatni bloklash — kassir bir vaqtda ikki qurilmani uzolmasligini
 * anglatardi.
 *
 * ⚠️ `relative z-10` — tugma qator relsining USTIDA turadi: ROW.rail
 * absolyut joylashgan va u tugmaning bosilish maydonini yeb qo'ymasligi
 * kerak.
 */
const RevokeButton = ({ onClick, busy = false, label, title, tone = "ghost", className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    title={title}
    className={cn(
      CHIP.base,
      "relative z-10 shrink-0 outline-none transition-colors duration-200 ease-out-quint",
      "focus-visible:ring-2 focus-visible:ring-rose-400/60",
      "disabled:cursor-not-allowed disabled:opacity-60",
      // ⚠️ To'ldirilgan variant — SEVERITY.critical ohangi (#E11D48).
      // Jiddiylik shkalasidan tashqaridagi yangi rang emas, o'sha
      // rangning eng og'ir ko'rinishi.
      tone === "solid"
        ? "bg-rose-600 text-white hover:bg-rose-700"
        : "text-slate-500 hover:bg-rose-50 hover:text-rose-700",
      className,
    )}
  >
    {busy ? (
      <Loader2 className="size-3 shrink-0 motion-safe:animate-spin" strokeWidth={2.4} />
    ) : (
      <LogOut className="size-3 shrink-0" strokeWidth={2.4} />
    )}
    {label && <span className="truncate">{label}</span>}
  </button>
);

/* ═══════════════════════ KO'P SEANSLI HISOBLAR ═══════════════════════ */

/**
 * BIR VAQTDA BIR NECHTA SEANS — bo'limning asosiy savoli.
 *
 * ⚠️ "HAMMASINI TUGATISH" GURUH ICHIDAGI TUGMALARDAN KUCHLIROQ
 * KO'RINADI va bu ataylab. Parol tarqalgan holatda har seansni alohida
 * bosib chiqish ISHLAMAYDI: ro'yxat yuklangandan keyin ochilgan yangi
 * seans ekranda yo'q va u tugatilmay qolardi — ya'ni odam baribir
 * tizimda qolaverardi. Bitta amal esa barcha tokenlarni birdaniga
 * bekor qiladi.
 *
 * ⚠️ Guruh ichidagi seanslar SANALMAYDI — server bergan `sessions` va
 * `origins` ko'rsatiladi. `items` kesilgan bo'lishi mumkin va qatorni
 * sanash "3 seans" o'rniga "2 seans" deb yolg'on aytardi.
 *
 * ⚠️ IKKI POG'ONALI QATOR TIZIMI. Guruh sarlavhasi — to'la kenglikdagi
 * qator, uning seanslari esa `pl-9` bilan CHEKINGAN ichki qatorlar.
 * Ilgari guruh PLITKA (`SURFACE.tile`) ichida turardi va o'nta guruh
 * o'nta kulrang to'rtburchak chizib, ekranni "quti ichida quti" holiga
 * keltirardi. Chekinish esa tegishlilikni fonsiz, faqat TARTIB bilan
 * ko'rsatadi — Linear va Stripe ro'yxatlaridagi kabi.
 *
 * @param {object} props
 * @param {object} props.data - `/security/overview` javobining butuni
 * @param {boolean} [props.canRevoke] - `security.revoke` ruxsati
 * @param {(session: object) => void} [props.onRevoke] - bitta seansni tugatish
 * @param {(userId: string) => void} [props.onRevokeUser] - barcha seanslar
 * @param {string} [props.busyId] - hozir bajarilayotgan amal (seans id yoki userId)
 * @param {(userId: string) => void} [props.onSelectUser]
 */
export const MultiSessionPanel = ({
  data,
  isLoading,
  isError,
  delay = 0,
  className,
  canRevoke = false,
  onRevoke,
  onRevokeUser,
  busyId,
  onSelectUser,
}) => {
  const groups = data?.sessions?.multiSession ?? [];

  return (
    <Panel
      title="Bir vaqtda bir nechta seans"
      hint="Turli qurilmalardan kirilgan hisoblar"
      icon={Users}
      tone="alert"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={groups.length === 0}
      emptyText="Bunday hisob yo'q — har foydalanuvchi bitta qurilmadan ishlayapti"
      className={className}
    >
      <ul className={cn(ROW.list, ROW.scroll, "min-h-0 flex-1")}>
        {groups.map((group, index) => (
          <li
            key={group.userId}
            className={MOTION.enterUp}
            style={{ animationDelay: `${rowDelay(delay, index)}ms` }}
          >
            {/* ── Guruh sarlavhasi ─────────────────────────────────── */}
            {/* ⚠️ Mobilda o'raladi (`flex-wrap`): "Hammasini tugatish"
                tugmasi tor ekranda ismni siqib, uni bir-ikki harfga
                aylantirardi — holbuki qaror aynan ISMGA qarab qabul
                qilinadi */}
            <div className={cn(ROW.base, ROW.hover, "flex-wrap gap-y-1.5 sm:flex-nowrap")}>
              {/* ⚠️ Bu rels HOVER'DA EMAS, DOIMIY: `ROW.rail` dagi
                  `scale-y-0` bekor qilinadi. Guruh sarlavhasi —
                  ogohlantirish signali va u sichqoncha kelguncha kutib
                  turmasligi kerak */}
              <span
                aria-hidden="true"
                className={cn(ROW.rail, "scale-y-100 bg-rose-500")}
              />

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <UserName
                  userId={group.userId}
                  name={group.name}
                  onSelectUser={onSelectUser}
                />

                {group.role && (
                  <span className={cn(CHIP.base, CHIP.tone.neutral, "shrink-0")}>
                    {getRoleLabel(group.role)}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  CHIP.base,
                  CHIP.tone.alert,
                  "shrink-0 tabular-nums",
                )}
              >
                {group.sessions ?? 0} seans · {group.origins ?? 0} qurilma
              </span>

              {canRevoke && (
                <RevokeButton
                  tone="solid"
                  label="Hammasini tugatish"
                  title="Foydalanuvchi hamma qurilmada tizimdan chiqariladi"
                  busy={busyId === group.userId}
                  onClick={() => onRevokeUser?.(group.userId)}
                />
              )}
            </div>

            {/* ── Guruhning seanslari ──────────────────────────────── */}
            {/* ⚠️ Ichki hairline guruhlar orasidagisidan YENGILROQ
                (`slate-100/70`): ikkalasi bir xil bo'lsa, ko'z qaysi
                chiziq guruhni tugatib, qaysinisi shunchaki keyingi
                qurilmani boshlashini ajrata olmasdi */}
            {/* ⚠️ Bo'sh `items` da ro'yxat UMUMAN chizilmaydi: aks holda
                sarlavha ostida hech narsani ajratmaydigan yolg'iz
                hairline qolib, "yuklanmagan qator bor" degan yolg'on
                signal berardi */}
            {(group.items ?? []).length > 0 && (
              <ul className="border-t border-slate-100/70 divide-y divide-slate-100/70">
                {(group.items ?? []).map((session) => (
                  // ⚠️ Ichki qatorda rels YO'Q: u ham chap chetda turardi
                  // va guruhning qizil relsi bilan bitta chiziqda
                  // to'qnashib, guruh qayerda tugaganini yashirardi
                  <li key={session.id} className={cn(ROW.base, ROW.hover, "pl-9")}>
                    <LiveDot />

                    <div className="min-w-0 flex-1">
                      <p className={cn(T.td, "truncate")}>{orDash(session.device)}</p>

                      {/* ⚠️ "Oxirgi ko'rinish" ALOHIDA USTUNDA EMAS, shu
                          satrda: telefonda o'ng ustun tugatish tugmasi bilan
                          talashib qolardi va sana yo kesilardi, yo yashirilardi
                          — holbuki "qachon oxirgi marta ko'rindi" aynan shu
                          blokdagi qaror uchun kerak */}
                      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                        <span className={cn(T.mono, "truncate tabular-nums")}>
                          {orDash(session.ip)}
                        </span>
                        <span className={cn(CHIP.base, CHIP.tone.neutral, "shrink-0")}>
                          {channelLabel(session.channel)}
                        </span>
                        <span className={cn(T.meta, "ml-auto shrink-0 tabular-nums")}>
                          {orDash(session.lastSeenLabel)}
                        </span>
                      </div>
                    </div>

                    {canRevoke && (
                      <RevokeButton
                        label="Tugatish"
                        title="Faqat shu qurilmadagi seans tugatiladi"
                        busy={busyId === session.id}
                        onClick={() => onRevoke?.(session)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
};

/* ═══════════════════════ OCHIQ SEANSLAR ═══════════════════════ */

/**
 * OCHIQ SEANSLAR REYESTRI.
 *
 * ⚠️ JADVAL EMAS, QATOR RO'YXATI — va bu ataylab qilingan almashtirish.
 * Ilgari bu blok `<table className="hidden sm:table">` va uning yonida
 * `<ul className="sm:hidden">` juftligidan iborat edi, ya'ni BITTA
 * ma'lumot IKKI MARTA yozilardi: yangi ustun qo'shilganda uni ikkala
 * joyga ham qo'shish kerak bo'lardi va biri jimgina eskirardi. Olti
 * ustunli jadval telefonda gorizontal surgichga tushib, eng o'ngdagi
 * "Tugatish" tugmasi ekrandan chiqib ketardi — ya'ni AMALNING O'ZI
 * ko'rinmay qolardi. Bitta moslashuvchan qator (`flex` + `min-w-0`,
 * mobilda ikkinchi satrga tushadigan tafsilotlar) ikkala muammoni ham
 * hal qiladi va ustun sarlavhalariga ehtiyoj qoldirmaydi: har qiymat
 * o'z shakli bilan tanilib turadi (mono IP, chip kanal, kulrang sana).
 *
 * ⚠️ Sarlavhadagi jami son SERVERNIKI (`sessions.total`), qator soni
 * emas — ro'yxat kesilgan bo'lishi mumkin va "12 ta qator" ko'rgan
 * odam jami ham 12 ta deb o'ylab qolmasligi kerak. Bu chipda
 * `useCountUp` YO'Q: 10px yorliqda sanaladigan raqam ma'lumot emas,
 * bezak bo'lib qolardi.
 */
export const LiveSessionsPanel = ({
  data,
  isLoading,
  isError,
  delay = 0,
  className,
  canRevoke = false,
  onRevoke,
  busyId,
  onSelectUser,
}) => {
  const rows = data?.sessions?.live ?? [];
  const total = data?.sessions?.total ?? rows.length;

  return (
    <Panel
      title="Ochiq seanslar"
      hint="Hozir tizimda turgan qurilmalar"
      icon={MonitorSmartphone}
      tone="session"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Hozir ochiq seans yo'q"
      className={className}
      action={<span className={cn(CHIP.base, CHIP.tone.session)}>{total} ta</span>}
    >
      <ul
        className={cn(
          ROW.list,
          "min-h-0 max-h-[460px] flex-1 overflow-y-auto hidden-scrollbar",
        )}
      >
        {rows.map((session, index) => (
          <li
            key={session.id}
            className={MOTION.enterUp}
            style={{ animationDelay: `${rowDelay(delay, index)}ms` }}
          >
            <div className={cn(ROW.base, ROW.hover, "flex-wrap gap-y-1.5 sm:flex-nowrap")}>
              {/* Jonli seans — yashil rels (hover'da ochiladi) */}
              <span aria-hidden="true" className={cn(ROW.rail, "bg-emerald-500")} />

              <LiveDot />

              {/* ── Kim ─────────────────────────────────────────────
                  ⚠️ Keng ekranda kengligi QOTIRILGAN (`sm:w-[190px]`):
                  ustun sarlavhasi yo'q ro'yxatda ismlar tik tekislanib
                  turmasa, ko'z har qatorda qayerdan o'qishni boshlashni
                  qidirib qolardi */}
              <div className="min-w-0 flex-1 sm:w-[190px] sm:flex-none">
                <UserName
                  userId={session.userId}
                  name={session.name}
                  onSelectUser={onSelectUser}
                />
                {session.role && (
                  <p className={cn(T.meta, "truncate")}>{getRoleLabel(session.role)}</p>
                )}
              </div>

              {/* ⚠️ Amal mobilda BIRINCHI satr oxirida turadi, keng
                  ekranda esa `order-last` bilan eng o'ngga o'tadi:
                  telefonda tugma tafsilotlar ostiga tushib qolsa,
                  qaysi seansga tegishli ekani noaniq bo'lardi */}
              {canRevoke && (
                <RevokeButton
                  className="ml-auto sm:order-last"
                  label="Tugatish"
                  title="Shu qurilmadagi seans tugatiladi"
                  busy={busyId === session.id}
                  onClick={() => onRevoke?.(session)}
                />
              )}

              {/* ── Qurilma · IP · kanal · oxirgi ko'rinish ──────────
                  Mobilda to'la kenglikdagi ikkinchi satr (`pl-5` bilan
                  ism ostiga tekislanadi), keng ekranda esa o'sha
                  qatorning davomi */}
              <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pl-5 sm:w-auto sm:flex-1 sm:flex-nowrap sm:gap-x-3 sm:pl-0">
                <p className={cn(T.td, "min-w-0 flex-1 truncate")}>
                  {orDash(session.device)}
                </p>

                <span className={cn(T.mono, "shrink-0 tabular-nums")}>
                  {orDash(session.ip)}
                </span>

                <span className={cn(CHIP.base, CHIP.tone.neutral, "shrink-0")}>
                  {channelLabel(session.channel)}
                </span>

                {/* ⚠️ Sana O'NGGA tekislangan va `tabular-nums`:
                    qatorma-qator taqqoslanadigan yagona ustun shu —
                    raqamlar tik turmasa "qaysi seans eskiroq" degan
                    savolga ko'z bilan javob berib bo'lmasdi */}
                <span
                  className={cn(
                    T.meta,
                    "ml-auto shrink-0 tabular-nums sm:ml-0 sm:w-[132px] sm:text-right",
                  )}
                >
                  {orDash(session.lastSeenLabel)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default MultiSessionPanel;
