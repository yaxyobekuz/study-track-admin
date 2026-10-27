// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Router
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeft, RotateCcw, UserMinus, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Counter from "@/shared/components/ui/Counter";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import DepartureTrendCard from "../components/DepartureTrendCard";
import DepartureReasonBreakdown from "../components/DepartureReasonBreakdown";

// Queries & data
import { enrollmentQueries } from "../queries/enrollment.queries";
import { formatDayCount } from "../data/enrollment.data";
import {
  DEPARTURE_COLUMNS,
  DEPARTURE_PAGE_LIMIT,
  DEPARTURE_PERIODS,
  DEPARTURE_PERIOD_DEFAULT,
  DEPARTURE_REASON_FILTER,
  departureStateOf,
  studentNameOf,
  toneOfReason,
} from "../data/departures.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

/**
 * CHIQIB KETGAN O'QUVCHILAR — "kim, QACHON va NEGA ketdi" registri.
 *
 * ⚠️ MANBA — O'QISH DAVRINING YOPILGANI, alohida jadval emas
 * (`server/src/services/studentDeparture.service.js` dagi izoh). Shuning
 * uchun ruxsat ham `enrollment.view`: ketish sababi o'quvchi profilida
 * allaqachon ko'rinadi, bu ekran faqat uni bitta joyga yig'adi.
 *
 * ⚠️ ARXIVLANGAN O'QUVCHI HAM RO'YXATDA. "Arxivlangan faqat arxiv
 * ro'yxatida" qoidasi JORIY o'quvchilar ro'yxatlariga tegishli, bu esa
 * ularning aksi — KETGANLAR jurnali (`education.md` §4 dagi istisno).
 *
 * ⚠️ "KETGAN" DEGANI "YO'Q" DEGANI EMAS: o'quvchi qaytib kelgan bo'lishi
 * mumkin (bir o'quvchida bir nechta davr) — shuning uchun oxirgi ustun
 * HOZIRGI holatni aytadi.
 *
 * Filtrlar URL da (`period`, `from`, `to`, `reason`, `search`, `page`):
 * ro'yxat holatini havola qilib yuborsa bo'ladi va "orqaga" tugmasi
 * filtrni yo'qotmaydi.
 */
const DeparturesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const reason = searchParams.get("reason") || "all";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const periodParam = searchParams.get("period");
  const period = DEPARTURE_PERIODS.some((item) => item.value === periodParam)
    ? periodParam
    : DEPARTURE_PERIOD_DEFAULT;

  // Qidiruv inputi darhol, URL esa 300ms dan keyin (`ClassChangesPage`
  // bilan AYNI naqsh: har harfga so'rov yuborilmasin)
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const debounceRef = useRef(null);

  // URL tashqaridan o'zgarsa ("orqaga") input ham yangilanadi
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchParams((prev) => {
          if (value.trim()) prev.set("search", value.trim());
          else prev.delete("search");
          prev.delete("page");
          return prev;
        });
      }, 300);
    },
    [setSearchParams],
  );

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Filtr o'zgarsa — BIRINCHI SAHIFAGA, hodisaning o'zida (effektda emas):
  // aks holda 5-sahifada turib filtrlanganda natija bor bo'la turib
  // ro'yxat bo'sh ko'rinardi (`devices.md` §10)
  const setParam = useCallback(
    (key, value, isDefault) =>
      setSearchParams((prev) => {
        if (isDefault) prev.delete(key);
        else prev.set(key, value);
        prev.delete("page");
        return prev;
      }),
    [setSearchParams],
  );

  const setPeriod = (value) =>
    setSearchParams((prev) => {
      if (value === DEPARTURE_PERIOD_DEFAULT) prev.delete("period");
      else prev.set("period", value);

      // Preset va qo'lda tanlangan oraliq BIR VAQTDA ishlamaydi: server
      // `from`/`to` ni ustun deb oladi, ya'ni ular qolib ketsa tanlangan
      // tab hech narsani o'zgartirmagandek ko'rinardi
      if (value !== "custom") {
        prev.delete("from");
        prev.delete("to");
      }

      prev.delete("page");
      return prev;
    });

  const goToPage = (next) =>
    setSearchParams((prev) => {
      prev.set("page", String(next));
      return prev;
    });

  const resetFilters = () => setSearchParams(new URLSearchParams());

  const params = useMemo(
    () => ({
      page,
      limit: DEPARTURE_PAGE_LIMIT,
      ...(period === "custom"
        ? { ...(from && { from }), ...(to && { to }) }
        : { period }),
      ...(reason !== "all" && { reason }),
      ...(search && { search }),
    }),
    [page, period, from, to, reason, search],
  );

  const { data, isLoading, isError, refetch, isPlaceholderData } = useQuery(
    enrollmentQueries.departures(params),
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats;
  const range = data?.range;
  const offset = ((pagination?.page ?? page) - 1) * DEPARTURE_PAGE_LIMIT;

  const hasFilters =
    Boolean(search) ||
    reason !== "all" ||
    period !== DEPARTURE_PERIOD_DEFAULT ||
    Boolean(from) ||
    Boolean(to);

  return (
    <div className="space-y-4">
      {/* Sarlavha */}
      <div className="flex items-start gap-1.5">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft strokeWidth={1.5} />
        </Button>

        <div>
          <h1 className="page-title">Chiqib ketgan o&apos;quvchilar</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Kim, qachon va nega maktabni tashlab ketdi — o&apos;qish davri
            yopilgan har bir holat
          </p>
        </div>
      </div>

      {/* Davr */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TabsButtons
          value={period}
          items={DEPARTURE_PERIODS}
          onChange={setPeriod}
          className="min-w-0"
          listClassName="max-w-full overflow-x-auto overflow-y-hidden hidden-scrollbar"
          triggerClassName="shrink-0"
        />

        {period === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              max={to || undefined}
              className="w-full sm:w-40"
              onChange={(e) => setParam("from", e.target.value, !e.target.value)}
            />
            <span className="shrink-0 text-sm text-gray-400">—</span>
            <Input
              type="date"
              value={to}
              min={from || undefined}
              className="w-full sm:w-40"
              onChange={(e) => setParam("to", e.target.value, !e.target.value)}
            />
          </div>
        )}

        {/* Hisoblangan oraliq — preset tanlanganda ham ko'rinib turadi:
            "12 oy" degan yorliq qaysi sanalarni qamraganini aytmaydi */}
        {range && period !== "custom" && (
          <p className="text-xs text-gray-400 sm:ml-auto">
            {range.from ? formatDateUz(range.from) : "boshidan"} —{" "}
            {formatDateUz(range.to)}
          </p>
        )}
      </div>

      {/* Qidiruv va sabab */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={searchInput}
          className="sm:flex-1"
          placeholder="O'quvchi ismi, familiyasi yoki username bo'yicha qidirish..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select
          value={reason}
          options={DEPARTURE_REASON_FILTER}
          placeholder="Sabab tanlang"
          onChange={(value) => setParam("reason", value, !value || value === "all")}
          triggerClassName="w-full sm:w-56 sm:shrink-0"
        />

        {hasFilters && (
          <Button
            variant="outline"
            onClick={resetFilters}
            className="shrink-0 gap-1.5"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Tozalash
          </Button>
        )}
      </div>

      {isError ? (
        <Card>
          <EmptyState
            icon={UserMinus}
            title="Ro'yxatni yuklab bo'lmadi"
            description="Internet aloqasini tekshirib, qayta urinib ko'ring."
            action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
          />
        </Card>
      ) : (
        <>
          {/* Kesimlar */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TotalCard
              stats={stats}
              isLoading={isLoading}
              reasonLabel={
                DEPARTURE_REASON_FILTER.find((item) => item.value === reason)
                  ?.label
              }
              isFiltered={reason !== "all"}
            />

            <div className="lg:col-span-2">
              <DepartureReasonBreakdown
                byReason={stats?.byReason ?? []}
                // ⚠️ Maxraj — FILTRDAN TASHQARI jami (`reasonTotal`): sabab
                // tanlanganda ulushlar 100% ga "sakrab" ketmasligi kerak
                total={stats?.reasonTotal ?? 0}
                activeReason={reason}
                onSelect={(value) =>
                  setParam("reason", value, !value || value === "all")
                }
                isLoading={isLoading}
              />
            </div>
          </div>

          <DepartureTrendCard byMonth={data?.byMonth ?? []} isLoading={isLoading} />

          {/* Ro'yxat */}
          {isLoading ? (
            <Card className="space-y-3">
              {[0, 1, 2, 3, 4, 5].map((key) => (
                <Skeleton key={key} className="h-10 w-full" />
              ))}
            </Card>
          ) : rows.length === 0 ? (
            <Card>
              <EmptyState
                icon={UserMinus}
                title="Bu davrda ketgan o'quvchi yo'q"
                description={
                  hasFilters
                    ? "Davrni kengaytirib yoki filtrlarni tozalab ko'ring."
                    : "O'quvchining o'qish davri yopilganda u sababi bilan shu yerda ko'rinadi."
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Filtrlarni tozalash
                    </Button>
                  ) : null
                }
              />
            </Card>
          ) : (
            <div
              className={cn(
                "space-y-4 transition-opacity",
                isPlaceholderData && "opacity-60",
              )}
            >
              <Table columns={DEPARTURE_COLUMNS}>
                {rows.map((row, index) => (
                  <DepartureTableRow
                    key={row.id}
                    row={row}
                    index={offset + index + 1}
                  />
                ))}
              </Table>

              {pagination?.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={goToPage}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * JAMI — ketishlar soni va UNDAN FARQ QILADIGAN o'quvchilar soni.
 *
 * ⚠️ IKKI RAQAM, ikkalasi ham ko'rsatiladi: bir o'quvchi ketib, qaytib,
 * yana ketgan bo'lishi mumkin — faqat bittasini chiqarish "27 o'quvchi
 * ketdi" degan yolg'on raqamni berardi (`certificates` statistikasidagi
 * AYNI qoida).
 */
const TotalCard = ({ stats, isLoading, reasonLabel, isFiltered }) => (
  // `flex flex-col` + `mt-auto`: yonidagi kesim kartasi balandroq va
  // pastdagi bo'sh joy tasodifiy emas, tuzilma bo'lib ko'rinsin
  <Card className="flex h-full flex-col gap-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <UserMinus className="size-5" strokeWidth={1.5} />
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-14" />
      ) : (
        <Counter
          value={stats?.total ?? 0}
          className="text-3xl font-bold tabular-nums text-gray-900"
        />
      )}
    </div>

    <div>
      <p className="text-sm font-medium text-gray-900">Jami ketish holati</p>
      <p className="mt-0.5 text-xs text-gray-500">
        {isFiltered
          ? `Tanlangan davrda: ${reasonLabel}`
          : "Tanlangan davrda yopilgan o'qish davrlari"}
      </p>
    </div>

    <ul className="mt-auto space-y-2 border-t border-gray-100 pt-3 text-xs">
      <li className="flex items-center gap-2">
        <Users className="size-3.5 shrink-0 text-gray-400" strokeWidth={1.75} />
        <span className="flex-1 text-gray-600">O&apos;quvchilar soni</span>
        <span className="font-semibold tabular-nums text-gray-900">
          {stats?.studentCount ?? 0}
        </span>
      </li>
      <li className="flex items-center gap-2">
        <RotateCcw
          className="size-3.5 shrink-0 text-gray-400"
          strokeWidth={1.75}
        />
        <span className="flex-1 text-gray-600">Keyin qaytib kelgan</span>
        <span className="font-semibold tabular-nums text-gray-900">
          {stats?.returnedCount ?? 0}
        </span>
      </li>
    </ul>
  </Card>
);

/** Registr qatori — sabab IZOHI bilan (toifa faqat kesim uchun). */
const DepartureTableRow = ({ row, index }) => {
  const tone = toneOfReason(row.endReason);
  const state = departureStateOf(row);
  const note = row.reason || row.note;

  return (
    <Tr>
      <Td className="text-gray-500">{index}</Td>

      {/* O'quvchi */}
      <Td>
        <Link
          to={`/users/${row.studentId}?tab=enrollment`}
          className="font-medium text-gray-900 hover:text-blue-600"
        >
          {studentNameOf(row.student)}
        </Link>
        {row.student?.username && (
          <p className="text-xs text-gray-400">@{row.student.username}</p>
        )}
      </Td>

      {/* Sinf — KETGAN PAYTDAGI (hisob-faktura muhridan). Arxivlash
          o'quvchini sinflardan chiqaradi, ya'ni joriy a'zolik bo'sh bo'ladi */}
      <Td className="text-gray-700">
        {row.className ?? <span className="text-gray-400">—</span>}
        {row.classSource === "current" && (
          <p className="text-xs text-gray-400">hozirgi sinfi</p>
        )}
      </Td>

      {/* Qachon */}
      <Td className="text-gray-700">
        {formatDateUz(row.endDate)}
        <p className="text-xs text-gray-400">
          {formatDateUz(row.startDate)} dan
        </p>
      </Td>

      {/* Nega */}
      <Td nowrap={false} className="min-w-56 max-w-md">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            tone.chip,
          )}
        >
          {row.endReasonLabel ?? "Sabab ko'rsatilmagan"}
        </span>

        {note && (
          <p className="mt-1 whitespace-pre-line break-words text-xs text-gray-600">
            {note}
          </p>
        )}
      </Td>

      <Td className="text-gray-700">{formatDayCount(row.studiedDays)}</Td>

      {/* Hozirgi holati */}
      <Td>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            state.className,
          )}
        >
          {state.label}
        </span>
        {row.returnedAt && (
          <p className="text-xs text-gray-400">
            {formatDateUz(row.returnedAt)} da qaytgan
          </p>
        )}
      </Td>
    </Tr>
  );
};

export default DeparturesPage;
