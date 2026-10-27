// React
import { useState } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// Icons
import { ChevronDown, Crown, TrendingDown } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { gradeAnalysisQueries } from "@/features/gradeAnalysis/queries/gradeAnalysis.queries";

// Hooks
import useBranch from "@/shared/hooks/useBranch";

// Utils
import { cn } from "@/shared/utils/cn";
import { fmtAvg } from "@/features/gradeAnalysis/data/gradeAnalysis.data";

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
 * ENG YAXSHI 5 VA ENG PAST 5 O'QUVCHI — bosh sahifadagi karta.
 *
 * ⚠️ MANBA — "Ta'lim → Baholar tahlili → O'quvchilar natijalari" bilan
 * AYNI (`GET /grade-analysis/results`): maktab kesimidagi reyting
 * serverda quriladi (`buildStudentResults` → `buildRankings`), karta esa
 * faqat birinchi beshtasini oladi. Ikkinchi hisob yozilsa, bosh sahifada
 * bir o'quvchi, bo'lim ichida boshqasi birinchi o'rinda turardi.
 *
 * DAVR KARTANING O'ZIDA TANLANADI (haftalik / oylik / yillik) va "Batafsil"
 * AYNI davrni ochadi — kesh ham ikkalasiga BITTA (`results({ period })`).
 * Sukut — natijalar sahifasining sukuti (1 oy).
 */

/** Har ro'yxatdan nechta qator (biznes qarori: eng yaxshi 5, eng past 5). */
const LIMIT = 5;

/**
 * Kartadagi davrlar — serverning `GRADE_ANALYSIS_PERIODS` kalitlari va
 * `title` matni bilan AYNI (`helpers/gradeAnalysis.js`).
 *
 * ⚠️ UCHTASI (biznes qarori): bosh sahifa — bir qarashda ko'riladigan
 * manzara. "3 oylik" va "Yarim yillik" to'liq ro'yxat bilan birga
 * "Baholar tahlili → O'quvchilar natijalari" da qoladi, "Batafsil"
 * havolasi esa aynan shu yerda tanlangan davr bilan ochiladi.
 */
const PERIODS = [
  { key: "week", label: "Haftalik" },
  { key: "month", label: "Oylik" },
  { key: "year", label: "Yillik" },
];

/** Natijalar sahifasining sukut davri bilan AYNI. */
const DEFAULT_PERIOD = "month";

/**
 * "Batafsil" — o'sha davr, o'sha tab.
 *
 * ⚠️ Sukut davrda `period` YOZILMAYDI: natijalar sahifasi ham URL'dan
 * aynan shunday tozalaydi (`StudentResults` → `setPeriod`), aks holda
 * bitta manzaraning ikki xil havolasi paydo bo'lardi.
 */
const detailsLink = (period) =>
  period === DEFAULT_PERIOD
    ? "/grade-analysis?tab=results"
    : `/grade-analysis?tab=results&period=${period}`;

const SECTION = {
  best: {
    label: "Eng yaxshi 5 ta",
    icon: Crown,
    accent: "bg-amber-100 text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    value: "text-emerald-600",
    empty: "Reytingga kirgan o'quvchi yo'q",
  },
  worst: {
    label: "Eng past 5 ta",
    icon: TrendingDown,
    accent: "bg-rose-100 text-rose-700",
    badge: "bg-rose-50 text-rose-700",
    value: "text-rose-600",
    empty: "Eng past natijalar ro'yxati bo'sh",
  },
};

/**
 * Serverdagi `compareBest` / `compareWorst` bilan AYNI qoida: o'rtacha,
 * keyin baholar soni, keyin ism. "Eng past" — har uchalasining teskarisi.
 */
const compareRows = (kind) => (a, b) => {
  const [x, y] = kind === "best" ? [b, a] : [a, b];
  return (
    x.average - y.average ||
    x.gradeCount - y.gradeCount ||
    String(y.name ?? "").localeCompare(String(x.name ?? ""), "uz")
  );
};

/**
 * Ro'yxatning birinchi beshtasi.
 *
 * ⚠️ UMUMIY KO'RINISHDA QAYTA TARTIBLANADI. U yerda so'rov HAR FILIALDA
 * alohida bajariladi va javoblar ULANADI — o'quvchi qatori kimlikka ega
 * bo'lgani uchun guruhlanmaydi (`helpers/aggregateMerge.helpers.js`).
 * Ya'ni ro'yxat boshida langar filialning beshtaligi turib qolardi va
 * "tarmoqning eng yaxshisi" aslida bitta filialniki bo'lib chiqardi.
 * Bitta filial rejimida serverning tartibiga va o'rniga TEGILMAYDI.
 */
const pickTop = (rows = [], kind, isAggregate) => {
  if (!isAggregate) return rows.slice(0, LIMIT);
  return [...rows]
    .sort(compareRows(kind))
    .slice(0, LIMIT)
    .map((row, index) => ({ ...row, place: index + 1 }));
};

const TopStudentsCard = () => {
  const { isAggregate } = useBranch();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  /* ⚠️ Davr almashtirilganda ro'yxat BO'SHAMAYDI (`keepPreviousData`):
     eski beshtalik xiralashib turadi va yangisi kelgach almashadi —
     karta balandligi sakramaydi. */
  const { data, isLoading, isError, isPlaceholderData } = useQuery(
    gradeAnalysisQueries.results({ period }),
  );

  const best = pickTop(data?.rankings?.school?.best, "best", isAggregate);
  const worst = pickTop(data?.rankings?.school?.worst, "worst", isAggregate);
  const hasRows = best.length > 0 || worst.length > 0;

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
            Bu davrda reyting uchun baho yetarli emas
          </p>
        )}

        {!isLoading && !isError && hasRows && (
          <>
            <RankList kind="best" rows={best} />
            <RankList kind="worst" rows={worst} />
          </>
        )}
      </div>

      {/* Batafsil — "Baholar tahlili" bo'limidagi to'liq ro'yxat */}
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
            <li key={`${row.classId}-${row.studentId}`}>
              <RankRow kind={kind} row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Qatorni bosish — o'quvchi profili ("O'quvchilar natijalari" bilan AYNI).
 *
 * ⚠️ BITTA SATR: kartaga o'nta qator sig'ishi kerak. Baholar soni ikkinchi
 * satrga chiqarilsa ro'yxat ikki barobar uzayib, "eng past 5 ta" ekrandan
 * tushib qolardi — shuning uchun u `title` da.
 */
const RankRow = ({ kind, row }) => {
  const navigate = useNavigate();
  const meta = SECTION[kind];

  return (
    <button
      type="button"
      title={`${row.name} · ${row.className || "sinfsiz"} · ${row.gradeCount} baho`}
      onClick={() => navigate(`/users/${row.studentId}`)}
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
        {row.name}
      </span>

      {row.className && (
        <span className="max-w-16 shrink-0 truncate text-xs text-gray-400">
          {row.className}
        </span>
      )}

      <BranchBadge branch={row._branch} />

      <span
        className={cn(
          "w-10 shrink-0 text-right text-sm font-semibold tabular-nums",
          meta.value,
        )}
      >
        {fmtAvg(row.average)}
      </span>
    </button>
  );
};

export default TopStudentsCard;
