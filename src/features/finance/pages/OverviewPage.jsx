// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  ChevronRight,
  Gift,
  Minus,
  PiggyBank,
  Receipt,
  RefreshCw,
  School,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import ReasonModal from "../components/ReasonModal";
import GenerateInvoicesModal from "../components/GenerateInvoicesModal";
import BulkMonthOverrideModal from "../components/BulkMonthOverrideModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
// ⚠️ O'zgarish strelkasining rangi va matni MOLIYA DASHBOARDIDAN olinadi:
// bir bo'limda "+12%" ikki xil ko'rinishda va ikki xil rangda bo'lmasligi kerak.
import {
  formatChange,
  trendTone,
} from "@/features/financeDashboard/data/financeDashboard.data";
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Data & queries
import { GENERATE_BLOCKED_LABELS } from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import {
  useCancelInvoiceMonth,
  useRegenerateInvoiceMonth,
} from "../queries/finance.mutations";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/**
 * MOLIYA BOSH SAHIFASI.
 *
 * Bitta ekranda maktabning oylik moliyaviy manzarasi: nechta o'quvchi bor,
 * nechtasi grant (bepul), nechtasi to'laydi; qancha hisoblandi/yig'ildi/qarz;
 * sinf va yo'nalish (maktab/bog'cha/o'quv markazi) kesimi. Sinfni bosganda
 * o'sha sinfning to'liq moliyaviy sahifasiga o'tiladi.
 *
 * ⚠️ Bu yerda BITTALAB o'quvchi ro'yxati YO'Q — u sinf sahifasida. Ilgari bu
 * ekran faqat hisob-fakturasi bor o'quvchini ko'rsatib, grantdagilar (0 so'm)
 * umuman ko'rinmasdi.
 */
const OverviewPage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonthKey);

  const { data: dashboard } = useQuery(financeQueries.overviewDashboard(month));
  const { data: summary } = useQuery(financeQueries.invoiceSummary(month));
  const { data: report } = useQuery(financeQueries.accountReport({}));

  const { mutate: cancelMonth } = useCancelInvoiceMonth();
  const { mutate: regenerateMonth } = useRegenerateInvoiceMonth();

  const counts = dashboard?.counts;
  const byClass = dashboard?.byClass ?? [];
  const byDirection = dashboard?.byDirection ?? [];
  const invoiceCount = summary?.counts?.invoiced ?? 0;

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  // ── OY DARAJASIDAGI AMALLAR (butun oyga) ──────
  const askRegenerateMonth = () =>
    openModal("financeReason", {
      description: `${summary?.monthLabel ?? ""} oyining barcha hisob-fakturasi joriy tarif va chegirmalar bo'yicha qaytadan hisoblanadi.`,
      consequences: [
        "Tarifni o'zgartirgandan keyin summalar shu tugma bilan yangilanadi",
        "To'lov tushgan hisob-fakturalar o'zgarmaydi — ular chetda qoladi",
        "Bekor qilinganlariga tegilmaydi",
      ],
      confirmLabel: "Qayta shakllantirish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        regenerateMonth(
          { month, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success(
                `${result.done} ta hisob-faktura qayta shakllantirildi` +
                  (result.skipped?.length
                    ? `, ${result.skipped.length} tasi o'tkazib yuborildi (to'lov tushgan)`
                    : ""),
                {
                  description: `Jami: ${formatMoney(result.amountBefore)} → ${formatMoney(result.amountAfter)}`,
                },
              );
              result?.failed?.forEach((f) =>
                toast.error(`${f.studentName}: ${f.reason}`),
              );
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  const askCancelMonth = () =>
    openModal("financeReason", {
      description: `${summary?.monthLabel ?? ""} oyining BARCHA hisob-fakturasi bekor qilinadi.`,
      warning:
        "Bu oyda qarz umuman qolmaydi. O'quvchilar, tariflar va to'lov turlari joyida qoladi. To'lov tushgan bo'lsa, pul o'quvchining depozitiga qaytadi.",
      confirmLabel: "Qarzlarni tozalash",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        cancelMonth(
          { month, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success(`${result.done} ta hisob-faktura bekor qilindi`);
              result?.warnings?.forEach((w) => toast.warning(w));
              result?.failed?.forEach((f) =>
                toast.error(`${f.studentName}: ${f.reason}`),
              );
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  const openClass = (row) => {
    if (!row.classId) return; // "Sinfsiz" — bosib bo'lmaydi
    navigate(`/finance/main/classes/${row.classId}?month=${month}`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={String(month)}
            triggerClassName="min-w-40"
            options={MONTH_OPTIONS}
            onChange={(v) => setMonth(Number(v))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {invoiceCount > 0 && (
            <>
              <Can do="finance.adjust">
                <Button variant="outline" onClick={askRegenerateMonth}>
                  <RefreshCw />
                  Oyni qayta shakllantirish
                </Button>
              </Can>

              <Can do="finance.cancel">
                <Button variant="outline" onClick={askCancelMonth}>
                  <Ban />
                  Qarzlarni tozalash
                </Button>
              </Can>
            </>
          )}

          <Can do="finance.adjust">
            <Button
              variant="outline"
              onClick={() => openModal("bulkMonthOverride", { month })}
            >
              <SlidersHorizontal />
              Ommaviy oy summasi
            </Button>
          </Can>

          <Can do="finance.generate">
            <Button
              disabled={!summary?.canGenerate}
              onClick={() => openModal("generateInvoices", { month, summary })}
            >
              <Sparkles />
              Shakllantirish
            </Button>
          </Can>
        </div>
      </div>

      {/* Nima uchun shakllantirib bo'lmaydi — jim qolmasin */}
      {summary && !summary.canGenerate && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {summary.monthLabel}:{" "}
          {GENERATE_BLOCKED_LABELS[summary.blockedReason] ??
            "hisob-faktura shakllantirilmaydi"}
        </p>
      )}

      {/* ── O'QUVCHILAR SANOG'I: jami / grant / to'lovchi ── */}
      {counts && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Users}
            accent="bg-slate-600"
            label="Jami o'quvchi"
            value={String(counts.totalStudents)}
            hint="Arxivlanmagan, faol o'quvchilar"
          />
          <SummaryCard
            icon={Gift}
            accent="bg-purple-500"
            label="Grant (bepul)"
            value={String(counts.grantStudents)}
            valueClassName="text-purple-700"
            hint="Homiylik/grant chegirmasi bilan"
          />
          <SummaryCard
            icon={Wallet}
            accent="bg-blue-500"
            label="To'lovchi"
            value={String(counts.payingStudents)}
            valueClassName="text-blue-700"
            hint="Oylik to'lov qiladigan o'quvchilar"
          />
        </div>
      )}

      {/* ── PUL: hisoblangan / yig'ilgan / qarz / depozit ── */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Receipt}
            accent="bg-blue-500"
            label="Hisoblangan"
            value={formatMoney(summary.totals.amount)}
            compare={{
              label: summary.compareMonthLabel,
              previous: summary.previous?.amount,
              change: summary.change?.amount,
            }}
            hint={`${summary.counts.invoiced} ta majburiyat`}
          />

          <SummaryCard
            icon={Wallet}
            accent="bg-green-500"
            label="Yig'ilgan"
            value={formatMoney(summary.totals.paid)}
            valueClassName="text-green-700"
            hint={`${summary.counts.paid} ta to'liq yopilgan`}
            compare={{
              label: summary.compareMonthLabel,
              previous: summary.previous?.paid,
              change: summary.change?.paid,
            }}
          />

          <SummaryCard
            icon={TrendingDown}
            accent="bg-rose-500"
            label="Qarz"
            value={formatMoney(summary.totals.debt)}
            valueClassName="text-red-600"
            hint={`${summary.counts.unpaid + summary.counts.partial} ta to'lanmagan`}
            compare={{
              label: summary.compareMonthLabel,
              previous: summary.previous?.debt,
              change: summary.change?.debt,
              inverse: true,
            }}
          />

          <SummaryCard
            icon={PiggyBank}
            accent="bg-indigo-500"
            label="Depozitda"
            value={formatMoney(summary.totals.deposits)}
            valueClassName="text-indigo-700"
            hint="Oldindan to'langan, keyingi oylarga o'tadi"
          />
        </div>
      )}

      {/* ── SINF VA YO'NALISH KESIMI ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sinflar — bosiladigan (sinf sahifasiga o'tadi) */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 lg:col-span-2">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Sinflar bo'yicha</h2>
          </div>
          {byClass.length === 0 ? (
            <EmptyState
              icon={School}
              title="Ma'lumot yo'q"
              description="Bu oy uchun o'quvchi yoki hisob-faktura topilmadi."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-4 py-2.5 font-medium">Sinf</th>
                    <th className="px-4 py-2.5 text-center font-medium">O'quvchi</th>
                    <th className="px-4 py-2.5 text-right font-medium">Yig'ilgan</th>
                    <th className="px-4 py-2.5 text-right font-medium">Qarz</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {byClass.map((row) => (
                    <tr
                      key={row.classId ?? "__none__"}
                      onClick={() => openClass(row)}
                      className={cn(
                        "border-b border-gray-50 last:border-0",
                        row.classId
                          ? "cursor-pointer hover:bg-gray-50"
                          : "opacity-70",
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        {row.className}
                      </td>
                      <td className="px-4 py-2.5 text-center text-gray-600">
                        {row.studentCount}
                        {row.grantCount > 0 && (
                          <span className="ml-1.5 rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                            {row.grantCount} grant
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-green-700">
                        {formatMoney(row.collected)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-red-600">
                        {formatMoney(row.debt)}
                      </td>
                      <td className="px-2 text-gray-300">
                        {row.classId && <ChevronRight className="size-4" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Yo'nalishlar — maktab / bog'cha / o'quv markazi bo'yicha daromad */}
        <Card title="Yo'nalishlar bo'yicha daromad" className="space-y-3">
          {byDirection.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Yo'nalish bo'yicha ma'lumot yo'q
            </p>
          ) : (
            <div className="space-y-3">
              {byDirection.map((dir) => (
                <div key={dir.directionName} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate text-gray-700">
                      {dir.directionName}
                    </span>
                    <span className="shrink-0 font-medium text-green-700">
                      {formatMoney(dir.collected)}
                    </span>
                  </div>
                  {/* Kutilgandan qancha yig'ilgani — ingichka progress */}
                  <DirectionBar collected={dir.collected} expected={dir.expected} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* To'lov turlari bo'yicha qoldiq */}
      {report?.items?.length > 0 && (
        <Card title="To'lov turlari" className="space-y-2">
          {report.items.map((account) => (
            <div key={account.id} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-gray-700">
                {account.name}
              </span>
              <span className="w-32 shrink-0 text-right font-medium text-gray-900">
                {formatMoney(account.balance)}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-3 border-t border-gray-100 pt-2 text-sm">
            <span className="min-w-0 flex-1 font-medium text-gray-900">Jami</span>
            <span className="w-32 shrink-0 text-right font-semibold text-gray-900">
              {formatMoney(report.totals.balance)}
            </span>
          </div>
        </Card>
      )}

      {/* Modals */}
      <GenerateInvoicesModal />
      <BulkMonthOverrideModal />
      <ReasonModal />
    </div>
  );
};

/** Yo'nalish uchun "yig'ilgan / kutilgan" nisbatini ko'rsatuvchi ingichka chiziq. */
const DirectionBar = ({ collected, expected }) => {
  const exp = Number(expected) || 0;
  const col = Number(collected) || 0;
  const pct = exp > 0 ? Math.min(100, Math.round((col / exp) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-green-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right text-[11px] text-gray-400">
        {formatMoney(expected)} kutilgan
      </span>
    </div>
  );
};

/**
 * Yig'ma karta — rangli ikona, katta raqam va ostida izoh. Moliya
 * dashboardidagi KPI qatori bilan bir xil shakl.
 */
const SummaryCard = ({
  icon: Icon,
  accent,
  label,
  value,
  hint,
  valueClassName,
  compare,
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5">
    <div className={cn("absolute -right-7 -top-7 size-24 rounded-full opacity-10", accent)} />

    <div className="relative flex items-start justify-between gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
          accent,
        )}
      >
        <Icon className="size-[18px]" />
      </span>
    </div>

    <p
      className={cn(
        "relative mt-3 text-[22px] font-bold leading-tight tracking-tight text-gray-900",
        valueClassName,
      )}
    >
      {value}
    </p>

    {hint && <p className="relative mt-1.5 text-[11px] text-gray-400">{hint}</p>}

    {compare?.previous != null && (
      <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
        <span className="truncate text-gray-400">
          {compare.label}: {formatMoney(compare.previous)}
        </span>
        <Delta change={compare.change} inverse={compare.inverse} />
      </div>
    )}
  </div>
);

/** O'tgan oyga nisbatan o'zgarish — strelka va foiz. */
const Delta = ({ change, inverse }) => {
  if (change == null) return null;

  const tone = trendTone(change, { inverse });
  const Icon =
    tone.direction === "up"
      ? ArrowUpRight
      : tone.direction === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5 font-medium", tone.className)}>
      <Icon className="size-3.5 shrink-0" />
      {formatChange(change)}
    </span>
  );
};

export default OverviewPage;
