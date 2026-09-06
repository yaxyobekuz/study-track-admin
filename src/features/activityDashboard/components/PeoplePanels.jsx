// Icons
import { BellOff, Link2Off, Lock, PhoneOff, UserCheck, UserX } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Tokens
import { BAR, CHIP, MOTION, ROW, T, contentDelay } from "../data/pulse.tokens";

// Components
import Panel from "./Panel";

/**
 * ODAMLAR BLOKLARI — "kim ishlatyapti, kim ishlatmayapti".
 *
 * ⚠️ TO'RTTA PANEL BITTA FAYLDA, chunki ular BITTA SAVOLNING to'rt
 * tomoni va bir xil qator anatomiyasini bo'lishadi (ism → yorliq →
 * o'ngda o'lchov). Alohida to'rt faylga bo'linsa, `Row` va `RoleChip`
 * yo beshinchi faylga chiqarilishi, yo to'rt marta ko'chirilishi
 * kerak bo'lardi — ikkalasi ham qatorlarni asta-sekin bir-biridan
 * uzoqlashtirardi.
 *
 * ⚠️ JIM TURISH VA BOG'LANMAGANLIK — IKKI XIL MUAMMO va ular ATAYLAB
 * ikki panelda (`SilentParentsPanel` / `UnlinkedPanel`). Birinchisida
 * hisob ULANGAN, lekin ochilmayapti — bu ODAM bilan ishlash masalasi
 * (eslatma yuborish, telefon qilish). Ikkinchisida esa ulanishning
 * o'zi yo'q — bu QABULXONA ishi (havolani berish, bog'lash). Bitta
 * ro'yxatga qo'shilsa, ikkalasiga bir xil chora ko'rilardi va "nega
 * eslatma yubordik, u hali botni ochmagan ham" degan holat chiqardi.
 */

/* ═══════════════════════ UMUMIY QISMLAR ═══════════════════════ */

/**
 * QATOR QOBIG'I.
 *
 * ⚠️ QATORLAR ENDI HAIRLINE BILAN AJRALADI (`ROW.list` → `divide-y`).
 * Ilgari ajratuvchi FAQAT hover foni edi: sichqoncha turmagan holatda
 * to'rtta panelda oq fonda matn oqimi turardi va ko'z bir qator qayerda
 * tugab, ikkinchisi qayerdan boshlanganini topa olmasdi. Ro'yxatning
 * butun ma'nosi — QATORMA-QATOR taqqoslash.
 *
 * ⚠️ QATOR KARTA CHETIGACHA CHO'ZILADI. `ROW.list` dagi `-mx-5`
 * `Panel` ning `padding="default"` (px-5) ini teskari qaytaradi, qatorda
 * esa `px-5` qayta beriladi. Ajratuvchi ichkarida qolsa "jadval" bo'lib
 * ko'rinardi; chetgacha borganda esa fonning tabiiy bo'linishiga aylanadi.
 *
 * ⚠️ BOSILADIGANLIK — `onSelect` BORLIGIGA bog'liq. U berilmasa qator
 * `div` bo'lib qoladi: kursor o'zgarmaydi, klaviatura fokusi
 * to'xtamaydi. Har doim `button` chizilib, `onClick` bo'sh qoldirilsa,
 * foydalanuvchi bosib ko'rib, hech narsa bo'lmasligini KEYIN bilardi —
 * "buzilgan" degan taassurot aynan shunday paydo bo'ladi.
 *
 * ⚠️ `focus-visible` halqasi bor va u kartadagi "chegara yo'q" qoidasini
 * BUZMAYDI: bu doimiy kontur emas, faqat klaviatura bilan yurgan
 * foydalanuvchi uchun joriy o'rin belgisi.
 *
 * ⚠️ CHAP AKSENT (`ROW.rail`) PANELGA QARAB RANGLANADI va u kartaning
 * sarlavhasidagi signal relsi bilan BIR XIL ohangda: hover'da ochilgan
 * chiziq "shu qator qaysi ro'yxatdan" degan bog'lanishni saqlaydi.
 */
/**
 * ⚠️ XOREOGRAFIYA QADAMI CHEKLANGAN. `contentDelay(delay, index)`
 * har qatorga 42 ms qo'shadi — 200 qatorli ro'yxatda oxirgi qator
 * TAXMINAN 9 SONIYA kutib turardi va foydalanuvchi ekranni "yuklanmadi"
 * deb o'ylardi. Kirish animatsiyasining maqsadi — ro'yxatning paydo
 * bo'lishini ko'rsatish, uni kutdirish emas; birinchi o'nta qatordan
 * keyin qadam to'xtaydi.
 */
const STAGGER_LIMIT = 10;

/** Qator kechikishi — ro'yxat kirishi ham, ichidagi bar ham shundan oladi. */
const rowDelay = (delay, index) =>
  contentDelay(delay, Math.min(index, STAGGER_LIMIT));

const Row = ({
  subject,
  onSelect,
  index = 0,
  delay = 0,
  tone = "bg-slate-300",
  className,
  children,
}) => {
  const clickable = typeof onSelect === "function";
  const Tag = clickable ? "button" : "div";

  return (
    <li
      className={MOTION.enterUp}
      style={{ animationDelay: `${rowDelay(delay, index)}ms` }}
    >
      <Tag
        {...(clickable ? { type: "button", onClick: () => onSelect(subject) } : {})}
        className={cn(
          ROW.base,
          ROW.hover,
          clickable && cn(ROW.clickable, "ring-violet-400/60"),
          className,
        )}
      >
        <span aria-hidden="true" className={cn(ROW.rail, tone)} />
        {children}
      </Tag>
    </li>
  );
};

/** Ro'yxat konteyneri — karta chetigacha, qatorlar orasida hairline. */
const RowList = ({ children }) => (
  <ul className={cn(ROW.list, ROW.scroll, "min-h-0 flex-1")}>{children}</ul>
);

/**
 * SARLAVHADAGI JAMI SON.
 *
 * ⚠️ Ro'yxat KESILGAN (server faqat boshini yuboradi), shuning uchun
 * jami son sarlavhada turishi shart: "8 ta qator" ko'rgan odam
 * muammoni 8 ta deb o'ylab qolmasligi kerak.
 */
const TotalChip = ({ value, tone = "neutral" }) => (
  <span className={cn(CHIP.base, CHIP.tone[tone] ?? CHIP.tone.neutral)}>
    {value ?? 0} ta
  </span>
);

/**
 * ROL YORLIG'I.
 *
 * ⚠️ `getRoleLabel(role)` IKKINCHI ARGUMENTSIZ chaqiriladi. Rollar
 * katalogi bu bloklarga props orqali kelmaydi (`/activity/overview`
 * javobida u yo'q) va faqat chip uchun alohida so'rov yuborish ortiqcha
 * bo'lardi. Bo'sh ro'yxatda helper XOM qiymatni qaytaradi ("teacher"),
 * "owner" esa baribir "Ega" bo'ladi — ya'ni eng yomon holatda ham
 * chipda bo'sh joy emas, tushunarli so'z turadi.
 *
 * ⚠️ "+N" chipi BOSHQA OHANGDA (link): ko'p rollilik xodimning holati
 * emas, uning QAMROVI — shuning uchun u rol yorlig'i bilan bir xil
 * kulrangda turib, uning davomi bo'lib ko'rinmasligi kerak.
 */
const RoleChip = ({ role, extraRoles }) => {
  const extra = extraRoles?.length ?? 0;

  // Xom qiymat ham, obyekt ham kelishi mumkin — ikkalasiga chidamli
  const extraTitle = (extraRoles ?? [])
    .map((item) => getRoleLabel(typeof item === "string" ? item : item?.value))
    .filter(Boolean)
    .join(", ");

  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className={cn(CHIP.base, CHIP.tone.neutral, "shrink-0")}>
        {getRoleLabel(role)}
      </span>

      {extra > 0 && (
        <span
          className={cn(CHIP.base, CHIP.tone.link, "shrink-0")}
          title={extraTitle || undefined}
        >
          +{extra}
        </span>
      )}
    </span>
  );
};

/**
 * IZCHILLIK BARI — `consistency` foizi.
 *
 * ⚠️ Raqamsiz, ATAYLAB. "12 kun" yonida yana bir raqam ("67%") tursa,
 * ko'z ikkalasini taqqoslashga urinardi; bar esa faqat bitta savolga
 * javob beradi: kunlar davr bo'ylab TEKIS taqsimlanganmi yoki bir
 * joyga to'planganmi.
 *
 * ⚠️ `BAR.sheen` YO'Q. Yorug'lik bandi faqat kartaning ASOSIY
 * ko'rsatkichida bo'ladi; bu ikkilamchi bar har qatorda takrorlanadi va
 * o'n ikkita chaqnayotgan chiziq ekranni "reklama banneri" qilardi.
 */
const ConsistencyBar = ({ value, delay }) => (
  <span className={cn(BAR.track, "block w-8 shrink-0")} aria-hidden="true">
    <span
      className={cn(BAR.fill, "bg-emerald-500")}
      style={{
        width: `${Math.min(100, Math.max(0, value ?? 0))}%`,
        animationDelay: `${delay}ms`,
      }}
    />
  </span>
);

/**
 * RUXSAT YO'Q HOLATI.
 *
 * ⚠️ Bu `isEmpty` EMAS va ikkalasi hech qachon aralashtirilmaydi.
 * "Bo'sh" degani — MUAMMO YO'Q (hamma bog'langan, hamma foydalanyapti),
 * "ruxsat yo'q" degani esa — ma'lumot BOR, lekin ko'rsatilmaydi.
 * Ikkalasiga bir xil matn berilsa, ruxsati yo'q rahbar ekranni ochib
 * "demak muammo yo'q ekan" degan noto'g'ri xulosaga kelardi.
 */
const NoAccess = ({ text }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
    <Lock className="size-5 text-slate-300" strokeWidth={1.8} />
    <p className={cn(T.hint, "max-w-[240px]")}>{text}</p>
  </div>
);

/* ═══════════════════════ ENG FAOL XODIMLAR ═══════════════════════ */

/**
 * ENG FAOL XODIMLAR — kim tizimda doimiy.
 *
 * ⚠️ O'lchov — HODISALAR SONI EMAS, KUNLAR SONI. Bir kunda yuz marta
 * sahifa ochgan xodim "eng faol" bo'lib chiqmasligi kerak: savol
 * "tizim ish jarayoniga kirganmi" degani, "kim ko'p bosgan" degani
 * emas. Hodisalar soni shu sababli ikkinchi darajali meta bo'lib
 * qoladi.
 */
export const ActiveStaffPanel = ({
  data,
  isLoading,
  isError,
  delay = 0,
  className,
  onSelect,
}) => {
  const rows = data?.staff?.active ?? [];

  return (
    <Panel
      title="Eng faol xodimlar"
      hint="Davr ichida nechta kun tizimda bo'lgani"
      icon={UserCheck}
      tone="good"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Davr ichida birorta xodim tizimga kirmagan"
      className={className}
    >
      <RowList>
        {rows.map((row, index) => (
          <Row
            key={row.id}
            index={index}
            delay={delay}
            tone="bg-emerald-500"
            onSelect={onSelect}
            subject={{ userId: row.id, title: row.name }}
          >
            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{row.name || "—"}</p>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <RoleChip role={row.role} extraRoles={row.extraRoles} />
                {row.events > 0 && (
                  <span className={T.meta}>{row.events} harakat</span>
                )}
              </div>
            </div>

            <div className="ml-auto shrink-0 text-right">
              <span className="flex items-center justify-end gap-1.5">
                <span className={T.tdNum}>{row.days ?? 0}</span>
                <span className={T.meta}>kun</span>
                {/* ⚠️ Bar ham CHEKLANGAN qadamdan oladi (`rowDelay`) —
                    aks holda qator kelib bo'lgach, bari yana sekundlab
                    kutib turardi */}
                <ConsistencyBar
                  value={row.consistency}
                  delay={rowDelay(delay, index) + 90}
                />
              </span>

              {/* ⚠️ Sana MATNI serverdan tayyor keladi (`lastSeenLabel`) —
                  bu yerda hech narsa formatlanmaydi */}
              <p className={cn(T.meta, "mt-1")}>{row.lastSeenLabel || "—"}</p>
            </div>
          </Row>
        ))}
      </RowList>
    </Panel>
  );
};

/* ═══════════════════ TIZIMGA KIRMAGAN XODIMLAR ═══════════════════ */

/**
 * JIM TURGAN XODIMLAR — davr ichida BIRORTA ham kirmaganlar.
 *
 * ⚠️ Bo'sh ro'yxat bu yerda YAXShI XABAR va matn shuni aytadi ("Hamma
 * xodim tizimga kirgan"). Umumiy "ma'lumot yo'q" matni qoldirilsa,
 * eng yaxshi natija ekranda XATOday ko'rinardi.
 */
export const SilentStaffPanel = ({
  data,
  isLoading,
  isError,
  delay = 0,
  className,
  onSelect,
}) => {
  const rows = data?.staff?.silent ?? [];
  const total = data?.staff?.silentTotal ?? 0;
  const days = data?.period?.days;

  return (
    <Panel
      title="Tizimga kirmagan xodimlar"
      hint={
        days ? `${days} kun ichida birorta ham kirmagan` : "Davr ichida birorta ham kirmagan"
      }
      icon={UserX}
      tone="warn"
      /* ⚠️ Chip faqat son NOLDAN katta bo'lganda: "0 ta" yozuvi sariq
         chipda "Hamma xodim tizimga kirgan" degan matn yonida turib,
         o'zi bilan o'zi ziddiyatga tushardi */
      action={total > 0 ? <TotalChip value={total} tone="warn" /> : null}
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Hamma xodim tizimga kirgan"
      className={className}
    >
      <RowList>
        {rows.map((row, index) => (
          <Row
            key={row.id}
            index={index}
            delay={delay}
            tone="bg-amber-500"
            onSelect={onSelect}
            subject={{ userId: row.id, title: row.name }}
          >
            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{row.name || "—"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <RoleChip role={row.role} extraRoles={row.extraRoles} />
              </div>
            </div>

            <div className="ml-auto shrink-0 text-right">
              <span className={cn(CHIP.base, CHIP.tone.warn)}>Kirmagan</span>

              {/* ⚠️ "Kirmagan" dan keyingi savol — "oxirgi marta qachon".
                  Label bo'lmasa (umuman kirmagan) satr CHIZILMAYDI:
                  bo'sh em-dash faqat qatorni balandlashtirardi */}
              {row.lastSeenLabel && (
                <p className={cn(T.meta, "mt-1")}>{row.lastSeenLabel}</p>
              )}
            </div>
          </Row>
        ))}
      </RowList>
    </Panel>
  );
};

/* ═══════════════ BOTDAN FOYDALANMAYOTGAN OTA-ONALAR ═══════════════ */

/**
 * BOG'LANGAN, LEKIN OCHMAGANLAR.
 *
 * ⚠️ RO'YXAT SHAXSIY MA'LUMOT — shuning uchun u alohida ruxsat ostida
 * (`roster.available`). Ruxsat yo'qligi XATO emas: panel to'liq
 * chiziladi, faqat tanasi o'rniga tushuntirish turadi.
 *
 * ⚠️ `notificationsEnabled === false` — jim turishning EHTIMOLIY SABABI
 * va u qatorda ko'rinishi kerak: bunday ota-onaga "botni oching" deb
 * eslatma yuborishdan oldin uning bildirishnomani o'zi o'chirganini
 * bilish kerak, aks holda eslatma unga yetib ham bormaydi.
 */
export const SilentParentsPanel = ({
  data,
  isLoading,
  isError,
  delay = 0,
  className,
  onSelect,
}) => {
  const roster = data?.roster;
  const denied = roster?.available === false;
  const rows = roster?.silentParents ?? [];
  const total = roster?.silentParentsTotal ?? 0;

  return (
    <Panel
      title="Botdan foydalanmayotganlar"
      hint="Bog'langan, lekin davr ichida ochmagan"
      icon={PhoneOff}
      tone="warn"
      action={!denied && total > 0 ? <TotalChip value={total} tone="warn" /> : null}
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      /* ⚠️ Ruxsat yo'q bo'lsa `isEmpty` QO'YILMAYDI — u boshqa holat
         (yuqoridagi `NoAccess` izohi) */
      isEmpty={!denied && rows.length === 0}
      emptyText="Bog'langan hamma ota-ona botdan foydalanyapti"
      className={className}
    >
      {denied ? (
        <NoAccess text="Foydalanmayotganlar ro'yxatini ko'rish uchun alohida ruxsat kerak" />
      ) : (
        <RowList>
          {rows.map((row, index) => (
            <Row
              key={`${row.telegramId}-${row.studentId}`}
              index={index}
              delay={delay}
              tone="bg-amber-500"
              onSelect={onSelect}
              /* ⚠️ Bu yerda `userId` EMAS, `telegramId`: jim turgan
                 hisob o'quvchining o'zi emas, unga ulangan ota-ona.
                 Sarlavha ham birga uzatiladi — telegram hisobining
                 o'zida ko'rsatiladigan nom yo'q */
              subject={{
                telegramId: row.telegramId,
                title: row.studentName,
                subtitle: `${row.className} · ${row.contactName}`,
              }}
            >
              <div className="min-w-0 flex-1">
                <p className={cn(T.tdName, "truncate")}>{row.studentName || "—"}</p>
                <p className={cn(T.meta, "mt-0.5 truncate")}>
                  {[row.className, row.contactName].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>

              {row.notificationsEnabled === false && (
                <span
                  className="shrink-0 text-slate-400"
                  title="Bildirishnomalar o'chirilgan"
                  aria-label="Bildirishnomalar o'chirilgan"
                >
                  <BellOff className="size-3.5" strokeWidth={2} />
                </span>
              )}

              <div className="ml-auto shrink-0 text-right">
                {row.daysSince == null ? (
                  /* Hech qachon ochmagan — "0 kun" deb yozib bo'lmaydi:
                     bu "bugun kirgan" degan teskari ma'no berardi */
                  <span className={cn(CHIP.base, CHIP.tone.warn)}>Hech qachon</span>
                ) : (
                  <>
                    <span className="flex items-baseline justify-end gap-1">
                      <span className={T.tdNum}>{row.daysSince}</span>
                      <span className={T.meta}>kun</span>
                    </span>
                    <p className={cn(T.meta, "mt-0.5")}>{row.lastSeenLabel || "—"}</p>
                  </>
                )}
              </div>
            </Row>
          ))}
        </RowList>
      )}
    </Panel>
  );
};

/* ═══════════════════ BOTGA BOG'LANMAGANLAR ═══════════════════ */

/**
 * HISOBI UMUMAN ULANMAGAN O'QUVCHILAR.
 *
 * ⚠️ OHANG NEYTRAL, sariq emas. Bog'lanmaganlik — jarayonning tabiiy
 * boshlanishi (yangi o'quvchi hali havolani olmagan), muammo emas;
 * sariq rels bilan chizilsa, u yuqoridagi haqiqiy signal ("bog'langan-u
 * ochmayapti") bilan bir xil og'irlikda ko'rinardi va rang shkalasi
 * ma'nosini yo'qotardi.
 */
export const UnlinkedPanel = ({
  data,
  isLoading,
  isError,
  delay = 0,
  className,
  onSelect,
}) => {
  const roster = data?.roster;
  const denied = roster?.available === false;
  const rows = roster?.unlinked ?? [];
  const total = roster?.unlinkedTotal ?? 0;

  return (
    <Panel
      title="Botga bog'lanmaganlar"
      hint="Hisobi umuman ulanmagan o'quvchilar"
      icon={Link2Off}
      tone="neutral"
      action={!denied && total > 0 ? <TotalChip value={total} /> : null}
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!denied && rows.length === 0}
      emptyText="Barcha o'quvchilar botga bog'langan"
      className={className}
    >
      {denied ? (
        <NoAccess text="Bog'lanmaganlar ro'yxatini ko'rish uchun alohida ruxsat kerak" />
      ) : (
        <RowList>
          {rows.map((row, index) => (
            <Row
              key={row.id}
              index={index}
              delay={delay}
              tone="bg-slate-300"
              onSelect={onSelect}
              subject={{ userId: row.id, title: row.name }}
            >
              <div className="min-w-0 flex-1">
                <p className={cn(T.tdName, "truncate")}>{row.name || "—"}</p>
                <p className={cn(T.meta, "mt-0.5 truncate")}>{row.className || "Sinfsiz"}</p>
              </div>

              <Link2Off
                className="ml-auto size-3.5 shrink-0 text-slate-300"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Row>
          ))}
        </RowList>
      )}
    </Panel>
  );
};

export default {
  ActiveStaffPanel,
  SilentStaffPanel,
  SilentParentsPanel,
  UnlinkedPanel,
};
