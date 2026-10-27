// React
import { useMemo } from "react";

// Router
import { Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowRight, UserMinus } from "lucide-react";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries & data
import { enrollmentQueries } from "@/features/enrollment/queries/enrollment.queries";
import {
  departureDelta,
  studentNameOf,
  toneOfReason,
} from "@/features/enrollment/data/departures.data";
import { formatDayCount } from "@/features/enrollment/data/enrollment.data";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import EmptyState from "@/shared/components/ui/EmptyState";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz, formatMonthUz } from "@/shared/utils/date.utils";

/**
 * CHIQIB KETGAN O'QUVCHILAR — bosh sahifadagi blok.
 *
 * Rahbar uchun bu kunlik savol: "kim ketdi va NEGA ketdi". Javob
 * allaqachon tizimda bor edi (o'qish davri yopilganda sabab majburiy
 * tanlanadi), lekin u faqat O'QUVCHINING O'Z profilida ko'rinardi — ya'ni
 * savolni berish uchun avval javobni bilish kerak bo'lardi.
 *
 * ⚠️ IKKI BLOK, IKKI MA'NO: chap karta — RAQAM (aniq oyna: oxirgi 30 kun),
 * o'ng karta — SO'NGGI KETISHLAR (oynadan qat'i nazar, eng oxirgi 5 ta).
 * Ro'yxat ham oyna bilan cheklansa, hech kim ketmagan hafta blokni bo'sh
 * qoldirardi — holbuki "oxirgi kim ketdi" savoli har doim o'z javobiga ega.
 *
 * ⚠️ RUXSATSIZ UMUMAN CHIZILMAYDI (`enrollment.view`) — bosh sahifada
 * "ruxsatingiz yo'q" degan quti keraksiz shovqin (`BotActivityStats`
 * bilan AYNI qaror).
 */
const DepartedStudents = () => {
  const { can } = usePermissions();
  const allowed = can("enrollment.view");

  const { data, isLoading, isError } = useQuery({
    ...enrollmentQueries.departureSummary(),
    enabled: allowed,
  });

  /**
   * ⚠️ SARALASH MAJBURIY. Umumiy ko'rinishda javoblar filiallar bo'ylab
   * birlashtiriladi va ikkinchi filialning qatorlari ro'yxat OXIRIGA
   * ulanadi — saralanmasa "so'nggi ketishlar" aralashib ketardi
   * (`AttendanceTrendCard` dagi AYNI tuzoq).
   */
  const items = useMemo(() => {
    const rows = data?.items ?? [];
    return [...rows]
      .sort((a, b) => String(b.endDate).localeCompare(String(a.endDate)))
      .slice(0, 5);
  }, [data]);

  if (!allowed) return null;

  const total = data?.total ?? 0;
  const delta = departureDelta(total, data?.prevTotal);
  const byReason = (data?.byReason ?? []).filter((item) => item.count > 0);

  return (
    <section className="mb-4">
      {/* Sarlavha + "Batafsil" */}
      <div className="mb-2.5 flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">
            Chiqib ketgan o&apos;quvchilar
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Kim, qachon va nega maktabni tashlab ketdi
          </p>
        </div>

        <Link
          to="/departures"
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          Batafsil
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── RAQAM: oxirgi 30 kun ─────────────────────────────────── */}
        {/* `flex flex-col` + pastdagi `mt-auto`: yonidagi ro'yxat kartasi
            balandroq, shuning uchun bo'sh joy tasodifiy emas, tuzilma
            bo'lib ko'rinishi kerak */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <UserMinus className="size-5" strokeWidth={1.5} />
            </div>

            {isLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isError ? (
              <span className="text-3xl font-bold text-gray-300">—</span>
            ) : (
              <Counter
                value={total}
                className="text-3xl font-bold tabular-nums text-gray-900"
              />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              Oxirgi {data?.windowDays ?? 30} kunda ketgan
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Oldingi shuncha kunga nisbatan{" "}
              <span className={cn("font-semibold", delta.className)}>
                {delta.label}
              </span>
            </p>
          </div>

          {/* Joriy oy — kalendar oyi bo'yicha (oynadan alohida o'lchov) */}
          <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <span className="truncate text-xs text-gray-500">
              {formatMonthUz(data?.month, { fallback: "Joriy oy" })}
            </span>
            {isLoading ? (
              <Skeleton className="h-4 w-8" />
            ) : (
              <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                {data?.monthTotal ?? 0} ta
              </span>
            )}
          </div>

          {/* Sabablar kesimi — faqat nol bo'lmaganlari (karta qisqa
              bo'lishi kerak; to'liq to'rtta toifa "Batafsil" da) */}
          {byReason.length > 0 && (
            <ul className="mt-auto space-y-1.5 border-t border-gray-100 pt-3">
              {byReason.map((item) => (
                <li key={item.key} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      toneOfReason(item.key).bar,
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-gray-600">
                    {item.label}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-900">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Umumiy ko'rinishda: qaysi filialda qancha */}
          <BranchSplit data={data} path="total" to="/departures" />
        </Card>

        {/* ── SO'NGGI KETISHLAR ────────────────────────────────────── */}
        <Card className="flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              So&apos;nggi ketishlar
            </h3>
            {items.length > 0 && (
              <span className="shrink-0 text-xs text-gray-400">
                Sababi bilan
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="mt-3 space-y-3">
              {[0, 1, 2, 3, 4].map((key) => (
                <Skeleton key={key} className="h-11 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={UserMinus}
              className="py-8"
              title="Chiqib ketgan o'quvchi yo'q"
              description="O'quvchining o'qish davri yopilganda u sababi bilan shu yerda ko'rinadi."
            />
          ) : (
            <ul className="mt-1 divide-y divide-gray-100">
              {items.map((row) => (
                <li key={row.id}>
                  <DepartureRow row={row} />
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <Link
              to="/departures"
              className="mt-auto pt-3 text-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Hammasini ko&apos;rish
            </Link>
          )}
        </Card>
      </div>
    </section>
  );
};

/**
 * Bitta ketish — ism, sinf, sabab (toifa + izoh) va sana.
 *
 * Qator bosilsa o'quvchi profilining O'QISH DAVRI tabi ochiladi: "nega
 * ketdi" degan savolning davomi aynan o'sha yerda (davrlar tarixi,
 * hisob-faktura ta'siri), ya'ni ikkinchi oyna chizish keraksiz.
 */
const DepartureRow = ({ row }) => {
  const tone = toneOfReason(row.endReason);
  const note = row.reason || row.note;

  return (
    <Link
      to={`/users/${row.studentId}?tab=enrollment`}
      className="group -mx-2 flex flex-col gap-1.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-3"
    >
      {/* Kim */}
      <div className="min-w-0 sm:w-44 sm:shrink-0">
        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
          {studentNameOf(row.student)}
        </p>
        <p className="truncate text-xs text-gray-400">
          {row.className ? row.className : "sinfsiz"}
          {row.student?.username ? ` · @${row.student.username}` : ""}
        </p>
      </div>

      {/* Nega */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            tone.chip,
          )}
        >
          {row.endReasonLabel ?? "Sabab ko'rsatilmagan"}
        </span>

        {note && (
          <span className="min-w-0 truncate text-xs text-gray-500" title={note}>
            {note}
          </span>
        )}
      </div>

      {/* Qachon */}
      <div className="shrink-0 sm:text-right">
        <p className="text-xs font-medium text-gray-700">
          {formatDateUz(row.endDate)}
        </p>
        <p className="text-[11px] text-gray-400">
          {formatDayCount(row.studiedDays)} o&apos;qigan
        </p>
      </div>
    </Link>
  );
};

export default DepartedStudents;
