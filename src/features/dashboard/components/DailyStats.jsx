// React
import { Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowRight, BellOff, Bot, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import StudentSystemsCard from "./StudentSystemsCard";
import StudentAttendanceCard from "./StudentAttendanceCard";
import TeacherAttendanceCard from "./TeacherAttendanceCard";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { activityQueries } from "@/features/activityDashboard/queries/activity.queries";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * BOSH SAHIFANING IKKINCHI QATORI.
 *
 * ⚠️ QATOR REJIMGA QARAB ALMASHADI (biznes qarori, 2026-10-28):
 *
 *   · "Umumiy — barcha filiallar" (faqat tizim egasi) —
 *     O'QUVCHILAR DAVOMATI va O'QITUVCHILAR DAVOMATI kartalari;
 *     bot raqamlari esa yuqoridagi "Bot foydalanuvchilar" kartasiga
 *     qatorlar bo'lib birlashadi (`UsersStats`).
 *   · Filial tanlangan bo'lsa — avvalgidek "Bugun botda faol" va
 *     "Qamrab olingan o'quvchilar" kartalari.
 *
 * Sabab: davomat hisoboti TARMOQ savoliga javob beradi ("qaysi filialda
 * davomat tushdi") va u faqat tizim egasiga ochiq — "Xodimlar
 * topshiriqlari" kartasi bilan AYNI qoida. Shu sababli bot raqamlari ham
 * faqat O'SHA ko'rinishda birlashadi: filial ichida ular o'z joyida
 * qoladi, ya'ni birorta raqam yo'qolmaydi va maketda bo'sh joy qolmaydi.
 *
 * ⚠️ HAR KARTA O'Z SO'ROVI VA O'Z RUXSATI BILAN. Bitta so'rovga tiqilsa,
 * uch bo'limning ruxsatlari chalkashardi: davomat (`attendance.reports`),
 * tashqi tizimlar (`studentSystems.view`) va bot (`activity.view`) —
 * uchta boshqa-boshqa qaror.
 *
 * ⚠️ HECH NARSA KO'RINMASA QATORNING O'ZI CHIZILMAYDI: bo'sh sarlavha
 * ostida bo'sh joy turishi nosozlikka o'xshab ko'rinardi.
 */

/** Bot kesimining davri (kun) — "hozir qanday" degan savol uchun. */
const PERIOD_DAYS = 7;

const TONE = {
  violet: "bg-violet-50 text-violet-700",
  indigo: "bg-indigo-50 text-indigo-700",
  slate: "bg-slate-100 text-slate-600",
};

/**
 * Bot sanoqchisining kartasi — maketi qolgan kartalar bilan AYNI
 * (belgi + raqam + izoh + filiallar kesimi).
 */
const BotCard = ({ item, data, isLoading, isError }) => (
  <Card title={item.label} className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          TONE[item.tone],
        )}
      >
        <item.icon className="size-5" strokeWidth={1.5} />
      </div>

      {isLoading ? (
        <Skeleton className="h-7 w-16" />
      ) : isError ? (
        <span className="text-2xl font-bold text-gray-300">—</span>
      ) : (
        <div className="flex items-baseline gap-1">
          <Counter
            value={item.value}
            className="text-2xl font-bold tabular-nums text-gray-900"
          />
          {item.suffix && (
            <span className="text-sm font-medium text-gray-400">
              {item.suffix}
            </span>
          )}
        </div>
      )}
    </div>

    <p className="text-xs leading-relaxed text-gray-500">{item.hint}</p>

    {/* Umumiy ko'rinishda: qaysi filialda qancha */}
    <BranchSplit data={data} path={item.path} to="/pulse" />
  </Card>
);

const DailyStats = () => {
  const { isAggregate } = useBranch();
  const { can } = usePermissions();

  // Davomat kartalari FAQAT umumiy ko'rinishda (yuqoridagi izoh)
  const canAttendance = isAggregate && can("attendance.reports");
  const canSystems = can("studentSystems.view");
  const canBot = can("activity.view");

  const { data, isLoading, isError } = useQuery({
    ...activityQueries.overview({ days: PERIOD_DAYS }),
    enabled: canBot,
  });

  if (!canAttendance && !canSystems && !canBot) return null;

  const today = data?.today?.bot;
  const parents = data?.parents;

  /**
   * Filial ichida ko'rinadigan bot kartalari. Umumiy ko'rinishda ular
   * "Bot foydalanuvchilar" kartasining ichiga ko'chadi (`UsersStats`).
   */
  const botCards = [
    {
      key: "today",
      path: "today.bot.active",
      label: "Bugun botda faol",
      value: today?.active ?? 0,
      suffix: today?.total ? `/ ${today.total}` : null,
      icon: Bot,
      tone: "violet",
      hint:
        today?.rate != null
          ? `Bog'langan hisoblarning ${today.rate}% i`
          : "Bog'langan hisoblar orasida",
    },
    {
      key: "students",
      path: "parents.linkedStudents",
      label: "Qamrab olingan o'quvchilar",
      value: parents?.linkedStudents ?? 0,
      suffix: parents?.students ? `/ ${parents.students}` : null,
      icon: Users,
      tone: "indigo",
      hint: "Kamida bitta ota-onasi botga ulangan",
    },
  ];

  return (
    <div className="mb-4">
      <div className="mb-2.5 flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">
            {canAttendance ? "Kundalik ko'rsatkichlar" : "Bot faolligi"}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {canAttendance
              ? "Davomat, tashqi tizimlar va bot — bir qarashda"
              : `Ota-onalar botni qanchalik ishlatmoqda — oxirgi ${PERIOD_DAYS} kun`}
          </p>
        </div>

        {/* ⚠️ Havola aynan BOT bo'limiga olib boradi va shunday nomlanadi:
            umumiy ko'rinishda qator uch xil mavzuni qamraydi va oddiy
            "Batafsil" qaysi bo'limga olib borishi noma'lum bo'lib qolardi. */}
        {canBot && (
          <Link
            to="/pulse"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
          >
            {canAttendance ? "Bot faolligi" : "Batafsil"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Har karta ruxsatini O'ZI tekshiradi va yo'q bo'lsa `null`
            qaytaradi — maketda bo'sh joy qolmaydi. */}
        {canAttendance ? (
          <>
            <StudentAttendanceCard />
            <TeacherAttendanceCard />
          </>
        ) : (
          canBot &&
          botCards.map((item) => (
            <BotCard
              key={item.key}
              item={item}
              data={data}
              isLoading={isLoading}
              isError={isError}
            />
          ))
        )}

        <StudentSystemsCard />

        {canBot && (
          <BotCard
            item={{
              key: "muted",
              path: "parents.notificationsOff",
              label: "Bildirishnoma o'chirilgan",
              value: parents?.notificationsOff ?? 0,
              suffix: null,
              icon: BellOff,
              tone: "slate",
              hint: "Ulangan, lekin xabar olmaydi",
            }}
            data={data}
            isLoading={isLoading}
            isError={isError}
          />
        )}
      </div>

      {/* ⚠️ Tarix hali yig'ilmagan bo'lsa buni AYTAMIZ: nol raqam
          "hech kim ishlatmayapti" degani emas, "hali yozilmagan"
          degani va ikkalasini adashtirish noto'g'ri qaror chiqarardi. */}
      {canBot && data?.collecting && (
        <p className="mt-2 px-0.5 text-xs text-gray-400">
          Bot ma&apos;lumoti yig&apos;ilmoqda
          {data.sinceLabel ? ` — ${data.sinceLabel} dan boshlab` : ""}.
        </p>
      )}
    </div>
  );
};

export default DailyStats;
