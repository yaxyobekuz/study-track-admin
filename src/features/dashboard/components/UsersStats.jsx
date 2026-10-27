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

// Queries & data
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
    },
    {
      label: "Premium foydalanuvchilar",
      value: stats?.premiumUsers || 0,
      icon: Sparkle,
      path: "premiumUsers",
      to: "/premium",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      {statItems.map((item, idx) => (
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
              shundan {branchSharedOf(stats, item.sharedKey)} tasi bir nechta
              filialda ishlaydi, jamida bir marta sanalgan.
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default UsersStats;
