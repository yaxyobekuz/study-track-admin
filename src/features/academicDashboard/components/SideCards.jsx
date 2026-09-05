// Icons
import { Award, BookOpen, Clock, Medal, Pencil, Trophy, Users } from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "@/shared/components/dashboard/MiniTable";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import { LEVEL_COLORS, formatByUnit, percentTone } from "../data/academicDashboard.data";

/** Karta sarlavhasidagi "boshqarish" tugmasi — hamma joyda bir xil. */
export const ManageButton = ({ onClick, label = "Boshqarish", icon: Icon = Pencil }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
  >
    <Icon className="size-3.5" />
    {label}
  </button>
);

/** Ichki kichik sanoq bloki — "23 / Jami yutuqlar" ko'rinishi. */
const StatTile = ({ icon: Icon, value, label, accent = "text-gray-500" }) => (
  <div className="rounded-xl border border-gray-100 p-3">
    <div className="flex items-center gap-2">
      <span className={cn("flex size-8 items-center justify-center rounded-xl bg-gray-50", accent)}>
        <Icon className="size-4" />
      </span>
      <p className="text-lg font-bold leading-none text-gray-900">{value}</p>
    </div>
    <p className="mt-2 truncate text-[11px] text-gray-500" title={label}>
      {label}
    </p>
  </div>
);

/**
 * OLIMPIADA VA MUSOBAQALAR.
 *
 * ⚠️ Sanoq YUTUQ QATORLARI bo'yicha, o'quvchilar bo'yicha emas: bir
 * o'quvchi bir oyda ikkita olimpiadada g'olib bo'lsa, ikkalasi ham
 * ko'rinishi kerak.
 *
 * ⚠️ Daraja kesimida FAQAT nolga teng bo'lmagan qatorlar chiziladi: olti
 * bosqichning to'rttasi doim "0" bo'lib turadigan jadval hech narsa
 * aytmasdi.
 */
export const AchievementsCard = ({ data, isLoading, isError, className, action }) => {
  const stats = data?.achievements;
  const levels = (stats?.levels ?? []).filter((row) => row.count > 0);
  const recent = stats?.recent ?? [];

  return (
    <DashboardCard
      title="Olimpiada va musobaqalar"
      hint={data ? `${data.monthLabel} · jami ${stats?.total ?? 0} ta yutuq` : ""}
      action={action}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!stats || stats.total === 0}
      emptyText="Bu oyda yutuq qayd etilmagan"
      className={className}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={Trophy}
            value={formatByUnit(stats?.total, "count")}
            label="Jami yutuqlar"
            accent="text-amber-500"
          />
          {levels.slice(0, 3).map((row) => (
            <StatTile
              key={row.key}
              icon={Medal}
              value={formatByUnit(row.count, "count")}
              label={`${row.label} daraja`}
            />
          ))}
        </div>

        {/* O'rinlar kesimi — daraja "qayerda", o'rin esa "qanday natija" */}
        {(stats?.places ?? []).some((row) => row.count > 0) && (
          <div className="flex flex-wrap gap-2">
            {stats.places
              .filter((row) => row.count > 0)
              .map((row) => (
                <span
                  key={row.key}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600"
                >
                  <Award className="size-3.5 text-gray-400" />
                  {row.label}
                  <span className="font-semibold text-gray-900">{row.count}</span>
                </span>
              ))}
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              So'nggi yutuqlar
            </p>

            <ul className="space-y-2">
              {recent.map((row) => (
                <li key={row.id} className="flex items-start gap-2 text-xs">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: LEVEL_COLORS[row.level] ?? "#a3a3a3" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-700" title={row.title}>
                      {row.title}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {row.studentName} · {row.className} · {formatDateUz(row.date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-[11px] font-semibold text-gray-600">
                    {row.placeLabel}
                    <span className="block font-normal text-gray-400">{row.levelLabel}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

/**
 * TO'GARAK VA QO'SHIMCHA DARSLAR.
 *
 * ⚠️ "Qamrov" — o'quvchining NECHA FOIZI to'garakka qatnashadi. Dizaynda
 * bu o'rinda "qoniqish darajasi" turgan edi, lekin qoniqish so'rov
 * natijasi va tizimda so'rov yuritilmaydi. Bo'lmagan raqamni ko'rsatish
 * o'rniga o'lchanadigan ko'rsatkich qo'yildi.
 */
export const ClubsCard = ({ data, isLoading, isError, className, action }) => {
  const stats = data?.clubs;
  const items = stats?.items ?? [];

  return (
    <DashboardCard
      title="To'garak va qo'shimcha darslar"
      hint={data ? `${data.monthLabel} · faol to'garaklar` : ""}
      action={action}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!stats || stats.clubCount === 0}
      emptyText="Faol to'garak yo'q"
      className={className}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={BookOpen}
            value={formatByUnit(stats?.clubCount, "count")}
            label="To'garaklar soni"
            accent="text-blue-500"
          />
          <StatTile
            icon={Users}
            value={formatByUnit(stats?.studentCount, "count")}
            label="Qatnashayotgan o'quvchi"
            accent="text-emerald-500"
          />
          <StatTile
            icon={Clock}
            value={formatByUnit(stats?.weeklyHours, "count")}
            label="Haftalik dars soat"
            accent="text-violet-500"
          />
          <div className="rounded-xl border border-gray-100 p-3">
            <p className={cn("text-lg font-bold leading-none", percentTone(stats?.coverage))}>
              {formatByUnit(stats?.coverage, "percent")}
            </p>
            <p className="mt-2 truncate text-[11px] text-gray-500">Qamrov darajasi</p>
            <p className="truncate text-[10px] text-gray-300">O'quvchilarning ulushi</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <MiniTable
              columns={[
                { label: "To'garak" },
                { label: "Fan" },
                { label: "Soat/hafta", align: "right" },
                { label: "A'zolar", align: "right" },
              ]}
            >
              {items.map((row) => (
                <MiniTr key={row.id}>
                  <MiniTd className="font-medium text-gray-700">{row.name}</MiniTd>
                  <MiniTd className="text-gray-500">{row.subjectName ?? "—"}</MiniTd>
                  <MiniTd align="right" className="text-gray-600">
                    {row.weeklyHours}
                  </MiniTd>
                  <MiniTd align="right" className="font-semibold text-gray-900">
                    {formatByUnit(row.memberCount, "count")}
                  </MiniTd>
                </MiniTr>
              ))}
            </MiniTable>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
