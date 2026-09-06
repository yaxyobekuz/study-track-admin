// React
import { Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowRight, Bot, BellOff, Link2Off, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { activityQueries } from "@/features/activityDashboard/queries/activity.queries";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * BOT FAOLLIGI — bosh sahifadagi qisqa kesim.
 *
 * ⚠️ `UsersStats` DAGI "Bot foydalanuvchilar" BILAN BIR XIL EMAS.
 * U yerdagi raqam — BOG'LANGAN hisoblar soni ("nechta ota-ona ulangan"),
 * bu yerda esa FOYDALANISH: "bugun nechtasi botni ochdi". Ikkinchisi
 * birinchisidan tubdan farq qiladi — 300 ta ota-ona ulangan bo'lib,
 * bugun 12 tasi kirgan bo'lishi mumkin va aynan shu raqam xabarni
 * kim ko'rayotganini aytadi.
 *
 * ⚠️ RUXSATSIZ UMUMAN CHIZILMAYDI. `activity.view` yo'q bo'lsa bo'sh
 * karta emas, HECH NARSA: bosh sahifada "ruxsatingiz yo'q" degan quti
 * turishi keraksiz shovqin bo'lardi.
 *
 * ⚠️ DAVR — 7 KUN, dashboarddagi 30 emas. Bosh sahifa "hozir qanday"
 * degan savolga javob beradi, chuqur tahlil esa "Faollik" bo'limida.
 * Qisqa davr so'rovni ham yengillashtiradi.
 */

/** Bosh sahifadagi kesim davri (kun). */
const PERIOD_DAYS = 7;

const BotActivityStats = () => {
  const { can } = usePermissions();
  const allowed = can("activity.view");

  const { data, isLoading, isError } = useQuery({
    ...activityQueries.overview({ days: PERIOD_DAYS }),
    enabled: allowed,
  });

  if (!allowed) return null;

  const today = data?.today?.bot;
  const parents = data?.parents;

  const items = [
    {
      key: "today",
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
      label: "Qamrab olingan o'quvchilar",
      value: parents?.linkedStudents ?? 0,
      suffix: parents?.students ? `/ ${parents.students}` : null,
      icon: Users,
      tone: "indigo",
      hint: "Kamida bitta ota-onasi botga ulangan",
    },
    {
      key: "unlinked",
      label: "Bog'lanmaganlar",
      value: parents?.unlinked ?? 0,
      suffix: null,
      icon: Link2Off,
      tone: "amber",
      hint: "Hisobi umuman ulanmagan o'quvchilar",
    },
    {
      key: "muted",
      label: "Bildirishnoma o'chirilgan",
      value: parents?.notificationsOff ?? 0,
      suffix: null,
      icon: BellOff,
      tone: "slate",
      hint: "Ulangan, lekin xabar olmaydi",
    },
  ];

  const TONE = {
    violet: "bg-violet-50 text-violet-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="mb-4">
      <div className="mb-2.5 flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Bot faolligi</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Ota-onalar botni qanchalik ishlatmoqda — oxirgi {PERIOD_DAYS} kun
          </p>
        </div>

        <Link
          to="/pulse"
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          Batafsil
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.key} title={item.label} className="space-y-4">
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
          </Card>
        ))}
      </div>

      {/* ⚠️ Tarix hali yig'ilmagan bo'lsa buni AYTAMIZ: nol raqam
          "hech kim ishlatmayapti" degani emas, "hali yozilmagan"
          degani va ikkalasini adashtirish noto'g'ri qaror chiqarardi. */}
      {data?.collecting && (
        <p className="mt-2 px-0.5 text-xs text-gray-400">
          Ma'lumot yig'ilmoqda
          {data.sinceLabel ? ` — ${data.sinceLabel} dan boshlab` : ""}.
        </p>
      )}
    </div>
  );
};

export default BotActivityStats;
