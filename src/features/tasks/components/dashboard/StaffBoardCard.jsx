// React
import { useMemo, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowUpRight, CircleCheckBig, CircleX, Eye, Hourglass, Users } from "lucide-react";

// Components
import UserAvatar from "../UserAvatar";
import InputSearch from "@/shared/components/ui/input/InputSearch";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  DASHBOARD_PEOPLE_FILTERS,
  filterDashboardPeople,
  getRateBarClass,
  percentText,
} from "../../data/tasks.data";

const INITIAL_ROWS = 10;

// Filtr → ro'yxatga o'tishdagi kesim: "Bajarmagan" bosib "Batafsil" ga
// o'tilsa aynan BAJARILMAGANLARI ochilishi kerak, hammasi emas.
const FILTER_TO_STATE = {
  completed: "done",
  missed: "missed",
  inProgress: "in_progress",
  review: "review",
};

const COUNTERS = [
  { key: "completed", label: "Bajardi", icon: CircleCheckBig, tone: "text-emerald-600" },
  { key: "overdue", label: "Bajarmadi", icon: CircleX, tone: "text-rose-600" },
  { key: "inProgress", label: "Jarayonda", icon: Hourglass, tone: "text-blue-600" },
  { key: "review", label: "Tekshiruvda", icon: Eye, tone: "text-amber-600" },
];

/**
 * XODIMLAR TAXTASI — dashboardning asosiy jadvali: kim qaysi ishni
 * bajardi, qaysinisini bajarmadi, qaysi biri hali jarayonda.
 *
 * ⚠️ FILTR RO'YXATNI TORAYTIRADI, raqamlarni o'zgartirmaydi: "Bajarmagan"
 * tanlanganda ham qatordagi "Bajardi" soni o'z joyida qoladi — aks holda
 * bitta ekranda bitta odamning ikki xil "bajardi" soni chiqardi.
 *
 * "Batafsil" — o'sha odamning topshiriqlari ro'yxati, tanlangan kesim
 * bilan (`/tasks/list?assigneeId=...&state=...`).
 *
 * @param {{ report: object, roles: Array<object>, self?: boolean,
 *   listPath?: string, className?: string }} props
 *   `self` — xodimlar O'ZIGA belgilagan topshiriqlar kesimi: "Tekshiruvda"
 *   ustuni olib tashlanadi (bu oqimda tasdiqlash bosqichi umuman yo'q,
 *   ya'ni ustun har doim 0 ko'rsatib turardi) va matn "berilgan ish" emas,
 *   "o'ziga qo'ygan reja" tilida.
 */
const StaffBoardCard = ({
  report,
  roles,
  self = false,
  listPath = "/tasks/list",
  className = "",
}) => {
  // Davr — ro'yxatga ham o'tadi (raqam va ro'yxat bir xil kesimni ko'rsatsin)
  const periodQuery = report.period?.from
    ? `&startDate=${report.period.from}&endDate=${report.period.to}`
    : "";
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const people = useMemo(
    () => filterDashboardPeople(report.people, filter, search),
    [report.people, filter, search],
  );

  const rows = expanded ? people : people.slice(0, INITIAL_ROWS);
  const stateParam = FILTER_TO_STATE[filter];
  const counters = self ? COUNTERS.filter((c) => c.key !== "review") : COUNTERS;
  // ⚠️ "Tekshiruvda" KESIMI HAM OLIB TASHLANADI: shaxsiy oqimda bu holat
  // strukturaviy yo'q, ya'ni kesim har doim BO'SH ro'yxat qaytarardi va
  // foydalanuvchi buni tizim nosozligi deb o'ylardi (`devices.md` §10 —
  // bir-birini inkor qiladigan ikki filtr bilan AYNI mulohaza).
  const peopleFilters = self
    ? DASHBOARD_PEOPLE_FILTERS.filter((f) => f.value !== "review")
    : DASHBOARD_PEOPLE_FILTERS;

  return (
    <ReportPanelCard
      title="Xodimlar bo'yicha"
      hint={
        self
          ? "Kim o'ziga qancha reja qo'ydi va qanchasini bajardi"
          : "Kim nechta ishni bajardi, qaysinisini bajarmadi"
      }
      className={className}
      isEmpty={report.people.length === 0}
      emptyText={
        self
          ? "Bu davrda hech kim o'ziga ish belgilamagan"
          : "Bu davrda hech kimga topshiriq berilmagan"
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <InputSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xodim ismi..."
            className="w-44"
          />
          <div className="flex gap-1 rounded-full bg-gray-100 p-0.5">
            {peopleFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === f.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {people.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-300">
          <Users className="size-8" strokeWidth={1.5} />
          <p className="text-sm text-gray-400">Bu kesim bo'yicha xodim topilmadi</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {rows.map((person) => (
            <li key={person.userId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
              <div className="flex min-w-48 flex-1 items-center gap-2.5">
                <UserAvatar name={person.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{person.name}</p>
                  <p className="truncate text-xs text-gray-400">
                    {getRoleLabel(person.role, roles)} · {person.assigned} ta{" "}
                    {self ? "reja" : "ish"}
                  </p>
                </div>
              </div>

              {/* Sanoqlar — har biri o'z rangida, nol kulrang */}
              <div className="flex items-center gap-3 xs:gap-4">
                {counters.map(({ key, label, icon: Icon, tone }) => (
                  <div key={key} className="w-16 text-center" title={label}>
                    <p
                      className={cn(
                        "flex items-center justify-center gap-1 text-sm font-semibold tabular-nums",
                        person[key] > 0 ? tone : "text-gray-300",
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={2} />
                      {person[key]}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-none text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Bajarilish darajasi */}
              <div className="flex w-36 items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                  {person.rate != null && (
                    <div
                      className={cn("h-1.5 rounded-full", getRateBarClass(person.rate))}
                      style={{ width: `${Math.max(person.rate, 2)}%` }}
                    />
                  )}
                </div>
                <span className="w-11 text-right text-xs font-semibold tabular-nums text-gray-700">
                  {percentText(person.rate)}
                </span>
              </div>

              <Link
                to={`${listPath}?assigneeId=${person.userId}${stateParam ? `&state=${stateParam}` : ""}${periodQuery}`}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                Batafsil
                <ArrowUpRight className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {people.length > INITIAL_ROWS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-lg py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          {expanded ? "Qisqartirish" : `Yana ${people.length - INITIAL_ROWS} kishini ko'rsatish`}
        </button>
      )}
    </ReportPanelCard>
  );
};

export default StaffBoardCard;
