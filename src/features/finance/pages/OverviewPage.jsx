// React
import { useMemo, useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import {
  Ban,
  FileText,
  PiggyBank,
  Receipt,
  RotateCcw,
  Sparkles,
  RefreshCw,
  TrendingDown,
  Wallet,
} from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import ReasonModal from "../components/ReasonModal";
import GenerateInvoicesModal from "../components/GenerateInvoicesModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Data & queries
import {
  GENERATE_BLOCKED_LABELS,

  INVOICE_STATUS_OPTIONS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import {
  useCancelInvoice,
  useRegenerateInvoice,
  useRestoreInvoice,
} from "../queries/finance.mutations";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/**
 * Moliyaning oylik manzarasi.
 *
 * Bitta savolga javob beradi: "shu oyda qancha hisoblandi, qancha
 * yig'ildi, qancha qarz qoldi va pul qaysi turga tushdi?" Shu yerdan
 * majburiyat shakllantiriladi va o'sha oy hisob-fakturalari ko'riladi.
 */
const OverviewPage = () => {
  const { openModal } = useModal();
  const [month, setMonth] = useState(currentMonthKey);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const status = searchParams.get("status") || "all";
  const classId = searchParams.get("classId") || "";

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (value == null || value === "") prev.delete(key);
      else prev.set(key, String(value));
      if (key !== "page") prev.delete("page");
      return prev;
    });

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data: summary } = useQuery(financeQueries.invoiceSummary(month));
  const { data: report } = useQuery(financeQueries.accountReport({}));

  const { data, isLoading } = useQuery(
    financeQueries.invoiceList({
      page,
      limit: 24,
      month,
      ...(status !== "all" ? { status } : { includeCancelled: "true" }),
      ...(classId ? { classId } : {}),
    }),
  );

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  // ⚠️ TO'LOV TURI USTUNLARI DINAMIK. "Naqd" va "Plastik" — qotib qolgan
  // ro'yxat emas: to'lov turlari katalogdan keladi va maktab istalgan
  // vaqtda yangisini qo'shishi mumkin. Shuning uchun ustunlar ham
  // katalogdan quriladi.
  const accountColumns = useMemo(
    () => (report?.items ?? []).map((account) => ({ id: account.id, name: account.name })),
    [report],
  );

  const invoiceColumns = useMemo(
    () => [
      "O'quvchi",
      "Tarif",
      { label: "Summa", align: "right" },
      { label: "To'langan", align: "right" },
      ...accountColumns.map((account) => ({ label: account.name, align: "right" })),
      { label: "Qarz", align: "right" },
      "",
    ],
    [accountColumns],
  );

  const { mutate: cancelInvoice } = useCancelInvoice();
  const { mutate: restoreInvoice } = useRestoreInvoice();
  const { mutate: regenerateInvoice } = useRegenerateInvoice();

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const askCancel = (invoice) =>
    openModal("financeReason", {
      description: `${invoice.studentName} — ${invoice.monthLabel} hisob-fakturasi bekor qilinadi.`,
      consequences: [
        "Qarz ro'yxatidan chiqadi va hisobotlarga kirmaydi",
        Number(invoice.paidAmount) > 0
          ? `${formatMoney(invoice.paidAmount)} o'quvchining depozitiga qaytadi`
          : "Bu hisob-fakturaga to'lov tushmagan",
      ],
      confirmLabel: "Bekor qilish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        cancelInvoice(
          { id: invoice.id, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success("Hisob-faktura bekor qilindi");
              result?.warnings?.forEach((w) => toast.warning(w));
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  const askRegenerate = (invoice) =>
    openModal("financeReason", {
      description: `${invoice.studentName} — ${invoice.monthLabel} hisob-fakturasi joriy tarif va chegirmalar bo'yicha qaytadan hisoblanadi.`,
      warning:
        "Eski yozuv o'chiriladi va o'rniga yangisi yaratiladi. To'lov tushgan hisob-fakturani qayta shakllantirib bo'lmaydi.",
      confirmLabel: "Qayta shakllantirish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        regenerateInvoice(
          { id: invoice.id, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success(`Yangi summa: ${formatMoney(result.amount)}`);
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  const askRestore = (invoice) =>
    openModal("financeReason", {
      description: `${invoice.studentName} — ${invoice.monthLabel} hisob-fakturasi qaytariladi.`,
      label: "Izoh",
      confirmLabel: "Qaytarish",
      onConfirm: (_reason, { close, setIsLoading }) => {
        setIsLoading(true);
        restoreInvoice(invoice.id, {
          onSuccess: () => {
            close();
            toast.success("Hisob-faktura qaytarildi");
          },
          onError: handleError,
          onSettled: () => setIsLoading(false),
        });
      },
    });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(month)}
            triggerClassName="min-w-40"
            options={MONTH_OPTIONS}
            onChange={(v) => setMonth(Number(v))}
          />

          <Select
            value={status}
            triggerClassName="min-w-40"
            options={INVOICE_STATUS_OPTIONS}
            onChange={(v) => setParam("status", v)}
          />

          <SelectSearch
            value={classId}
            triggerClassName="min-w-44"
            placeholder="Barcha sinflar"
            onChange={(v) => setParam("classId", v)}
            options={classes.map((c) => ({ label: c.name, value: c.id }))}
          />
        </div>

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

      {/* Nima uchun shakllantirib bo'lmaydi — jim qolmasin */}
      {summary && !summary.canGenerate && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {summary.monthLabel}:{" "}
          {GENERATE_BLOCKED_LABELS[summary.blockedReason] ??
            "hisob-faktura shakllantirilmaydi"}
        </p>
      )}

      {/* Yig'ma kartalar — moliya dashboardidagi KPI qatori bilan bir xil
          shakl: rangli ikona, katta raqam, ostida izoh. Ikki ekranda ikki
          xil karta uslubi bo'lsa, ular boshqa modulga tegishlidek ko'rinardi */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Receipt}
            accent="bg-blue-500"
            label="Hisoblangan"
            value={formatMoney(summary.totals.amount)}
            hint={
              <>
                {summary.counts.invoiced} ta majburiyat
                {Number(summary.totals.discountAmount) > 0 &&
                  ` · ${formatMoney(summary.totals.discountAmount)} chegirma`}
                {/* Proratsiya farqi yorliqsiz g'oyib bo'lmasligi kerak:
                    baza − proratsiya − chegirma = summa */}
                {Number(summary.totals.prorationAmount) > 0 &&
                  ` · ${formatMoney(summary.totals.prorationAmount)} qisman oy`}
              </>
            }
          />

          <SummaryCard
            icon={Wallet}
            accent="bg-green-500"
            label="Yig'ilgan"
            value={formatMoney(summary.totals.paid)}
            valueClassName="text-green-700"
            hint={`${summary.counts.paid} ta to'liq yopilgan`}
          />

          <SummaryCard
            icon={TrendingDown}
            accent="bg-rose-500"
            label="Qarz"
            value={formatMoney(summary.totals.debt)}
            valueClassName="text-red-600"
            hint={`${summary.counts.unpaid + summary.counts.partial} ta to'lanmagan`}
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

      {/* Jadval */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : invoices.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={FileText}
            title="Bu oy uchun hisob-faktura yo'q"
            description={
              summary?.canGenerate
                ? "\"Shakllantirish\" tugmasi bilan oylik majburiyatlarni yarating."
                : "Filtrlarni o'zgartiring yoki boshqa oyni tanlang."
            }
          />
        </Card>
      ) : (
        <Table columns={invoiceColumns}>
          {invoices.map((invoice) => {

            const isCancelled = invoice.status === "cancelled";

            return (
              <Tr key={invoice.id}>
                <Td nowrap={false}>
                  <p className="font-medium text-gray-900">{invoice.studentName}</p>
                  {/* Snapshot: o'quvchi arxivlangan bo'lsa ham sinfi ko'rinadi */}
                  {invoice.studentSnapshot?.className && (
                    <p className="text-xs text-gray-500">
                      {invoice.studentSnapshot.className}
                    </p>
                  )}
                </Td>

                <Td className="text-gray-500">
                  {invoice.tariffName || "—"}
                  {invoice.hasDiscount && (
                    <span className="ml-1.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                      −{formatMoney(invoice.discountAmount)}
                    </span>
                  )}
                </Td>

                <Td align="right" className="font-medium">
                  {formatMoney(invoice.amount)}
                  {invoice.isProrated && (
                    <span className="block text-xs font-normal text-blue-600">
                      {invoice.prorationLabel}
                    </span>
                  )}
                </Td>

                <Td align="right" className="text-green-600">
                  {formatMoney(invoice.paidAmount)}
                </Td>

                {/* To'lov turi kesimi — qaysi puldan qanchasi kelgani.
                    Nol summa "0" emas, "—" bilan ko'rsatiladi: nol raqami
                    ustunni to'ldirib, ko'zni chalg'itardi */}
                {accountColumns.map((account) => {
                  const paid = invoice.paidByAccount?.find(
                    (row) => row.accountId === account.id,
                  );

                  return (
                    <Td key={account.id} align="right" className="text-gray-500">
                      {paid ? (
                        formatMoney(paid.amount, { withLabel: false })
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </Td>
                  );
                })}

                <Td align="right">
                  {isCancelled ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <span className="font-medium text-red-600">
                      {formatMoney(invoice.debt)}
                    </span>
                  )}
                </Td>


                <Td>
                  <div className="flex items-center justify-end gap-1">
                    {!isCancelled && Number(invoice.paidAmount) === 0 && (
                      <Can do="finance.adjust">
                        <button
                          title="Qayta shakllantirish"
                          onClick={() => askRegenerate(invoice)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <RefreshCw className="size-3.5" />
                        </button>
                      </Can>
                    )}

                    {isCancelled ? (
                      <Can do="finance.adjust">
                        <button
                          title="Qaytarish"
                          onClick={() => askRestore(invoice)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <RotateCcw className="size-3.5" />
                        </button>
                      </Can>
                    ) : (
                      <Can do="finance.cancel">
                        <button
                          title="Bekor qilish"
                          onClick={() => askCancel(invoice)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Ban className="size-3.5" />
                        </button>
                      </Can>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(next) => setParam("page", next)}
        />
      )}

      {/* Modals */}
      <GenerateInvoicesModal />
      <ReasonModal />
    </div>
  );
};

/**
 * Yig'ma karta — rangli ikona, katta raqam va ostida izoh.
 *
 * Moliya dashboardidagi KPI qatori bilan bir xil shakl: bir bo'limda ikki
 * xil karta uslubi bo'lsa, foydalanuvchi ular boshqa modulga tegishli deb
 * o'ylardi.
 */
const SummaryCard = ({ icon: Icon, accent, label, value, hint, valueClassName }) => (
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
  </div>
);

export default OverviewPage;
