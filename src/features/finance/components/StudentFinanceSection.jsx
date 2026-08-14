// Toast
import { toast } from "sonner";

// Icons
import { Repeat, Trash2, UserCog, Wallet } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link } from "react-router-dom";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import ChangeStudentTariffModal from "./ChangeStudentTariffModal";
import RecordPaymentModal from "./RecordPaymentModal";
import StudentFinanceStatusModal from "./StudentFinanceStatusModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthKey,
  formatMonthRange,
} from "@/shared/helpers/month.helpers";

// Data & queries
import { FINANCE_STATUS_META, INVOICE_STATUS_META } from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { useDeleteFinanceStatus } from "../queries/finance.mutations";

/**
 * Foydalanuvchi detal sahifasidagi "Moliya" bo'limi.
 *
 * Faqat `studentId` propini oladi va o'zi fetch qiladi — davomat bo'limidagi
 * `StudentAttendanceSummary` bilan bir xil naqsh. Shu tufayli `users` feature'i
 * moliyadan mutlaqo bexabar qoladi: modallar ham shu yerda mount qilinadi.
 */
const StudentFinanceSection = ({ studentId }) => {
  const { openModal } = useModal();
  const now = currentMonthKey();

  const { data: statusData } = useQuery(
    financeQueries.studentFinanceStatus(studentId),
  );
  const { data: tariffData } = useQuery(
    financeQueries.studentTariffHistory(studentId),
  );
  const { data: invoiceData, isLoading } = useQuery(
    financeQueries.studentInvoices(studentId),
  );

  const { mutate: deleteStatus } = useDeleteFinanceStatus();

  const statusBadge =
    FINANCE_STATUS_META[statusData?.currentStatus?.status ?? "active"];

  // Joriy oyni qamragan biriktirish — o'quvchining amaldagi tarifi
  const currentAssignment = (tariffData?.items ?? []).find(
    (item) => item.startMonth <= now && (item.endMonth == null || item.endMonth >= now),
  );

  const handleDeleteStatus = (row) => {
    if (!confirm("Holat yozuvini o'chirishni tasdiqlaysizmi?")) return;

    deleteStatus(row.id, {
      onSuccess: () => toast.success("Holat yozuvi o'chirildi"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-gray-900">Moliya</h2>

        <div className="flex items-center flex-wrap gap-2">
          <Can do="finance.status">
            <Button
              variant="secondary"
              onClick={() =>
                openModal("editStudentFinanceStatus", {
                  studentId,
                  currentStatus: statusData?.currentStatus,
                })
              }
            >
              <UserCog />
              Holatni o'zgartirish
            </Button>
          </Can>

          <Can do="tariffs.assign">
            {currentAssignment ? (
              <Button
                variant="secondary"
                onClick={() =>
                  openModal("changeStudentTariff", { assignment: currentAssignment })
                }
              >
                <Repeat />
                Tarifni almashtirish
              </Button>
            ) : (
              // Biriktirish tarif detalidan bajariladi — u yerda tarif allaqachon
              // tanlangan bo'ladi, bu yerda esa yana bir tanlov kerak bo'lardi
              <Button variant="secondary" asChild>
                <Link to="/finance/main/tariffs">
                  <Repeat />
                  Tarif biriktirish
                </Link>
              </Button>
            )}
          </Can>
        </div>
      </div>

      {/* Qisqacha */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-500">Moliyaviy holat</p>
          <span
            className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
          {statusData?.currentStatus?.startMonth != null && (
            <p className="mt-1 text-xs text-gray-500">
              {formatMonthRange(
                statusData.currentStatus.startMonth,
                statusData.currentStatus.endMonth,
              )}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-500">Joriy tarif</p>
          <p className="mt-1 font-medium text-gray-900">
            {currentAssignment?.tariff?.name ?? "Biriktirilmagan"}
          </p>
          {currentAssignment?.resolvedAmount && (
            <p className="mt-0.5 text-xs text-gray-500">
              {formatMoney(currentAssignment.resolvedAmount)} / oy
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-500">
            {invoiceData?.academicYearLabel ?? "O'quv yili"} bo'yicha qarz
          </p>
          <p className="mt-1 text-xl font-semibold text-red-600">
            {formatMoney(invoiceData?.totals?.debt)}
          </p>
          {invoiceData?.totals && (
            <p className="mt-0.5 text-xs text-gray-500">
              Hisoblangan {formatMoney(invoiceData.totals.invoiced)} · to'langan{" "}
              {formatMoney(invoiceData.totals.paid)}
            </p>
          )}
        </div>
      </div>

      {/* Holat tarixi — faqat istisnolar yoziladi, shuning uchun odatda bo'sh */}
      {statusData?.items?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Holat tarixi</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <tbody>
                {statusData.items.map((row) => {
                  const badge = FINANCE_STATUS_META[row.status];
                  return (
                    <tr key={row.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {formatMonthRange(row.startMonth, row.endMonth)}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{row.reason || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        {/* Faqat hali boshlanmagan yozuvni o'chirsa bo'ladi */}
                        {row.startMonth > now && (
                          <Can do="finance.status">
                            <button
                              title="O'chirish"
                              onClick={() => handleDeleteStatus(row)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </Can>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hisob-fakturalar */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">
          Oylik majburiyatlar
          {invoiceData?.academicYearLabel ? ` — ${invoiceData.academicYearLabel}` : ""}
        </h3>

        {isLoading ? (
          <p className="py-4 text-center text-sm text-gray-500">Yuklanmoqda...</p>
        ) : (invoiceData?.invoices ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            Hali majburiyat shakllantirilmagan
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <tbody>
                {invoiceData.invoices.map((invoice) => {
                  const badge = INVOICE_STATUS_META[invoice.status];
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-3 py-2 whitespace-nowrap font-medium">
                        {formatMonthKey(invoice.month)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatMoney(invoice.amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-green-600">
                        {formatMoney(invoice.paidAmount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {invoice.status !== "paid" &&
                          invoice.status !== "cancelled" && (
                            <Can do="finance.pay">
                              <button
                                title="To'lov qabul qilish"
                                onClick={() => openModal("recordPayment", { invoice })}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600"
                              >
                                <Wallet className="size-3.5" />
                              </button>
                            </Can>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modallar shu bo'lim ichida — users feature'i moliyadan bexabar qoladi */}
      <ChangeStudentTariffModal />
      <RecordPaymentModal />
      <StudentFinanceStatusModal />
    </div>
  );
};

export default StudentFinanceSection;
