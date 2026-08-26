
// Toast
import { toast } from "sonner";

// Icons
import {
  BadgePercent,
  PiggyBank,
  Repeat,
  Scale,
  Trash2,
  Undo2,
  UserCog,
  Wallet,
} from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";

import ChangeStudentTariffModal from "./ChangeStudentTariffModal";
import RecordPaymentModal from "./RecordPaymentModal";
import StudentFinanceStatusModal from "./StudentFinanceStatusModal";
import AssignTariffModal from "./AssignTariffModal";
import AssignDiscountModal from "./AssignDiscountModal";
import {
  AdjustStudentBalanceModal,
  RefundDepositModal,
} from "./DepositModals";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUZ } from "@/shared/utils/date.utils";
import {
  currentMonthKey,
  formatMonthRange,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  FINANCE_STATUS_META,
  INVOICE_STATUS_META,
  MOVEMENT_TYPE_META,
  TIMELINE_SKIP_LABELS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import {
  useApplyDeposit,
  useDeleteFinanceStatus,
} from "../queries/finance.mutations";

/**
 * Foydalanuvchi detal sahifasidagi "Moliya" bo'limi.
 *
 * Faqat `studentId` propini oladi va o'zi fetch qiladi — davomat bo'limidagi
 * `UserAttendancePanel` bilan bir xil naqsh. Shu tufayli `users` feature'i
 * moliyadan mutlaqo bexabar qoladi: modallar ham shu yerda mount qilinadi.
 *
 * Bir ekranda to'rt savolga javob: qanchaga o'qiydi (tarif + chegirma),
 * qancha qarzi bor, depozitida qancha pul turibdi va o'sha pul qaysi
 * oylarga ketgan.
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
  const { data: discountData } = useQuery(
    financeQueries.studentDiscounts(studentId),
  );
  const { data: invoiceData, isLoading } = useQuery(
    financeQueries.studentInvoices(studentId),
  );
  const { data: movementData } = useQuery(
    financeQueries.studentMovements(studentId),
  );

  const { mutate: deleteStatus } = useDeleteFinanceStatus();
  const { mutate: applyDeposit } = useApplyDeposit();

  const statusBadge =
    FINANCE_STATUS_META[statusData?.currentStatus?.status ?? "active"];

  // Joriy oyni qamragan biriktirish — o'quvchining amaldagi tarifi
  const currentAssignment = (tariffData?.items ?? []).find(
    (item) => item.startMonth <= now && (item.endMonth == null || item.endMonth >= now),
  );

  const discounts = discountData?.current ?? [];
  const balance = invoiceData?.balance ?? "0.00";
  const hasBalance = Number(balance) > 0;

  // Qarz progressining maxraji — o'quvchida hozirga qadar KELGAN oylar.
  // Eski javoblarda `dueMonths` bo'lmasligi mumkin, shuning uchun zaxira.
  const dueMonths =
    invoiceData?.totals?.dueMonths ?? invoiceData?.totals?.enrolledMonths ?? 0;

  const student = {
    id: studentId,
    fullName: statusData?.student
      ? `${statusData.student.firstName} ${statusData.student.lastName ?? ""}`.trim()
      : "",
  };

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleDeleteStatus = (row) => {
    deleteStatus(row.id, {
      onSuccess: () => toast.success("Holat yozuvi o'chirildi"),
      onError: handleError,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">Moliya</h2>

        <div className="flex flex-wrap items-center gap-2">
          <Can do="finance.pay">
            <Button onClick={() => openModal("recordPayment", { student })}>
              <Wallet />
              To'lov qabul qilish
            </Button>
          </Can>

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
              Holat
            </Button>
          </Can>

          <Can do="discounts.assign">
            <Button
              variant="secondary"
              onClick={() => openModal("assignDiscount", { student })}
            >
              <BadgePercent />
              Chegirma
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
                Tarif
              </Button>
            ) : (
              // O'quvchi allaqachon ma'lum — oynada faqat tarif tanlanadi.
              // Ilgari bu yer tariflar sahifasiga havola edi va xodim
              // o'quvchini qaytadan qidirishga majbur bo'lardi.
              <Button
                variant="secondary"
                onClick={() => openModal("assignTariff", { student })}
              >
                <Repeat />
                Tarif biriktirish
              </Button>
            )}
          </Can>
        </div>
      </div>

      {/* Qisqacha */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-500">Moliyaviy holat</p>
          <span
            className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}
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

          {discounts.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {discounts.map((item) => (
                <span
                  key={item.id}
                  title={item.discount?.name}
                  className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                >
                  {item.discount?.valueLabel}
                </span>
              ))}
            </div>
          ) : (
            currentAssignment?.resolvedAmount && (
              <p className="mt-0.5 text-xs text-gray-500">
                {formatMoney(currentAssignment.resolvedAmount)} / oy
              </p>
            )
          )}
        </div>

        <div className="rounded-xl border border-gray-100 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-gray-500">Depozit</p>

            <div className="flex shrink-0 items-center gap-0.5">
              {hasBalance && (
                <Can do="finance.pay">
                  <button
                    title="Qarzlarga qo'llash"
                    onClick={() =>
                      applyDeposit(studentId, {
                        onSuccess: (result) =>
                          toast.success(
                            Number(result.applied) > 0
                              ? `${formatMoney(result.applied)} qarzlarga yechildi`
                              : "Qo'llash uchun ochiq qarz yo'q",
                          ),
                        onError: handleError,
                      })
                    }
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <PiggyBank className="size-3.5" />
                  </button>
                </Can>
              )}

              {hasBalance && (
                <Can do="finance.refund">
                  <button
                    title="Ota-onaga qaytarish"
                    onClick={() => openModal("refundDeposit", { student, balance })}
                    className="rounded-lg p-1 text-gray-400 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Undo2 className="size-3.5" />
                  </button>
                </Can>
              )}

              <Can do="finance.adjust">
                <button
                  title="Qoldiqni to'g'rilash"
                  onClick={() =>
                    openModal("adjustStudentBalance", { student, balance })
                  }
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Scale className="size-3.5" />
                </button>
              </Can>
            </div>
          </div>

          <p
            className={cn(
              "mt-1 text-xl font-semibold",
              hasBalance ? "text-blue-600" : "text-gray-400",
            )}
          >
            {formatMoney(balance)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Oldindan to'langan</p>
        </div>

        <div className="rounded-xl border border-gray-100 p-3">
          <p className="text-xs text-gray-500">
            Jami qarz
          </p>
          <p className="mt-1 text-xl font-semibold text-red-600">
            {formatMoney(invoiceData?.totals?.debt)}
          </p>
          {invoiceData?.totals && (
            <p className="mt-0.5 text-xs text-gray-500">
              {/* Maxraj — HOZIRGA QADAR KELGAN oylar. Kelgusi oylar sanalmaydi:
                  sentabrda boshlanadigan yil avgustda "0 / 9 oy" bo'lib,
                  o'quvchi 9 oy qarzdordek ko'rinardi. */}
              {dueMonths > 0
                ? `${invoiceData.totals.paidMonths} / ${dueMonths} oy to'langan`
                : "O'quv yili hali boshlanmagan"}
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
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
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
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
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

      {/* Oylar — ta'til oylari ham ko'rinadi */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-700">Oylik majburiyatlar</h3>

          {/* Oyna o'quvchining O'ZIDAN chiqadi: kelgan oyidan hozirgacha.
              O'quv yili tushunchasi yo'q, shuning uchun tanlagich ham yo'q. */}
          {invoiceData?.fromMonthLabel && (
            <span className="text-xs text-gray-400">
              {invoiceData.fromMonthLabel} — {invoiceData.toMonthLabel}
            </span>
          )}
        </div>

        {isLoading ? (
          <p className="py-4 text-center text-sm text-gray-500">Yuklanmoqda...</p>
        ) : (invoiceData?.timeline ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            {/* Davri yo'q o'quvchida majburiyat HECH QACHON yozilmaydi —
                "shakllantirilmagan" desak, xodim bosishni kutib qolardi */}
            {invoiceData?.enrollment?.hasPeriods === false
              ? "O'qish davri kiritilmagan — majburiyat yozilmaydi. \"O'qish davrlari\" tabida davr qo'shing."
              : "Hali majburiyat shakllantirilmagan"}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <tbody>
                {invoiceData.timeline.map((row) => {
                  const invoice = row.invoice;
                  const badge = invoice ? INVOICE_STATUS_META[invoice.status] : null;

                  return (
                    <tr
                      key={row.month}
                      className={cn(
                        "border-b border-gray-50 last:border-0",
                        row.isVacation && "bg-amber-50/50",
                        // O'quvchi o'qimagan oy — jadvalda ko'rinadi, lekin
                        // "yetishmayotgan hisob-faktura" kabi ko'rinmasligi kerak
                        !row.isEnrolled && !row.isVacation && "opacity-50",
                      )}
                    >
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        {row.monthLabel}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        {row.isVacation ? (
                          <span className="text-xs text-amber-700">Ta'til</span>
                        ) : invoice ? (
                          <>
                            {formatMoney(invoice.amount)}
                            {invoice.isProrated && (
                              <span className="ml-1.5 text-xs text-blue-600">
                                {invoice.prorationLabel}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-green-600">
                        {invoice ? formatMoney(invoice.paidAmount) : ""}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        {badge ? (
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        ) : row.skipReason ? (
                          // "O'qimagan" va "ta'til" ni "shakllantirilmagan" dan
                          // ajratish shart: birinchisi qoida, ikkinchisi kamchilik
                          <span className="text-xs text-gray-400">
                            {TIMELINE_SKIP_LABELS[row.skipReason]}
                          </span>
                        ) : row.isFuture ? (
                          <span className="text-xs text-gray-400">Kelgusi oy</span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Shakllantirilmagan
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-right text-xs text-gray-400">
                        {/* Chek raqamlari — ota-ona telefon qilganda kerak */}
                        {invoice?.payments?.map((p) => p.receiptLabel).join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Depozit harakatlari */}
      {movementData?.items?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Depozit harakatlari</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <tbody>
                {movementData.items.slice(0, 20).map((item) => {
                  const meta = MOVEMENT_TYPE_META[item.type];
                  return (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                        {formatDateUZ(item.occurredAt)}
                      </td>
                      <td className={cn("px-3 py-2 whitespace-nowrap", meta?.className)}>
                        {meta?.label ?? item.label}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{item.description}</td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-medium whitespace-nowrap",
                          item.direction === "in" ? "text-green-600" : "text-gray-600",
                        )}
                      >
                        {item.direction === "in" ? "+" : "−"}
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modallar shu bo'lim ichida — users feature'i moliyadan bexabar qoladi */}
      <AssignTariffModal />
      <ChangeStudentTariffModal />
      <RecordPaymentModal />
      <StudentFinanceStatusModal />
      <AssignDiscountModal />
      <RefundDepositModal />
      <AdjustStudentBalanceModal />
    </div>
  );
};

export default StudentFinanceSection;
