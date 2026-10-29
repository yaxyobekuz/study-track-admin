// React
import { useState } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// Icons
import { ChevronDown, Crown, TrendingDown } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { statisticsQueries } from "@/features/statistics/queries/statistics.queries";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import BranchBadge from "@/shared/components/ui/BranchBadge";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";

/**
 * ENG YUQORI 5 VA ENG PAST 5 O'QUVCHI — bosh sahifadagi karta.
 *
 * ⚠️ MANBA — "Asosiy → Statistika" BO'LIMINING O'ZI (biznes qarori,
 * 2026-10-29; `GET /statistics/weekly/school/top`). Ya'ni kartadagi
 * raqam — davr ichida TO'PLANGAN UMUMIY BALL, bo'limdagi "Umumiy ball"
 * ustuni bilan AYNI. Ilgari karta "Ta'lim → Baholar tahlili →
 * O'quvchilar natijalari" dan (o'rtacha baho) o'qirdi va bitta maktabda
 * ikki xil "eng yaxshi o'quvchi" paydo bo'lardi.
 *
 * ⚠️ BESHTALIK SERVERDA KESILADI (`splitTopAndBottom`), panelda
 * QAYTA SARALANMAYDI — umumiy ko'rinishda ham: u yerda yo'l `anchor` deb
 * belgilangan va tarmoq ro'yxati filiallar yig'ilgandan KEYIN
 * saralanadi (`statisticsNetwork.service.js`). Panel saralasa, bosh
 * sahifadagi tartib bo'limdagi tartibdan asta-sekin uzoqlashardi.
 *
 * ⚠️ ENG PAST — FAQAT BALL TO'PLAGANLAR ORASIDAN (server qoidasi):
 * ro'yxatning aynan oxirida davr ichida umuman baho olmaganlar turadi va
 * ular teng bo'lgani uchun tartib alifboga tushardi. Ularning soni
 * yo'qolmaydi — ro'yxat ostida aytiladi.
 *
 * DAVR KARTANING O'ZIDA TANLANADI va "Batafsil" AYNI davrni ochadi.
 */

/**
 * Kartadagi davrlar — serverning `STATISTICS_PERIODS` kalitlari va
 * `title` matni bilan AYNI (`helpers/statistics.helpers.js`).
 *
 * ⚠️ "Kunlik" bu yerda YO'Q (bo'limda bor): bosh sahifa — bir qarashda
 * ko'riladigan manzara, bir kunlik ball esa reyting emas, shovqin
 * (6-7 baho bilan tartib har soatda o'zgaradi).
 */
const PERIODS = [
  { key: "week", label: "Haftalik" },
  { key: "month", label: "Oylik" },
  { key: "year", label: "Yillik" },
];

/** Statistika bo'limining sukut davri HAFTALIK; karta esa oylikdan boshlaydi. */
const DEFAULT_PERIOD = "month";

/**
 * "Batafsil" — Statistika bo'limi, AYNI davr bilan.
 *
 * ⚠️ Davr HAR DOIM yoziladi: bo'limning o'z sukuti haftalik, ya'ni
 * parametrsiz havola kartada "Oylik" turganda boshqa oraliqni ochardi.
 */
const detailsLink = (period) => `/statistics?period=${period}`;

const SECTION = {
  best: {
    label: "Eng yuqori 5 ta",
    icon: Crown,
    accent: "bg-amber-100 text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    value: "text-emerald-600",
    empty: "Bu davrda baho olgan o'quvchi yo'q",
  },
  worst: {
    label: "Eng past 5 ta",
    icon: TrendingDown,
    accent: "bg-rose-100 text-rose-700",
    badge: "bg-rose-50 text-rose-700",
    value: "text-rose-600",
    empty: "Taqqoslash uchun o'quvchi yetarli emas",
  },
};

/** Sinflar ro'yxati — qatorga bitta matn bo'lib tushadi. */
const classNameOf = (row) =>
  (row.classes ?? [])
    .map((item) => item?.name)
    .filter(Boolean)
    .join(", ");

const TopStudentsCard = () => {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  /* ⚠️ Davr almashtirilganda ro'yxat BO'SHAMAYDI (`keepPreviousData`):
     eski beshtalik xiralashib turadi va yangisi kelgach almashadi —
     karta balandligi sakramaydi. */
  const { data, isLoading, isError, isPlaceholderData } = useQuery(
    statisticsQueries.schoolTop({ period }),
  );

  const best = data?.best ?? [];
  const worst = data?.worst ?? [];
  const hasRows = best.length > 0 || worst.length > 0;
  const unscored = data?.unscored ?? 0;

  return (
    <Card className="flex flex-col gap-1.5 xs:gap-3.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">O&apos;quvchilar natijalari</h2>
        <PeriodMenu period={period} onPeriod={setPeriod} />
      </div>

      {/* ⚠️ ICHKI SKROLL YO'Q: o'nta qator ham ko'rinadi. Eski "Top 10
          tanga" kartasida ro'yxat skroll ichida edi va bu yerda u "eng past
          5 ta" ni bekitib qo'yardi — holbuki kartaning yarmi aynan o'sha. */}
      <div
        className={cn(
          "space-y-4 transition-opacity duration-200",
          isPlaceholderData && "opacity-60",
        )}
      >
        {isLoading && <LoadingRows />}

        {!isLoading && isError && (
          <p className="py-8 text-center text-sm text-gray-400">
            Natijalarni yuklab bo&apos;lmadi
          </p>
        )}

        {!isLoading && !isError && !hasRows && (
          <p className="py-8 text-center text-sm text-gray-400">
            Bu davrda hech kim baho olmagan
          </p>
        )}

        {!isLoading && !isError && hasRows && (
          <>
            <RankList kind="best" rows={best} />
            <RankList kind="worst" rows={worst} />

            {/* ⚠️ BALL TO'PLAMAGANLAR JIM QOLMAYDI: ular "eng past"
                ro'yxatiga kirmaydi (alifbo bo'yicha tasodifiy beshta ism
                chiqmasin), lekin soni aytiladi — aks holda rahbar ularni
                umuman ko'rmay qolardi. */}
            {unscored > 0 && (
              <p className="text-center text-xs text-gray-400">
                {unscored} ta o&apos;quvchi bu davrda baho olmagan
              </p>
            )}
          </>
        )}
      </div>

      {/* Batafsil — "Statistika" bo'limidagi to'liq reyting */}
      <Button
        asChild
        variant="link"
        className="inline-block py-0 size-auto mx-auto text-sm"
      >
        <Link to={detailsLink(period)}>Batafsil</Link>
      </Button>
    </Card>
  );
};

/**
 * DAVR TANLAGICHI — kartaning o'ng yuqori burchagidagi yorliq.
 *
 * Ilgari bu yerda shunchaki davr matni turardi ("Oylik") va uni
 * o'zgartirishning yagona yo'li "Baholar tahlili" bo'limiga o'tish edi.
 */
const PeriodMenu = ({ period, onPeriod }) => {
  const active = PERIODS.find((row) => row.key === period) ?? PERIODS[1];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Davrni tanlash"
          className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600"
        >
          {active.label}
          <ChevronDown className="size-3.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup value={period} onValueChange={onPeriod}>
          {PERIODS.map((row) => (
            <DropdownMenuRadioItem key={row.key} value={row.key}>
              {row.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LoadingRows = () => (
  <div className="space-y-2.5">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center gap-2.5">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-9" />
      </div>
    ))}
  </div>
);

const RankList = ({ kind, rows }) => {
  const meta = SECTION[kind];
  const Icon = meta.icon;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-lg",
            meta.accent,
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <p className="text-sm font-semibold text-gray-700">{meta.label}</p>
        {kind === "worst" && (
          <span className="ml-auto text-xs text-gray-400">1 — eng past</span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">{meta.empty}</p>
      ) : (
        <ul className="mt-1">
          {rows.map((row) => (
            <li key={`${row._branch?.id ?? ""}-${row.student.id}`}>
              <RankRow kind={kind} row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Qatorni bosish — o'quvchi profili (Statistika bo'limidagi jadval bilan
 * AYNI xatti-harakat).
 *
 * ⚠️ BITTA SATR: kartaga o'nta qator sig'ishi kerak. Baholar soni ikkinchi
 * satrga chiqarilsa ro'yxat ikki barobar uzayib, "eng past 5 ta" ekrandan
 * tushib qolardi — shuning uchun u `title` da.
 */
const RankRow = ({ kind, row }) => {
  const navigate = useNavigate();
  const meta = SECTION[kind];
  const className = classNameOf(row);

  return (
    <button
      type="button"
      title={`${row.student.fullName} · ${className || "sinfsiz"} · ${row.totalGrades} baho · ${row.totalSum} ball`}
      onClick={() => navigate(`/users/${row.student.id}`)}
      className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-gray-50"
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
          meta.badge,
        )}
      >
        {row.place}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
        {row.student.fullName}
      </span>

      {className && (
        <span className="max-w-16 shrink-0 truncate text-xs text-gray-400">
          {className}
        </span>
      )}

      <BranchBadge branch={row._branch} />

      {/* ⚠️ UMUMIY BALL (o'rtacha baho EMAS) — Statistika bo'limidagi
          "Umumiy ball" ustuni bilan AYNI raqam. Yillik davrda u to'rt
          xonali bo'ladi, shuning uchun ustun biroz kengroq. */}
      <span
        className={cn(
          "w-12 shrink-0 text-right text-sm font-semibold tabular-nums",
          meta.value,
        )}
      >
        {row.totalSum}
      </span>
    </button>
  );
};

export default TopStudentsCard;
