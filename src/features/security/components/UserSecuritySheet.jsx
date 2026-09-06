// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Loader2, LogOut, MonitorSmartphone, ShieldOff, TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useMediaQuery from "@/shared/hooks/useMediaQuery";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/shadcn/drawer";

// Queries
import { securityQueries } from "../queries/security.queries";

// Tokens
import {
  CHIP,
  DELAY,
  MOTION,
  RAIL,
  ROW,
  SURFACE,
  T,
  channelLabel,
  contentDelay,
  severityOf,
  statusOf,
} from "../data/sentinel.tokens";

/**
 * BITTA FOYDALANUVCHINING XAVFSIZLIK KARTASI.
 *
 * ⚠️ MAVJUD MODAL NAQSHI ISHLATILDI, LEKIN `ResponsiveModal` EMAS —
 * uning ICHKI QISMLARI (`Dialog` / `Drawer` + `useMediaQuery` bilan
 * 480px chegarasi). Sabab: `ResponsiveModal` (va uning egizagi
 * `ModalWrapper`) ochiqlik holatini `useModal(name)` reyestridan
 * O'ZI oladi va nomga bog'lanadi; bu blok esa boshqariladigan
 * (`open` / `onOpenChange`) bo'lishi kerak — ogohlantirishdagi ismni
 * bosganda ham, seanslar ro'yxatidan ham bir xil ochiladi va qaysi
 * foydalanuvchi tanlangani sahifada turadi. Shu sababli yangi modal
 * TIZIMI yozilmadi: bir xil primitivlar, bir xil chegara, bir xil
 * mobil drawer — faqat holat tashqaridan boshqariladi.
 *
 * ⚠️ EKRAN — O'QISH UCHUN, AMAL UCHUN EMAS (bitta istisnodan tashqari).
 * Ogohlantirishlar bu yerda AMALSIZ ko'rsatiladi: ularni yopish
 * `AlertsPanel` da turadi va bitta amal ikki joyda bo'lsa, "qaysi
 * ro'yxat haqiqiy" degan savol tug'ilardi. Yagona istisno — seansni
 * tugatish, chunki u aynan SHU odamga tegishli va sahifadagi umumiy
 * ro'yxatdan topish uzoq yo'l bo'lardi.
 *
 * ⚠️ SANA MATNI QO'LDA YIG'ILMAYDI: server tayyor `lastSeenLabel` /
 * `createdLabel` beradi. `devices[].lastAt` uchun esa server yorliq
 * BERMAYDI — shuning uchun qurilma qatorida sana UMUMAN ko'rsatilmadi
 * (uni bu yerda formatlash sana qoidasini buzardi).
 *
 * ⚠️ TO'RTALA RO'YXAT HAIRLINE BILAN AJRALADI (`ROW.*`), HOVER BILAN
 * EMAS. Ilgari qatorlar orasida faqat 2–4px bo'shliq bor edi va
 * sichqoncha turmagan holatda modalda oq fonda matn oqimi qolardi:
 * ko'z qayerda bir seans tugab, ikkinchisi boshlanganini topa olmasdi.
 * Ro'yxatning butun ma'nosi — QATORMA-QATOR taqqoslash, shuning uchun
 * ajratuvchi doimiy bo'lishi shart.
 *
 * ⚠️ `-mx-5` MODAL PADDINGIGA AYNAN MOS. Qobiqning yon paddingi ikkala
 * ekranda ham 20px (`DialogContent` da `p-5`, mobil drawerda esa
 * suriladigan konteynerdagi `px-5`) — ya'ni `ROW.list` ning `-mx-5` i va
 * `ROW.base` ning `px-5` i qo'shimcha moslashtirishsiz ishlaydi va qator
 * aynan modal qirrasida tugaydi. Ajratuvchi ichkarida qolsa u "jadval"
 * bo'lib ko'rinardi; chetgacha yetganda esa fonning tabiiy bo'linishiga
 * aylanadi.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {string|null} props.userId - kartasi ochilayotgan foydalanuvchi
 * @param {number} [props.days] - manzaradagi davr (so'rov shu bilan ketadi)
 * @param {boolean} [props.canRevoke] - `security.revoke` ruxsati
 * @param {(session: object) => void} [props.onRevoke] - bitta seansni tugatish
 * @param {(userId: string) => void} [props.onRevokeUser] - hamma seansni tugatish
 * @param {string|null} [props.busyId] - hozir yuborilayotgan seans id si;
 *   "hammasini tugatish" uchun bu qiymat `userId` ga teng bo'ladi
 */
const UserSecuritySheet = ({
  open,
  onOpenChange,
  userId,
  days,
  canRevoke = false,
  onRevoke,
  onRevokeUser,
  busyId = null,
}) => {
  const isDesktop = useMediaQuery("(min-width: 480px)");

  // ⚠️ `enabled` QAYTA YOZILADI: tokendagi so'rov faqat `userId` ni
  // tekshiradi, bu yerda esa MODAL YOPIQ bo'lsa so'rov yuborilmasligi
  // kerak. Aks holda ro'yxatdagi har ism bosilishi bilan (modal
  // yopilgandan keyin ham) fonda so'rov qolib ketardi.
  const { data, isLoading, isError } = useQuery({
    ...securityQueries.user(userId, { days }),
    enabled: Boolean(open && userId),
  });

  /**
   * Sarlavha va tavsif komponentlari QOBIQQA bog'liq: Radix dialogda
   * `DialogTitle`, vaul drawerida `DrawerTitle` bo'lishi kerak (ekran
   * o'qigich uchun majburiy). Shu sababli tarkib funksiya sifatida
   * yig'iladi — ikki qobiq uchun ikkita nusxa yozilmaydi.
   */
  const renderContent = (Title, Description) => (
    <>
      <SheetHead user={data?.user} liveCount={data?.live?.length ?? 0} Title={Title} />
      <Description className="sr-only">
        Foydalanuvchining ochiq seanslari, qurilmalari, kirish urinishlari va
        ogohlantirishlari
      </Description>

      <SheetBody
        data={data}
        isLoading={isLoading}
        isError={isError}
        userId={userId}
        canRevoke={canRevoke}
        onRevoke={onRevoke}
        onRevokeUser={onRevokeUser}
        busyId={busyId}
      />
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* ⚠️ `gap-0 p-5`: qobiqning standart `grid gap-4` va `p-6` si
            bo'limlar orasidagi bo'shliqni ikki marta berardi — bu yerda
            masofani bo'limlarning o'zi (`mt-5`) belgilaydi.
            Bu 20px qatorlarning `-mx-5` iga ham asos: ro'yxat aynan
            dialog qirrasigacha cho'ziladi, undan chiqib ketmaydi. */}
        <DialogContent className="max-w-[620px] gap-0 p-5">
          {renderContent(DialogTitle, DialogDescription)}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* ⚠️ YON PADDING QOBIQDAN SURILADIGAN KONTEYNERGA KO'CHIRILDI.
          Ilgari `px-5` `DrawerContent` da, surilish esa uning ichidagi
          blokda edi: `-mx-5` li qator o'sha blokdan ikki tomonga 20px
          chiqib ketib, gorizontal aylantirish hosil qilardi
          (`overflow-y-auto` ikkinchi o'qni ham `auto` ga aylantiradi).
          Padding ichkariga olinganda `-mx-5` aynan konteyner qirrasiga
          to'g'ri keladi — gorizontal toshish nolga teng. */}
      <DrawerContent className="pb-5">
        <div className="hidden-scrollbar max-h-[calc(100vh-154px)] w-full overflow-y-auto px-5">
          {renderContent(DrawerTitle, DrawerDescription)}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/* ═══════════════════════ SARLAVHA ═══════════════════════ */

/**
 * ISM + LOGIN + ROLLAR.
 *
 * ⚠️ `extraRoles` "+N" ga SIQILMAYDI (faollik bo'limidagi `RoleChip`
 * dan farqli). U yerda qator tor va ro'yxatda o'nlab odam bor; bu yerda
 * esa ekran bitta odamga bag'ishlangan va "u yana qayerda kim" degan
 * savol aynan shu kartaning mazmuni — yashirilgan raqam javob bermasdi.
 *
 * ⚠️ `getRoleLabel` ikkinchi argumentsiz: rollar katalogi bu javobda
 * yo'q va faqat chip uchun alohida so'rov ortiqcha bo'lardi. Eng yomon
 * holatda xom qiymat ("teacher") chiqadi — bo'sh joy emas.
 */
const SheetHead = ({ user, liveCount, Title }) => {
  const extra = user?.extraRoles ?? [];

  return (
    <header
      className={cn("pr-8", MOTION.enterUp)}
      style={{ animationDelay: `${DELAY.header}ms` }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* Jonli nuqta — "hozir tizimda". Ekrandagi yagona takrorlanuvchi
            harakat, `sentinel.tokens.js` dagi qoidaga muvofiq */}
        {liveCount > 0 && (
          <span className={cn(MOTION.liveDot, "shrink-0")} aria-hidden="true">
            <span className={MOTION.liveRing} />
            <span className={MOTION.liveCore} />
          </span>
        )}

        <Title className={cn(T.title, "min-w-0 truncate text-[15px]")}>
          {user?.name || "Foydalanuvchi"}
        </Title>
      </div>

      <p className={cn(T.mono, "mt-1 truncate")}>{user?.username || "—"}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {user?.role && (
          <span className={cn(CHIP.base, CHIP.tone.neutral)}>{getRoleLabel(user.role)}</span>
        )}

        {extra.map((item) => {
          // Xom qiymat ham, obyekt ham kelishi mumkin — ikkalasiga chidamli
          const value = typeof item === "string" ? item : item?.value;
          if (!value) return null;

          return (
            <span key={value} className={cn(CHIP.base, CHIP.tone.session)}>
              {getRoleLabel(value)}
            </span>
          );
        })}
      </div>
    </header>
  );
};

/* ═══════════════════════ TANA ═══════════════════════ */

/** Ro'yxat cheklovlari — kartada tarix emas, XULOSA ko'rsatiladi. */
const MAX_ATTEMPTS = 15;
const MAX_ALERTS = 10;

/**
 * ⚠️ KIRISH ANIMATSIYASI SANOQCHISI CHEKLANADI. `contentDelay` har
 * qator uchun 42ms qo'shadi: 15-qator 600ms dan keyin kirardi va
 * modal "sekin ochilyapti" degan taassurot bergan bo'lardi. Sakkizdan
 * keyingi qatorlar bir vaqtda kiradi — ular baribir aylantirmasdan
 * ko'rinmaydi.
 */
const MAX_ROW_ANIM = 8;
const rowDelay = (base, index) => contentDelay(base, Math.min(index, MAX_ROW_ANIM));

/** Bo'lim boshlanish vaqtlari — to'r qadami bilan (tokendan). */
const sectionDelay = (index) => index * DELAY.gridStep;

/**
 * ⚠️ RO'YXATLARDA `ROW.scroll` YO'Q. Modalning o'zi allaqachon
 * suriladigan konteyner, ichkarida yana `max-h` qo'yilsa ikki bosqichli
 * surilish paydo bo'lardi ("qaysi biri qimirlayapti" degan savol).
 * Uzunlik esa `MAX_ATTEMPTS` / `MAX_ALERTS` bilan cheklangan.
 */
const SheetBody = ({
  data,
  isLoading,
  isError,
  userId,
  canRevoke,
  onRevoke,
  onRevokeUser,
  busyId,
}) => {
  if (isLoading) return <SheetSkeleton />;
  if (isError) return <SheetError />;

  const live = data?.live ?? [];
  const devices = data?.devices ?? [];
  const attempts = data?.attempts ?? [];
  const alerts = data?.alerts ?? [];

  const openAlerts = alerts.filter((alert) => alert.status === "open").length;

  // ⚠️ "Hammasini tugatish" bandligi `userId` bilan aniqlanadi: bitta
  // seansning id si emas, butun foydalanuvchi bo'yicha amal ketmoqda.
  const isRevokingAll = busyId != null && busyId === userId;

  return (
    <div className="mt-4">
      {/* ── Uch ko'rsatkich ─────────────────────────────────────── */}
      {/* ⚠️ Bu raqamlarda `useCountUp` YO'Q: ular bir xonali (ochiq
          seanslar, qurilmalar, ogohlantirishlar) va sanoq animatsiyasi
          "2" ni "0 → 1 → 2" qilib ko'rsatib, ma'lumot o'rniga shovqin
          berardi. Sanoq katta raqamlar uchun — manzara lentasida. */}
      <div className="grid grid-cols-3 gap-2.5">
        <MiniStat
          label="Ochiq seans"
          value={live.length}
          tone="session"
          delay={sectionDelay(1)}
        />
        <MiniStat
          label="Qurilma"
          value={devices.length}
          tone="device"
          delay={sectionDelay(1) + DELAY.metricStep}
        />
        <MiniStat
          label="Ochiq ogohlantirish"
          value={openAlerts}
          tone={openAlerts > 0 ? "alert" : "neutral"}
          delay={sectionDelay(1) + DELAY.metricStep * 2}
        />
      </div>

      {/* ── Ochiq seanslar ──────────────────────────────────────── */}
      {/* ⚠️ Bu ikki bo'lim sarlavhasida SANOQ YO'Q: aynan o'sha raqam
          yuqoridagi plitkada turibdi va bir raqam ikki joyda ko'ringanda
          "qaysi biri to'g'ri" degan savol tug'ilardi. Sanoq faqat
          plitkalarda YO'Q raqamlar uchun qoldirilgan (urinishlar soni;
          ogohlantirishlarda esa plitka OCHIQLARINI, sarlavha JAMISINI
          ko'rsatadi — bular boshqa-boshqa raqam). */}
      <Section
        title="Ochiq seanslar"
        delay={sectionDelay(2)}
        action={
          canRevoke &&
          live.length > 0 && (
            <button
              type="button"
              disabled={isRevokingAll}
              onClick={() => onRevokeUser?.(userId)}
              className={cn(ACTION_BTN, ACTION_TONE.danger)}
              title="Foydalanuvchining barcha seanslarini tugatish"
            >
              {isRevokingAll ? (
                <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
              ) : (
                <ShieldOff className="size-3" strokeWidth={2.4} />
              )}
              Hammasini tugatish
            </button>
          )
        }
      >
        {live.length === 0 ? (
          <EmptyLine text="Hozir ochiq seans yo'q" />
        ) : (
          <ul className={ROW.list}>
            {live.map((session, index) => (
              <SessionRow
                key={session.id}
                session={session}
                canRevoke={canRevoke}
                onRevoke={onRevoke}
                isBusy={busyId === session.id || isRevokingAll}
                delay={rowDelay(sectionDelay(2), index)}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* ── Qurilmalar ──────────────────────────────────────────── */}
      <Section title="Qurilmalar" delay={sectionDelay(3)}>
        {devices.length === 0 ? (
          <EmptyLine text="Qurilma qayd etilmagan" />
        ) : (
          <ul className={ROW.list}>
            {devices.map((row, index) => (
              <li
                key={row.device ?? index}
                className={MOTION.enterUp}
                style={{ animationDelay: `${rowDelay(sectionDelay(3), index)}ms` }}
              >
                <div className={cn(ROW.base, ROW.hover)}>
                  {/* Rels kulrang: qurilma ro'yxati NEYTRAL — u hodisa
                      emas, inventar. Rangli bo'lsa "muammo" deb o'qilardi */}
                  <span aria-hidden="true" className={cn(ROW.rail, "bg-slate-400")} />

                  <MonitorSmartphone
                    className="size-3.5 shrink-0 text-slate-400"
                    strokeWidth={2.2}
                  />
                  <span className={cn(T.td, "min-w-0 flex-1 truncate")}>
                    {row.device || "Noma'lum qurilma"}
                  </span>

                  {/* ⚠️ `lastAt` KO'RSATILMAYDI: serverda unga tayyor yorliq
                      yo'q, bu yerda formatlash esa sana qoidasini buzardi.
                      Savolga ("nechta marta ishlatilgan") sanoq javob beradi.
                      Raqam O'NGGA tekislanadi (`ml-auto` + `tabular-nums`):
                      ustunda raqamlar bir chiziqda tursa, ko'z ularni
                      o'qimasdan TAQQOSLAYDI. */}
                  <span className="ml-auto flex shrink-0 items-baseline gap-1">
                    <span className={cn(T.tdNum, "text-right")}>{row.count ?? 0}</span>
                    <span className="text-[9.5px] font-medium text-slate-400">marta</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── So'nggi urinishlar ──────────────────────────────────── */}
      <Section
        title="So'nggi urinishlar"
        count={attempts.length}
        delay={sectionDelay(4)}
        note={
          attempts.length > MAX_ATTEMPTS
            ? `${MAX_ATTEMPTS} tasi ko'rsatilmoqda`
            : null
        }
      >
        {attempts.length === 0 ? (
          <EmptyLine text="Kirish urinishi qayd etilmagan" />
        ) : (
          <ul className={ROW.list}>
            {attempts.slice(0, MAX_ATTEMPTS).map((attempt, index) => (
              <AttemptRow
                key={attempt.id}
                attempt={attempt}
                delay={rowDelay(sectionDelay(4), index)}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* ── Ogohlantirishlar ────────────────────────────────────── */}
      <Section
        title="Ogohlantirishlar"
        count={alerts.length}
        delay={sectionDelay(5)}
        note={alerts.length > MAX_ALERTS ? `${MAX_ALERTS} tasi ko'rsatilmoqda` : null}
      >
        {alerts.length === 0 ? (
          <EmptyLine text="Ogohlantirish yo'q — hammasi joyida" />
        ) : (
          <ul className={ROW.list}>
            {alerts.slice(0, MAX_ALERTS).map((alert, index) => (
              <AlertLine
                key={alert.id}
                alert={alert}
                delay={rowDelay(sectionDelay(5), index)}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
};

/* ═══════════════════════ QISMLAR ═══════════════════════ */

/**
 * BO'LIM SARLAVHASI.
 *
 * ⚠️ AJRATUVCHI CHIZIQ YO'Q — bo'limlar faqat BO'ShLIQ bilan ajraladi.
 * Beshta chiziq modal ichida "jadval ustidagi jadval" hosil qilardi
 * (`sentinel.tokens.js` dagi chegara qoidasining o'sha sababi).
 *
 * ⚠️ Bu qoida QATOR AJRATUVCHISIGA tegishli emas: u bo'limlar orasida
 * emas, bitta ro'yxat ICHIDA turadi va bo'lim chegarasini emas, TARTIBNI
 * ko'rsatadi. Shu sababli bo'limlar orasidagi 20px bo'shliq (`mt-5`)
 * o'zgarishsiz qoladi — u endi ikkita hairline to'plamini bir-biridan
 * ajratib turadi.
 */
const Section = ({ title, count, note, action, delay, children }) => (
  <section
    className={cn("mt-5", MOTION.enterUp)}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between gap-2">
      <p className={cn(T.label, "min-w-0 truncate")}>
        {title}
        {count != null && <span className="ml-1.5 tabular-nums">{count}</span>}
        {note && <span className="ml-1.5 normal-case tracking-normal">· {note}</span>}
      </p>

      {action && <div className="shrink-0">{action}</div>}
    </div>

    <div className="mt-2">{children}</div>
  </section>
);

/**
 * Bo'sh bo'lim — "ma'lumot kelmadi" emas, "hodisa yo'q".
 *
 * ⚠️ Yon padding OLIB TASHLANDI: qator matni endi `-mx-5` + `px-5`
 * hisobiga aynan bo'lim sarlavhasi bilan bir vertikalda boshlanadi va
 * bo'sh matn ham o'sha chiziqda turishi kerak — 8px siljish "bu boshqa
 * daraja" degan yolg'on ishorani berardi.
 */
const EmptyLine = ({ text }) => <p className={cn(T.meta, "py-1.5")}>{text}</p>;

/**
 * AMAL TUGMASI.
 *
 * ⚠️ Sinf satri KOMPONENT ICHIDA (`AlertsPanel` dagi kabi): 11px lik
 * INTERAKTIV o'lcham Sentinel tipografiya shkalasining bir qismi emas
 * va uni tokensga qo'shish beshta matn darajasini aralash to'plamga
 * aylantirardi.
 */
const ACTION_BTN =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold " +
  "transition-colors duration-200 ease-out-quint " +
  "disabled:cursor-not-allowed disabled:opacity-55";

const ACTION_TONE = {
  danger: "text-rose-700 hover:bg-rose-50",
};

/** Mayda ko'rsatkich — manzaradagi KPI plitkasining kichraytirilgani. */
const MiniStat = ({ label, value, tone, delay }) => (
  <div
    className={cn(
      SURFACE.tile,
      "relative overflow-hidden py-2.5 pl-3.5 pr-3",
      MOTION.enterUp,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span
      aria-hidden="true"
      className={cn(RAIL.base, RAIL.tone[tone] ?? RAIL.tone.neutral)}
    />
    <p className={cn(T.label, "truncate")}>{label}</p>
    <p className={cn(T.value, T.sizeLg, "mt-1.5")}>{value ?? 0}</p>
  </div>
);

/**
 * OCHIQ SEANS QATORI.
 *
 * ⚠️ Rels YAShIL (`emerald`) — u sarlavhadagi "hozir tizimda" nuqtasi
 * bilan BIR XIL ohangda. Ochiq seans hodisa emas, HOZIRGI HOLAT: shu
 * ikkisi bitta rangda bo'lgani uchun ko'z modalning yuqorisidagi jonli
 * nuqtadan pastdagi ro'yxatga bog'lanishni bir qarashda topadi.
 * Jiddiylik ohanglari (rose/amber) bu yerda ishlatilmaydi — aks holda
 * ochiq seans "muammo" bo'lib ko'rinardi.
 *
 * ⚠️ Rels HOVER'DA ochiladi (`ROW.rail`), chunki u BEZAK: qatorning
 * o'zi bir xil ma'noga ega va doimiy chiziq ro'yxatda hech narsani
 * ajratmasdi. Ogohlantirishlarda esa aksincha (pastga qarang).
 */
const SessionRow = ({ session, canRevoke, onRevoke, isBusy, delay }) => (
  <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
    {/* ⚠️ `items-start`: qurilma nomi ikki qatorga cho'zilganda "Tugatish"
        tugmasi qatorning O'RTASIGA emas, YUQORISIGA tekislanishi kerak. */}
    <div className={cn(ROW.base, ROW.hover, "items-start")}>
      <span aria-hidden="true" className={cn(ROW.rail, "bg-emerald-500")} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn(T.tdName, "min-w-0 break-words")}>
            {session.device || "Noma'lum qurilma"}
          </span>
          <span className={cn(CHIP.base, CHIP.tone.neutral)}>
            {channelLabel(session.channel)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {/* IP mono bilan: u o'qilmaydi, TAQQOSLANADI */}
          <span className={T.mono}>{session.ip || "—"}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          {/* Server bergan tayyor yorliq — qo'lda formatlanmaydi */}
          <span className={cn(T.meta, "tabular-nums")}>{session.lastSeenLabel || "—"}</span>
        </div>
      </div>

      {/* ⚠️ Ruxsat yo'q bo'lsa tugma UMUMAN chizilmaydi — o'chirilgan
          holda ham emas (`AlertsPanel` dagi bir xil qoida). */}
      {canRevoke && (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onRevoke?.(session)}
          className={cn(ACTION_BTN, ACTION_TONE.danger, "shrink-0")}
          title="Bu seansni tugatish"
        >
          {isBusy ? (
            <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
          ) : (
            <LogOut className="size-3" strokeWidth={2.4} />
          )}
          Tugatish
        </button>
      )}
    </div>
  </li>
);

/**
 * KIRISH URINISHI QATORI.
 *
 * ⚠️ HOLAT NUQTASI KO'K, YAShIL EMAS — `sentinel.tokens.js` dagi
 * qoida: yashil bu ekranda "muammo yo'q" ni bildiradi va uni
 * "muvaffaqiyatli kirish" egallab olsa, ko'z jiddiylik shkalasini
 * o'qiy olmasdi.
 *
 * ⚠️ Rang yagona belgi emas: muvaffaqiyatsiz urinishda sabab MATN
 * bilan ham turadi ("Parol noto'g'ri"), muvaffaqiyatlisida esa
 * "Kirildi".
 *
 * ⚠️ Rels va nuqta BIR XIL ohangda: rels hover'da ochilganda u nuqtaning
 * davomi bo'lib ko'rinadi, ikki xil rang esa qatorda "ikkinchi ma'no"
 * borday taassurot berardi.
 */
const AttemptRow = ({ attempt, delay }) => {
  const tone = attempt.success ? "bg-sky-500" : "bg-rose-500";

  return (
    <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      <div className={cn(ROW.base, ROW.hover, "gap-2.5")}>
        <span aria-hidden="true" className={cn(ROW.rail, tone)} />

        <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", tone)} />

        <span className={cn(T.td, "min-w-0 flex-1 truncate")}>
          {attempt.success ? "Kirildi" : attempt.reasonLabel || "Muvaffaqiyatsiz"}
        </span>

        <span className={cn(T.mono, "hidden shrink-0 sm:inline")}>{attempt.ip || "—"}</span>

        {/* Sana ustuni O'NGDA va `tabular-nums`: o'n besh qatorli ro'yxatda
            vaqtlar bir vertikalda tursa, ketma-ketlik o'zi ko'rinadi */}
        <span className={cn(T.meta, "shrink-0 text-right tabular-nums")}>
          {attempt.createdLabel || "—"}
        </span>
      </div>
    </li>
  );
};

/**
 * OGOHLANTIRISH QATORI — `AlertsPanel` dagi bilan BIR XIL KO'RINISh,
 * lekin AMALSIZ.
 *
 * ⚠️ Jiddiylik faqat 3px lik relsda va SO'Z bilan takrorlanadigan
 * chipda: qator butunlay ranglansa, ro'yxat "svetofor" ga aylanib,
 * ko'z matnni o'qishdan to'xtardi.
 *
 * ⚠️ RELS DOIMIY — `ROW.rail` EMAS. `ROW.rail` faqat hover/fokusda
 * ochiladi, chunki u bezak; bu rels esa MA'NO tashiydi — qatorning
 * jiddiyligi sichqoncha ustida turgan-turmaganiga bog'liq bo'lishi
 * mumkin emas. Shu sababli shakl qo'lda yoziladi (`AlertsPanel` bilan
 * bir xil satr).
 */
const AlertLine = ({ alert, delay }) => {
  const meta = severityOf(alert.severity);
  const state = statusOf(alert.status);

  return (
    <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      {/* Ko'p qatorli tarkib — `items-start` (seans qatoridagi sabab) */}
      <div className={cn(ROW.base, ROW.hover, "items-start")}>
        <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", meta.rail)} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn(T.tdName, "min-w-0 break-words")}>{alert.title}</span>
            <span className={cn(CHIP.base, meta.chip)}>{meta.label}</span>
            <span className={cn(CHIP.base, state.chip)}>{state.label}</span>

            {alert.hitCount > 1 && (
              <span className={cn(CHIP.base, CHIP.tone.neutral, "tabular-nums")}>
                ×{alert.hitCount}
              </span>
            )}
          </div>

          {alert.detail && (
            <p className={cn(T.td, "mt-1 line-clamp-2")} title={alert.detail}>
              {alert.detail}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className={T.meta}>{alert.typeLabel ?? "—"}</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className={cn(T.meta, "tabular-nums")}>{alert.lastSeenLabel || "—"}</span>
          </div>
        </div>
      </div>
    </li>
  );
};

/* ═══════════════════════ HOLATLAR ═══════════════════════ */

/**
 * YUKLANISH — kartaning SHAKLI, spinner emas.
 *
 * ⚠️ Skelet tarkibning tuzilishini takrorlaydi (uch plitka + ikki
 * ro'yxat): modal ochilganda balandligi taxminan to'g'ri bo'ladi va
 * ma'lumot kelganda oyna "sakramaydi".
 *
 * ⚠️ Skelet qatorlari ham `-mx-5` + hairline bilan chiziladi: yuklanish
 * paytida ko'rinadigan tuzilma kelgan ma'lumotning tuzilmasi bilan bir
 * xil bo'lishi kerak, aks holda ro'yxat "paydo bo'lganda" shakl
 * o'zgarganday tuyulardi.
 */
const SheetSkeleton = () => {
  const bar = "rounded-full bg-slate-100 motion-safe:animate-breathe";

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((index) => (
          <div key={index} className={cn(SURFACE.tile, "py-2.5 pl-3.5 pr-3")}>
            <span
              className={cn(bar, "block h-2.5 w-14")}
              style={{ animationDelay: `${index * 160}ms` }}
            />
            <span
              className={cn(bar, "mt-2.5 block h-4 w-10")}
              style={{ animationDelay: `${index * 160 + 80}ms` }}
            />
          </div>
        ))}
      </div>

      {[0, 1].map((block) => (
        <div key={block} className="mt-5">
          <span className={cn(bar, "block h-2.5 w-24")} />

          <div className={cn(ROW.list, "mt-2")}>
            {[92, 74, 58].map((width, index) => (
              <div key={width} className={cn(ROW.base, "py-3")}>
                <span
                  className={cn(bar, "block h-2.5")}
                  style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Xato — qisqa xabar. Qayta urinish tugmasi yo'q: modal yopib ochiladi. */
const SheetError = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
    <TriangleAlert className="size-5 text-slate-300" strokeWidth={1.8} />
    <p className="text-[12px] font-medium text-slate-500">
      Foydalanuvchi ma'lumotini yuklab bo'lmadi
    </p>
  </div>
);

export default UserSecuritySheet;
