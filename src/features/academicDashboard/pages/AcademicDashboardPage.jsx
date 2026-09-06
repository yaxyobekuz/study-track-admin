// React
import { useMemo, useState } from "react";

// Icons
import { CalendarDays, Lock, Target } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import KpiCards from "../components/KpiCards";
import {
  AttendanceTrendChart,
  DistributionCard,
  SubjectChart,
} from "../components/ChartCards";
import {
  ClassesCard,
  TeachersCard,
  TopStudentsCard,
} from "../components/TableCards";
import { AchievementsCard, ClubsCard } from "../components/SideCards";
import { InsightsCard } from "../components/InsightsCard";
import { TargetsModal } from "../components/TargetsModal";
import { AchievementsModal } from "../components/AchievementsModal";
import { ClubsModal } from "../components/ClubsModal";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { useRoles } from "@/features/roles/queries/roles.queries";
import { academicQueries } from "../queries/academicDashboard.queries";

// Hooks
import useEnterOnce from "@/shared/hooks/useEnterOnce";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatTimeUz } from "@/shared/utils/date.utils";
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { buildMonthOptions, currentMonthKey, prevMonthKey } from "@/shared/helpers/month.helpers";

// Design tokens
import { DELAY, MOTION, SURFACE, T, gridDelay } from "../data/dashboard.tokens";

/**
 * Sarlavha panelidagi FOYDALANUVCHI bloki.
 *
 * ⚠️ Ma'lumot HAQIQIY manbadan: `useAuth()` → `auth/me`. Sahifada
 * "Administrator" kabi qotib qolgan matn turishi mumkin emas — u boshqa
 * odam kirgan ekranda ham o'zgarmasdan qolardi.
 *
 * Rasm `profilePicture.variants` dan olinadi (market kartalari bilan bir
 * xil shakl). Rasm bo'lmasa — ismning birinchi harfi, AppSidebar dagidek.
 */
const HeaderUser = () => {
  const { user } = useAuth();
  // ⚠️ `/roles` faqat ega uchun ochiq, shuning uchun qolganlarda ro'yxat
  // bo'sh keladi va `getRoleLabel` rolning o'z qiymatini qaytaradi.
  const { data: roles = [] } = useRoles();

  if (!user) return null;

  const name =
    user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  const photo = user.profilePicture?.variants?.sm?.url || user.profilePicture?.variants?.original?.url;

  return (
    <div className="flex items-center gap-2">
      {photo ? (
        <img src={photo} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold uppercase text-slate-500 ring-1 ring-slate-200/70">
          {name.charAt(0)}
        </div>
      )}

      {/* Ierarxiya tokendan: rol — izoh darajasi, ism — nom darajasi */}
      <div className="min-w-0 leading-tight">
        <p className={cn(T.cardHint, "truncate")}>{getRoleLabel(user.role, roles)}</p>
        <p className={cn(T.tableName, "truncate")}>{name}</p>
      </div>
    </div>
  );
};

/**
 * "JONLI" INDIKATORI — sarlavha panelida, foydalanuvchi blokidan oldin.
 *
 * ⚠️ Vaqt HAQIQIY: TanStack Query'ning `dataUpdatedAt` i (so'nggi
 * muvaffaqiyatli javob kelgan lahza). Qotib qolgan "Jonli" yozuvi yolg'on
 * bo'lardi — ma'lumot hali kelmagan bo'lsa (`0`) indikator chizilmaydi.
 * Nuqta `breathe` bilan nafas oladi (ping halqa EMAS) — ruxsat etilgan
 * beshta doimiy harakatdan biri.
 *
 * ⚠️ FAQAT `2xl` (1536px) DAN KENG EKRANDA. O'LCHANGAN: 1280px da (yon
 * panel ochiq, panel 992px) sarlavha bloki 232 + tanlagichlar 655 +
 * indikator 137 + ajratgichlar/bo'shliqlar > 992 — panel IKKI QATORGA
 * o'ralib 58 → 106px bo'lardi, uch karta qatori 48px yo'qotib, AI tahlil
 * 2+2 o'rniga 1+1 ko'rsatardi (`fitscreen.data.js` hisobi shu 58px ga
 * tayanadi). Indikator ma'lumot emas, ishonch belgisi — tor ekranda
 * undan voz kechish arzon.
 */
const LiveIndicator = ({ updatedAt }) => {
  if (!updatedAt) return null;

  return (
    <div className="hidden items-center gap-1.5 2xl:flex">
      <span aria-hidden className={MOTION.liveDot} />
      <span className={cn(T.valueMeta, "whitespace-nowrap")}>
        Jonli · Yangilangan {formatTimeUz(new Date(updatedAt))}
      </span>
    </div>
  );
};

/**
 * TA'LIM DASHBOARDI — o'quv bo'limining bosh ekrani.
 *
 * Sahifada: oltita KPI va uch qatorli uch ustunli to'r — fanlar,
 * sinflar, davomat dinamikasi, baholar taqsimoti, eng yaxshi o'quvchilar,
 * olimpiada yutuqlari, o'qituvchilar samaradorligi, to'garaklar va
 * avtomatik tahlil.
 *
 * ⚠️ MOLIYA DASHBOARDI BILAN BIR XIL SHAKL: bir xil karta qobig'i
 * (`DashboardCard`), bir xil boshqaruv paneli (oy + taqqoslash oyi), bir
 * xil KPI kartasi. Foydalanuvchi ikkalasini bitta tizim deb o'qiydi —
 * ikki xil ko'rinish uni har o'tishda qaytadan mo'ljal olishga majbur
 * qilardi.
 *
 * ⚠️ HAMMA USTUN TENG KENGLIKDA: to'rda `col-span` yo'q. Bitta blok
 * ikki ustunni egallasa, uning yonidagi karta boshqa qatordagi kartalar
 * bilan tekislanmay qolardi.
 *
 * ⚠️ BITTA SO'ROV, sababi ham bitta: moliya tomonida KPI alohida so'rov
 * edi (u boshqa jadvallarga borardi), bu yerda esa hamma blok AYNI
 * jadvallardan yig'iladi — ikkiga bo'lish faqat ikkinchi marta o'sha
 * baholarni sanashga olib kelardi.
 *
 * ⚠️ BIR EKRANLI REJIM (`fitscreen`) — sahifa viewport balandligiga
 * QULFLANADI: `h-[calc(100dvh-72px)]` + `overflow-hidden`, ya'ni sahifa
 * surilishi STRUKTURAVIY IMKONSIZ. Karta ichida ham surgich yo'q
 * (`DashboardCard` ildizida va maydonida `overflow-hidden`).
 *
 * Ilgari ikkala urinish ham noto'g'ri edi:
 *   1. karta ichiga `overflow-y-auto` — foydalanuvchi rad etdi
 *      ("dabdala ekan", "g'alati bo'lib qolarkan");
 *   2. qat'iy qator soni (`slice(0, 6)`) — boshqa balandlikdagi ekranda
 *      yo sig'masdi, yo pastda bo'sh joy qolardi.
 * Uchinchi yo'l — PIKSEL TAXMIN QILINMAYDI, O'LCHANADI: har karta
 * `useFitRows` bilan o'z maydonini `ResizeObserver` orqali kuzatadi va
 * SIG'MAYDIGAN QATORNI UMUMAN CHIZMAYDI. Shuning uchun na kesilgan
 * yarim qator, na surgich bo'ladi; katta ekranda qator ko'proq,
 * kichigida kamroq.
 *
 * ⚠️ 72px — O'LCHANGAN qiymat, taxmin emas:
 *   8px  `DashboardLayout` ning `md:py-2` yuqori padding'i
 *  40px  `HomeLayout` dagi tab paneli (`TabsLinks`, `h-10`)
 *  16px  tab bilan sahifa orasidagi `space-y-4`
 *   8px  `md:py-2` pastki padding'i
 * (`AppHeader` bu kenglikda `md:hidden`, yon panel `variant="inset"`
 * emas — ular joy olmaydi.) Qiymat o'zgarsa sahifa yo suriladi, yo
 * pastida bo'sh tasma qoladi.
 *
 * ⚠️ KICHIK EKRAN — HALOL ZAXIRA. `fitscreen` sharti
 * `(min-width: 1280px) and (min-height: 960px)` (`fitscreen.data.js` —
 * balandlik chegarasi o'lchab chiqarilgan: undan pastda kartaning
 * o'lchanadigan maydoni eng talabchan jadvalning eng kam ikki qatoriga
 * ham yetmay, oxirgi qator YARIM kesilardi). Undan kichigida ODATDAGI
 * oqim ishlaydi: kartalar tabiiy balandlikda, sahifa suriladi,
 * ro'yxatlar esa to'liq chiziladi. Rejimni MEDIA SO'ROVI belgilaydi,
 * JS o'lchovi emas — o'lchov faqat qator sonini beradi.
 *
 * ⚠️ O'LCHANGAN taqsimot (Chrome, haqiqiy CSS, Inter yuklangan). Ixcham
 * ramkadan keyin, CHEGARADA — 1280x960 da: sarlavha 58px, KPI qatori
 * 81.1px, har karta qatori 239.0px, kartaning o'lchanadigan maydoni
 * 148.3px (to'liq hisob `fitscreen.data.js` da). Har qanday yangi karta
 * shu 148.3px ga qarab tekshirilishi kerak, "1080p da sig'yapti" degani
 * YETARLI EMAS.
 *
 * ⚠️ Diagramma kartalari endi `height` propini OLMAYDI: bir ekranli
 * rejimda balandlikni to'r beradi (`grid-rows-3`), diagramma esa
 * kartaning qoldiq joyini to'ldiradi. `height` propi `DashboardCard` da
 * MOLIYA dashboardi uchun saqlangan.
 *
 * ⚠️ `min-h-0` HAR BIR bo'g'inda: sahifa ustuni, to'r va karta. Bittasi
 * tushib qolsa, flex/grid bolasining standart `min-height: auto` si
 * kontentga qarab cho'zilib, butun to'rni viewportdan chiqarib
 * yuborardi.
 *
 * ⚠️ RUXSAT: `education.view` — ko'rish, `education.plan` — reja
 * belgilash. Sahifada ROLGA qarab tekshiruv YO'Q: rol emas, ruxsat hal
 * qiladi (moliya dashboardi bilan bir xil qoida). Yutuq va to'garak
 * oynalarini kartalarning O'ZI ochadi (`achievements.view` /
 * `clubs.view`) — sahifa ular uchun tugma chizmaydi.
 */
/**
 * SAHIFA QOBIG'I.
 *
 * Oddiy oqimda — oddiy ustun (`flex flex-col gap-3 pb-6`), sahifa
 * suriladi. `fitscreen` da — viewportga qulflangan quti: qat'iy
 * balandlik + `overflow-hidden`, ya'ni SURILISH IMKONSIZ.
 */
const SHELL = [
  "flex flex-col gap-3 pb-6",
  "fitscreen:h-[calc(100dvh-72px)] fitscreen:gap-2",
  "fitscreen:overflow-hidden fitscreen:pb-0",
].join(" ");

/**
 * SARLAVHA PANELI — xoreografiyaning BIRINCHI bo'g'ini (`DELAY.header`,
 * 0ms): `fade-up` bilan kiradi, undan keyin KPI (60ms dan), keyin 3×3
 * to'r (240ms dan). Sirt kartalar bilan bir xil (`SURFACE.card`), lekin
 * hover ko'tarilishi YO'Q — panel bosiladigan element emas
 * (`translate-y-0` tokendagi `-translate-y-0.5` ni bosib ketadi).
 */
const HEADER = cn(
  SURFACE.card,
  "motion-safe:hover:translate-y-0",
  "flex shrink-0 flex-wrap items-center justify-between gap-3 p-3.5 fitscreen:p-2.5",
);

/**
 * KARTALARNING KIRISHI — XOREOGRAFIYA (`dashboard.tokens.js`, `gridDelay`).
 *
 * Har karta o'z `delay` propini oladi va `DashboardCard` uni `fade-up`
 * ga beradi: 240ms dan boshlab qator 0/110/220ms + ustun 0/45/90ms —
 * ko'z chapdan o'ngga, yuqoridan pastga "o'qiydi". Karta BO'SH kiradi,
 * kontent undan 140ms keyin to'ladi (konteyner → kontent).
 *
 * ⚠️ To'rga `[&>*]:animate-*` va `nth-child` kechikishlar BERILMAYDI
 * (eski usul): kechikish kartaning O'ZIDA bo'lsa, u kontentining
 * kechikishini undan hisoblay oladi — to'rdagi `nth-child` bilan bu
 * imkonsiz edi. O'ram div ham qo'shilmaydi: `min-h-0` zanjiri va
 * `grid-rows-3` cho'zilishi uzilib, `useFitRows` o'lchovi buzilardi.
 *
 * ⚠️ Faqat `motion-safe:` — `prefers-reduced-motion` da to'r darhol
 * to'liq ko'rinadi.
 */
const CARD_DELAY = {
  row0: [gridDelay(0, 0), gridDelay(0, 1), gridDelay(0, 2)],
  row1: [gridDelay(1, 0), gridDelay(1, 1), gridDelay(1, 2)],
  row2: [gridDelay(2, 0), gridDelay(2, 1), gridDelay(2, 2)],
};

/**
 * TO'QQIZTA KARTA — BITTA to'r, uch qator.
 *
 * ⚠️ Uch alohida "qator" div i EMAS. `grid-rows-3` bilan uchala qator
 * qoldiq joyni TENG bo'lishadi (`minmax(0, 1fr)` — qator kontentidan
 * kichik bo'lishi mumkin, aynan shu kerak). Alohida div larda har qator
 * o'z kontentiga qarab o'sib, uchinchisi ekrandan chiqib ketardi.
 *
 * ⚠️ Kartalar TARTIBI maketdagidek va u shu yerdagi JOYLASHISH TARTIBI:
 *   1-qator  fanlar · sinflar · davomat
 *   2-qator  taqsimot · top 5 · olimpiada
 *   3-qator  o'qituvchilar · to'garaklar · AI tahlil
 *
 * ⚠️ `col-span` YO'Q — hamma ustun teng kenglikda (moliya dashboardi
 * bilan bir xil qoida).
 */
const GRID = [
  "grid grid-cols-1 gap-3 xl:grid-cols-3",
  "fitscreen:min-h-0 fitscreen:flex-1 fitscreen:grid-rows-3 fitscreen:gap-2",
].join(" ");

const AcademicDashboardPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const headerEnter = useEnterOnce(MOTION.enter);

  const allowed = can("education.view");
  const canPlan = can("education.plan");

  const [month, setMonth] = useState(() => String(currentMonthKey()));
  const [compareMonth, setCompareMonth] = useState(() =>
    String(prevMonthKey(currentMonthKey())),
  );

  // Kelajakdagi oyning ma'lumoti bo'lmaydi — ro'yxat joriy oyda tugaydi
  const monthOptions = useMemo(() => buildMonthOptions({ back: 23, forward: 0 }).reverse(), []);

  // ⚠️ Taqqoslash ro'yxati BIR OY UZUNROQ. Sabab: taqqoslash oyi
  // tanlangan oydan OLDIN bo'lishi shart (server ham tekshiradi), ya'ni
  // ro'yxatning eng eski oyi tanlanganda oddiy filtr BO'SH ro'yxat
  // qaytarardi — tanlagich bo'sh ko'rinib, so'rov esa ro'yxatda umuman
  // yo'q oy bilan ketardi.
  const compareOptions = useMemo(() => {
    const all = buildMonthOptions({ back: 24, forward: 0 }).reverse();
    return all.filter((option) => Number(option.value) < Number(month));
  }, [month]);

  // Oy o'zgarganda taqqoslash oyi undan keyinda qolib ketishi mumkin —
  // avtomatik oldingi oyga tushiriladi
  const safeCompareMonth = useMemo(() => {
    if (Number(compareMonth) < Number(month)) return compareMonth;
    return String(prevMonthKey(Number(month)));
  }, [compareMonth, month]);

  const overview = useQuery({
    ...academicQueries.overview({ month, compareMonth: safeCompareMonth }),
    enabled: allowed,
  });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Ta'lim dashboardini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  // Uchala qiymat SAKKIZTA kartaga bir xil yetib boradi (`{...state}`):
  // har biri o'z yuklanish/xato holatini `DashboardCard` ichida chizadi.
  // To'qqizinchi karta — `InsightsCard` — o'z so'rovi bilan ishlaydi va
  // bu obyektni OLMAYDI; KPI qatori esa `data`/`isLoading` ni alohida
  // oladi.
  const state = {
    data: overview.data,
    isLoading: overview.isLoading,
    isError: overview.isError,
  };

  return (
    <>
      <div className={SHELL}>
        {/* ── Sarlavha paneli: oy, taqqoslash oyi, reja va foydalanuvchi ─
            ⚠️ `shrink-0` — panel HECH QACHON qisqarmaydi: qisqarsa
            tanlagichlar ikki qatorga o'ralib, aksincha, o'sib ketardi.
            Balandligi oddiy oqimda ~66px (14+14 padding + 38px matn
            ustuni), bir ekranli rejimda esa `fitscreen:p-2.5` bilan
            ~58px: yutilgan 8px to'g'ridan-to'g'ri uch karta qatoriga
            bo'linadi. */}
        <div
          className={cn(HEADER, headerEnter.enterClass)}
          style={{ animationDelay: `${DELAY.header}ms` }}
          onAnimationEnd={headerEnter.onAnimationEnd}
        >
          <div className="min-w-0">
            {/* Sahifa sarlavhasi — O'Z darajasi (karta sarlavhasidan
                yuqori): text-xl bold, slate-900. Tokenlardagi `cardTitle`
                12.5px — u karta uchun. */}
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900">
              AKADEMIK DASHBOARD
            </h1>
            {/* ⚠️ `T.cardHint` (11px) — o'qilishning quyi chegarasi; izoh
                undan pastga TUSHIRILMAYDI, aks holda u "bor-yo'qligi
                bilinmaydigan kulrang chiziq" ga aylanardi. */}
            <p className={cn(T.cardHint, "mt-0.5 leading-none")}>
              Ta'lim sifati va o'quv jarayoni tahlil paneli
            </p>
          </div>

          {/* ⚠️ Ikki tanlagich YONMA-YON turadi va ikkalasi ham oy
              ko'rsatadi — yorliqsiz ular bir xil boshqaruvdek ko'rinardi.
              Chapdagisi "qaysi oyni ko'ryapmiz", o'ngdagisi "nima bilan
              solishtiramiz". */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-slate-400" />
              <Select
                triggerClassName="h-9 min-w-36"
                value={month}
                options={monthOptions}
                onChange={setMonth}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(T.label, "shrink-0")}>Taqqoslash</span>
              <Select
                triggerClassName="h-9 min-w-36"
                value={safeCompareMonth}
                options={compareOptions}
                onChange={setCompareMonth}
              />
            </div>

            {canPlan && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openModal("academicTargets", { month: Number(month) })}
              >
                <Target className="size-4" />
                Reja
              </Button>
            )}

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            <LiveIndicator updatedAt={overview.dataUpdatedAt} />

            {/* Ikkinchi ajratgich indikator bilan birga — u yo'qolganda
                ikki chiziq yonma-yon qolmasin */}
            <div className="hidden h-6 w-px bg-slate-200 2xl:block" />

            <HeaderUser />
          </div>
        </div>

        {/* ── Oltita KPI kartasi ───────────────────────────────────────── */}
        <KpiCards data={overview.data} isLoading={overview.isLoading} />

        {/* ── To'qqizta karta: uch qator, uch ustun ─────────────────────
            Bir ekranli rejimda uchala qator qoldiq joyni teng bo'lishadi
            (`grid-rows-3`), oddiy oqimda esa har qator o'z kontentiga
            qarab o'sadi. */}
        <div className={GRID}>
          {/* Har kartaga TOIFA (sarlavha nuqtasi rangi, `CATEGORY_DOT`) va
              KECHIKISH (`gridDelay`) uzatiladi — karta ularni
              `DashboardCard` ga yetkazadi. */}
          {/* ── 1-qator: fanlar · sinflar · davomat dinamikasi ─────────── */}
          <SubjectChart {...state} category="grades" delay={CARD_DELAY.row0[0]} />
          <ClassesCard {...state} category="classes" delay={CARD_DELAY.row0[1]} />
          <AttendanceTrendChart {...state} category="attendance" delay={CARD_DELAY.row0[2]} />

          {/* ── 2-qator: baholar taqsimoti · top o'quvchilar · yutuqlar ── */}
          <DistributionCard {...state} category="grades" delay={CARD_DELAY.row1[0]} />
          <TopStudentsCard {...state} category="students" delay={CARD_DELAY.row1[1]} />
          <AchievementsCard {...state} category="achievements" delay={CARD_DELAY.row1[2]} />

          {/* ── 3-qator: o'qituvchilar · to'garaklar · tahlil ──────────── */}
          <TeachersCard {...state} category="teachers" delay={CARD_DELAY.row2[0]} />
          <ClubsCard {...state} category="clubs" delay={CARD_DELAY.row2[1]} />
          {/* ⚠️ `{...state}` UZATILMAYDI: bu kartaning o'z so'rovi bor
              (`GET /education/insights`) va u sahifadan hech qanday prop
              olmaydi — faqat ko'rinish proplari. */}
          <InsightsCard variant="ai" category="ai" delay={CARD_DELAY.row2[2]} />
        </div>
      </div>

      {/* ⚠️ Oynalar QOBIQDAN TASHQARIDA: qobiqda `overflow-hidden` va
          qat'iy balandlik bor. Portal chiqadigan oyna bundan zarar
          ko'rmasa ham, yopiq holatdagi bo'sh o'ram flex ustunida
          "nol balandlikdagi bola" bo'lib qolib, hisobni chalkashtirardi. */}
      <TargetsModal />
      <AchievementsModal />
      <ClubsModal />
    </>
  );
};

export default AcademicDashboardPage;
