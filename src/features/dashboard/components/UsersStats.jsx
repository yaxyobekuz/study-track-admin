// Router
import { Link, useNavigate } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";

// API
import { branchSharedOf, branchSplitSum } from "@/shared/api/aggregateMeta";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import useBranch from "@/shared/hooks/useBranch";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import StaffTasksCard from "./StaffTasksCard";

// Queries & data
import { activityQueries } from "@/features/activityDashboard/queries/activity.queries";
import { enrollmentQueries } from "@/features/enrollment/queries/enrollment.queries";
import {
  MINUS,
  percentText,
  toneOfNet,
} from "@/features/enrollment/data/movement.data";

// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import {
  Bot,
  Briefcase,
  FileText,
  GraduationCap,
  Minus,
  Sparkle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/** Hisobot sahifasi — kartadagi belgi aynan shu yo'lga olib keladi. */
const MOVEMENT_PATH = "/student-movement";

/** Bot kesimining davri — `DailyStats` bilan AYNI (so'rov keshi umumiy). */
const BOT_PERIOD_DAYS = 7;

/**
 * Bot hujjati — kartadagi belgi aynan shu yo'lga olib keladi.
 *
 * ⚠️ Hujjat FAQAT umumiy ko'rinishda ochiladi, shuning uchun belgi ham
 * aynan o'sha rejimda bosiladi (`canSeeBot`).
 */
const BOT_REPORT_PATH = "/bot-report";

/**
 * O'sish / tushish o'qi.
 *
 * ⚠️ Komponent MODUL darajasida e'lon qilinadi: ikonka render ichida
 * tanlanib o'zgaruvchiga yozilsa, React uni har safar YANGI komponent deb
 * qabul qilib, holatini tashlab yuborardi (`react-hooks/static-components`).
 */
const TrendIcon = ({ net, className }) => {
  if (net > 0) return <TrendingUp className={className} strokeWidth={2.2} />;
  if (net < 0) return <TrendingDown className={className} strokeWidth={2.2} />;
  return <Minus className={className} strokeWidth={2.2} />;
};

/**
 * O'SISH VA TUSHISH QATORI — "bu oy" va "bu yil".
 *
 * ⚠️ Uchta raqam BIRGA turadi va bu ataylab: faqat foiz ko'rsatilsa,
 * "+2,7%" ning orqasida 20 ta kelgan va 8 ta ketgan bola borligi
 * ko'rinmasdi — holbuki rahbar uchun aynan shu ikki son muhim.
 *
 * ⚠️ Foizni panel HISOBLAMAYDI, server beradi
 * (`studentMovement.service.js`): hujjatdagi raqam bilan kartadagi raqam
 * bir xil formuladan chiqishi shart.
 */
const MovementRow = ({ label, item }) => (
  <div className="flex items-center justify-between gap-2 text-[11px]">
    <span className="shrink-0 text-gray-500">{label}</span>

    <span className="flex items-center gap-1.5 tabular-nums">
      <span className="text-emerald-600">+{item.joined}</span>
      <span className="text-gray-300">/</span>
      <span className="text-red-500">
        {MINUS}
        {item.left}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-semibold",
          toneOfNet(item.net),
        )}
      >
        <TrendIcon net={item.net} className="size-3" />
        {percentText(item.growthPercent)}
      </span>
    </span>
  </div>
);

/**
 * BOT KARTASINING ICHKI QATORI — "Bugun faol" va "Qamrab olingan".
 *
 * ⚠️ IKKI RAQAM UCHINCHISI BILAN BIR KARTADA (biznes qarori, 2026-10-28).
 * Ilgari ular pastdagi qatorda alohida ikki karta edi, lekin uchalasi ham
 * BITTA savolning uch qismi: "botdan qanchalik foydalanilyapti".
 * Bog'langan hisoblar soni yonida bugungi faollik va qamrov turmasa,
 * "276" degan raqam o'z-o'zidan hech narsa demasdi.
 *
 * ⚠️ RAQAMLAR BOSHQA-BOSHQA MANBADAN: kartaning katta raqami — BOG'LANGAN
 * hisoblar (`users/stats`), bu qatorlar esa FOYDALANISH
 * (`activityDashboard`). Shuning uchun so'rov ham, ruxsat ham alohida —
 * `activity.view` bo'lmasa qatorlar umuman chizilmaydi.
 */
const BotRow = ({ label, value, total, extra, title }) => (
  <div
    title={title}
    className="flex items-center justify-between gap-2 text-[11px]"
  >
    <span className="shrink-0 text-gray-500">{label}</span>

    <span className="flex items-center gap-1.5 tabular-nums">
      <span className="font-semibold text-gray-700">{value ?? 0}</span>
      {total ? (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">{total}</span>
        </>
      ) : null}
      {extra ? (
        <span className="font-semibold text-blue-600">{extra}</span>
      ) : null}
    </span>
  </div>
);

const UsersStats = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { isAggregate } = useBranch();

  /**
   * ⚠️ O'SISH/TUSHISH FAQAT "UMUMIY — BARCHA FILIALLAR" KO'RINISHIDA
   * (biznes qarori, 2026-10-27), ya'ni faqat tizim egasida.
   *
   * Savol tarmoq darajasida beriladi: "bu oy butun tarmoqda nechta bola
   * keldi, nechtasi ketdi". Bitta filial ichida o'sha qator o'sha
   * filialning raqami bo'lib qolardi — bir xil ko'rinishdagi ikki qator
   * ikki xil savolga javob bergani esa raqamga ishonchni yo'qotadi.
   *
   * Ruxsat ham shart: server yo'li `enrollment.view` ortida turibdi
   * (`studentEnrollment.routes.js`).
   */
  const canSeeMovement = isAggregate && can("enrollment.view");

  /**
   * ⚠️ TO'RTINCHI KARTA REJIMGA QARAB ALMASHADI (biznes qarori,
   * 2026-10-27): umumiy ko'rinishda u "Xodimlar topshiriqlari", filial
   * ichida esa avvalgidek "Premium foydalanuvchilar".
   *
   * Sabab: topshiriqlar hisoboti TARMOQ savoliga javob beradi ("qaysi
   * filialda ish qolib ketyapti") va bitta filial ichida u Lavozimlar
   * markazidagi raqamni takrorlardi. Premium esa yo'qolmaydi — u o'z
   * joyida qoladi, ya'ni birorta raqam ekrandan tushib qolmaydi.
   *
   * ⚠️ Shart KARTANING O'ZIDA ham bor (`StaffTasksCard`), lekin tanlov
   * shu yerda qilinadi: karta ichida `null` qaytsa, to'rt ustunli
   * maketda BO'SH JOY qolardi.
   */
  const showStaffTasks = isAggregate && can("tasks.view");

  /**
   * ⚠️ BOT RAQAMLARI FAQAT UMUMIY KO'RINISHDA BIRLASHADI (biznes qarori,
   * 2026-10-28). Filial tanlangan bo'lsa "Bugun botda faol" va "Qamrab
   * olingan o'quvchilar" avvalgidek PASTDAGI QATORDA alohida karta bo'lib
   * turadi (`DailyStats`) — u yerdagi o'rinni davomat kartalari faqat
   * umumiy ko'rinishda egallaydi. Ikkala joyda ham ko'rsatilsa, bitta
   * raqam ekranda ikki marta turardi.
   *
   * Ma'lumot FOYDALANISH bo'limidan keladi (`activity.view`) — bog'langan
   * hisoblar sanog'idan alohida ruxsat.
   */
  const canSeeBot = isAggregate && can("activity.view");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => usersAPI.getStats().then((res) => res.data.data),
  });

  // O'quvchilar kartasi uchun o'sish/tushish — ruxsati bo'lmasa umuman
  // so'ralmaydi (`DepartedStudents` bilan AYNI qaror).
  const { data: movement, isLoading: movementLoading } = useQuery({
    ...enrollmentQueries.movementSummary(),
    enabled: canSeeMovement,
  });

  /**
   * ⚠️ AYNI SO'ROV `DailyStats` DA HAM BOR va bu ataylab: kalit bir xil
   * (`days: 7`), ya'ni TanStack uni BIR MARTA yuboradi va ikkala joy
   * bitta keshdan o'qiydi. Ikkinchi parametr qo'yilsa, bosh sahifa ikki
   * marta so'rardi.
   */
  const { data: botActivity, isLoading: botLoading } = useQuery({
    ...activityQueries.overview({ days: BOT_PERIOD_DAYS }),
    enabled: canSeeBot,
  });

  // `path` — umumiy ko'rinishdagi filiallar kesimining kaliti, `to` esa
  // o'sha filialga o'tgandan keyin ochiladigan bo'lim (`BranchSplit`).
  const statItems = [
    {
      label: "O'quvchilar",
      value: stats?.students || 0,
      icon: GraduationCap,
      path: "students",
      to: "/users/students",
      // ⚠️ FAQAT SHU KARTADA va faqat UMUMIY KO'RINISHDA: belgi bosilsa
      // "O'quvchilar harakati" hujjati PLATFORMA ICHIDA ochiladi (yangi
      // tab emas).
      // ⚠️ Rejimi yoki ruxsati to'g'ri kelmasa belgi BOSILMAYDI: marshrut
      // ruxsat bilan to'silmagan (`ROUTE_PERMISSIONS` faqat menyuni
      // filtrlaydi), ya'ni bosilsa odam bo'sh sahifaga va 403 ga
      // tushardi.
      report: canSeeMovement ? MOVEMENT_PATH : null,
      reportTitle: "O'quvchilar harakati hisobotini ochish",
      movement: canSeeMovement,
    },
    {
      label: "Xodimlar",
      value: stats?.workers || 0,
      icon: Briefcase,
      path: "workers",
      to: "/users/staff",
      // ⚠️ Xodim bir nechta filialda ishlashi mumkin: jami uni BIR MARTA
      // sanaydi, kesim esa har filialda ko'rsatadi — shuning uchun kesim
      // yig'indisi jamidan katta chiqishi mumkin va sababi yozib qo'yiladi.
      sharedKey: "workers",
    },
    {
      label: "Bot foydalanuvchilar",
      value: stats?.telegramUsers || 0,
      icon: Bot,
      path: "telegramUsers",
      to: "/pulse",
      sharedKey: "telegramUsers",
      // Bugungi faollik va qamrov — AYNI kartaning ichida (pastga qarang)
      bot: canSeeBot,
      // ⚠️ Belgi bosilganda hujjat PLATFORMA ICHIDA ochiladi (yangi tab
      // emas) — "O'quvchilar" kartasi bilan AYNI naqsh.
      report: canSeeBot ? BOT_REPORT_PATH : null,
      reportTitle: "Bot foydalanuvchilari hisobotini ochish",
    },
    showStaffTasks
      ? { key: "staffTasks", custom: true }
      : {
          label: "Premium foydalanuvchilar",
          value: stats?.premiumUsers || 0,
          icon: Sparkle,
          path: "premiumUsers",
          to: "/premium",
        },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      {statItems.map((item, idx) =>
        // O'Z so'rovi va o'z davri bor karta — bu yerda faqat O'RNI
        // band qiladi (`DailyStats` bilan AYNI naqsh).
        item.custom ? (
          <StaffTasksCard key={item.key} />
        ) : (
          <Card key={idx} title={item.label} className="space-y-3">
            <div className="flex items-center justify-between">
              {/* Icon — hisoboti bor kartada BOSILADI. Ustiga kelganda
                  hujjat belgisiga almashadi: dizayn o'zgarmaydi, lekin
                  bosiladigani ko'rinib turadi. */}
              {item.report ? (
                <button
                  type="button"
                  title={item.reportTitle}
                  aria-label={item.reportTitle}
                  onClick={() => navigate(item.report)}
                  className="group relative flex size-9 items-center justify-center rounded-full bg-blue-50 outline-none transition hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <item.icon
                    className="size-5 text-blue-700 transition-opacity group-hover:opacity-0"
                    strokeWidth={1.5}
                  />
                  <FileText
                    className="absolute size-4 text-blue-700 opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </button>
              ) : (
                <div className="flex items-center justify-center size-9 bg-blue-50 rounded-full">
                  <item.icon className="size-5 text-blue-700" strokeWidth={1.5} />
                </div>
              )}

              {/* Value */}
              {isLoading ? (
                <Skeleton className="w-16 h-7" />
              ) : (
                <Counter
                  value={item.value}
                  className="text-2xl font-bold text-gray-900"
                />
              )}
            </div>

            {/* O'SISH / TUSHISH — keldi va ketdi, oy va yil kesimida */}
            {item.movement &&
              (movementLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : movement ? (
                <Link
                  to={item.report}
                  className="block space-y-1 rounded-lg border-t border-gray-100 pt-2 transition hover:bg-gray-50"
                >
                  <MovementRow label="Bu oy" item={movement.month} />
                  <MovementRow label="Bu yil" item={movement.year} />
                </Link>
              ) : null)}

            {/* BOT: bugungi faollik va qamrov — AYNI kartada */}
            {item.bot &&
              (botLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : botActivity ? (
                // ⚠️ QATORLAR AVVALGIDEK FAOLLIK BO'LIMIGA olib boradi,
                // hujjatga EMAS (foydalanuvchi so'rovi): hujjat faqat
                // belgi orqali ochiladi, qatorlar esa "kimlar" degan
                // savolga javob beradigan ro'yxatga.
                <Link
                  to="/pulse"
                  className="block space-y-1 rounded-lg border-t border-gray-100 pt-2 transition hover:bg-gray-50"
                >
                  <BotRow
                    label="Bugun faol"
                    value={botActivity.today?.bot?.active}
                    total={botActivity.today?.bot?.total}
                    extra={
                      botActivity.today?.bot?.rate != null
                        ? `${botActivity.today.bot.rate}%`
                        : null
                    }
                    title="Bog'langan hisoblardan bugun botni ochganlar"
                  />
                  <BotRow
                    label="Qamrab olingan"
                    value={botActivity.parents?.linkedStudents}
                    total={botActivity.parents?.students}
                    title="Kamida bitta ota-onasi botga ulangan o'quvchilar"
                  />
                </Link>
              ) : null)}

            {/* Umumiy ko'rinishda: qaysi filialda qancha (bosilsa — o'sha
                filialga o'tadi va ro'yxatni ochadi) */}
            <BranchSplit data={stats} path={item.path} to={item.to} />

            {/* ⚠️ ARIFMETIKA OCHIQ YOZILADI. Xodimning hammasi ikkala filialga
                biriktirilgan bo'lsa, jami KATTA filialning soniga TENG chiqadi
                ("MBSI 95, AiHub 23, jami 95") va bu "AiHub hisobga olinmadi"
                bo'lib o'qiladi. Shuning uchun yig'indi ham, takrorlanish ham
                raqam bilan ko'rsatiladi. */}
            {item.sharedKey && branchSharedOf(stats, item.sharedKey) > 0 && (
              <p className="text-[11px] leading-snug text-gray-400">
                Filiallar yig'indisi {branchSplitSum(stats, item.path)} —
                shundan {branchSharedOf(stats, item.sharedKey)} tasi bir
                nechta filialda ishlaydi, jamida bir marta sanalgan.
              </p>
            )}
          </Card>
        ),
      )}
    </div>
  );
};

export default UsersStats;
