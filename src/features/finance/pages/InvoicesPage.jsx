// React
import { useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { Ban, RotateCcw, Sparkles, Wallet } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import GenerateInvoicesModal from "../components/GenerateInvoicesModal";
import RecordPaymentModal from "../components/RecordPaymentModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, buildMonthOptions, formatMonthKey } from "@/shared/helpers/month.helpers";

// Data & queries
import {
  INVOICE_STATUS_META,
  INVOICE_STATUS_OPTIONS,
  INVOICE_TABLE_COLUMNS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { useCancelInvoice, useRestoreInvoice } from "../queries/finance.mutations";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

const InvoicesPage = () => {
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
  const totals = data?.totals;

  const { mutate: cancelInvoice } = useCancelInvoice();
  const { mutate: restoreInvoice } = useRestoreInvoice();

  const handleCancel = (invoice) => {
    const reason = prompt("Bekor qilish sababi:");
    if (!reason?.trim()) return;

    cancelInvoice(
      { id: invoice.id, reason },
      {
        onSuccess: () => toast.success("Hisob-faktura bekor qilindi"),
        // To'lov qilingan majburiyatni server rad etadi — sababi ko'rsatiladi
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const handleRestore = (invoice) => {
    if (!confirm("Hisob-fakturani qaytarasizmi?")) return;

    restoreInvoice(invoice.id, {
      onSuccess: () => toast.success("Hisob-faktura qaytarildi"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center flex-wrap gap-2">
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

      {/* Yig'ma kartalar */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-gray-500">Jami hisoblangan</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {formatMoney(summary.totals.amount)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {summary.counts.invoiced} ta majburiyat
            </p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500">To'langan</p>
            <p className="mt-1 text-xl font-semibold text-green-600">
              {formatMoney(summary.totals.paid)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {summary.counts.paid} ta to'liq to'langan
            </p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500">Qarz</p>
            <p className="mt-1 text-xl font-semibold text-red-600">
              {formatMoney(summary.totals.debt)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {summary.counts.unpaid + summary.counts.partial} ta to'lanmagan
            </p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500">O'quv yili</p>
            {summary.isAcademicMonth ? (
              <>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {summary.academicIndex}-oy
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {summary.academicYearLabel} · {summary.academicMonthCount} oylik
                </p>
              </>
            ) : (
              // Yozgi tanaffus: bu oyda majburiyat shakllanmaydi
              <p className="mt-1 text-sm text-gray-500">
                {formatMonthKey(summary.month)} akademik oy emas
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : invoices.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">
            Bu oy uchun hisob-faktura topilmadi
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {INVOICE_TABLE_COLUMNS.map((column, index) => (
                  <th
                    key={column || index}
                    className="px-4 py-3 text-left text-white font-medium whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => {
                const badge = INVOICE_STATUS_META[invoice.status];
                const isCancelled = invoice.status === "cancelled";

                return (
                  <tr key={invoice.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {invoice.studentName}
                      </p>
                      {/* Snapshot: o'quvchi arxivlangan bo'lsa ham sinfi ko'rinadi */}
                      {invoice.studentSnapshot?.className && (
                        <p className="text-xs text-gray-500">
                          {invoice.studentSnapshot.className}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {invoice.tariffName || "—"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {formatMoney(invoice.amount)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-green-600">
                      {formatMoney(invoice.paidAmount)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {isCancelled ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className="font-medium text-red-600">
                          {formatMoney(invoice.debt)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!isCancelled && invoice.status !== "paid" && (
                          <Can do="finance.pay">
                            <button
                              title="To'lov qabul qilish"
                              onClick={() =>
                                openModal("recordPayment", { invoice })
                              }
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600"
                            >
                              <Wallet className="size-3.5" />
                            </button>
                          </Can>
                        )}

                        {isCancelled ? (
                          <Can do="finance.adjust">
                            <button
                              title="Qaytarish"
                              onClick={() => handleRestore(invoice)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          </Can>
                        ) : (
                          <Can do="finance.cancel">
                            <button
                              title="Bekor qilish"
                              onClick={() => handleCancel(invoice)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            >
                              <Ban className="size-3.5" />
                            </button>
                          </Can>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totals && invoices.length > 0 && (
        <p className="text-xs text-gray-500">
          Filtr bo'yicha jami: {formatMoney(totals.totalAmount)} · to'langan{" "}
          {formatMoney(totals.totalPaid)} · qarz {formatMoney(totals.totalDebt)}
        </p>
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
      <RecordPaymentModal />
    </div>
  );
};

export default InvoicesPage;
