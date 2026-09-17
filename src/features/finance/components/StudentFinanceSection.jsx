// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Router
import { Link, useNavigate } from "react-router-dom";

// Icons
import {
  BadgePercent,
  Ban,
  Check,
  Pencil,
  PiggyBank,
  Plus,
  Printer,
  Receipt,
  Repeat,
  Scale,
  SlidersHorizontal,
  Trash2,
  Undo2,
  UserCog,
  Wallet,
  X,
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
import AssignServiceModal from "./AssignServiceModal";
import AssignDiscountModal from "./AssignDiscountModal";
import MonthOverrideModal from "./MonthOverrideModal";
import EditPaymentModal from "./EditPaymentModal";
import EditAllocationModal from "./EditAllocationModal";
import ReasonModal from "./ReasonModal";
import {
  AdjustStudentBalanceModal,
  RefundDepositModal,
} from "./DepositModals";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";
import {
  currentMonthKey,
  prevMonthKey,
  formatMonthRange,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  DEPOSIT_HOLD_META,
  FINANCE_STATUS_META,
  INVOICE_STATUS_META,
  MOVEMENT_TYPE_META,
  OPEN_INVOICE_STATUSES,
  TIMELINE_SKIP_LABELS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import {
  useApplyDeposit,
  useDeleteFinanceStatus,
  useReleaseAllocation,
  useVoidPayment,
  useUpdateAssignment,
  useUpdateServiceAssignment,
  useDeleteServiceAssignment,
  useCloseServiceAssignment,
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
  const navigate = useNavigate();
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
  const { data: paymentsData } = useQuery(
    financeQueries.studentPayments(studentId),
  );

  const { mutate: deleteStatus } = useDeleteFinanceStatus();
  const { mutate: applyDeposit } = useApplyDeposit();
  const { mutate: voidPayment } = useVoidPayment();
  const { mutate: releaseAllocation } = useReleaseAllocation();

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

  // Shu oy majburiyati — o'quvchining joriy oy hisob-fakturasi (kartada)
  const currentEntry = (invoiceData?.timeline ?? []).find(
    (row) => row.month === invoiceData?.currentMonth,
  );
  const currentInvoice = currentEntry?.invoice ?? null;
  const currentAmount = currentInvoice ? Number(currentInvoice.amount) : 0;
  const currentPaid = currentInvoice ? Number(currentInvoice.paidAmount) : 0;
  const currentLeft = Math.max(0, currentAmount - currentPaid);
  const currentPct =
    currentAmount > 0 ? Math.min(100, Math.round((currentPaid / currentAmount) * 100)) : 0;

  const hasDebt = Number(invoiceData?.totals?.debt ?? 0) > 0;

  // Umumiy to'langan — o'quvchining barcha (bekor qilinmagan) to'lovlari yig'indisi
  const totalPaid = (paymentsData ?? []).reduce(
    (sum, p) => sum + Number(p.amount ?? 0),
    0,
  );

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

  // "To'lov qabul qilindi" → chekni bekor qilish (to'lovlar registridagi
  // AYNI amal: chekning barcha yechimlari qaytadi)
  const askVoidPayment = (item) =>
    openModal("financeReason", {
      description: `Chek ${item.receiptLabel} — ${formatMoney(item.amount)}`,
      consequences: [
        "Shu chekdan yechilgan barcha oylar qayta ochiladi",
        "Depozitda boshqa pul bo'lsa, qayta ochilgan oylar undan avtomat yopiladi",
        "Pul to'lov turidan chiqim sifatida qaytariladi",
      ],
      warning:
        "Qisman bekor qilish yo'q. Summa xato bo'lsa, \"Tahrirlash\" dan foydalaning.",
      confirmLabel: "Bekor qilish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        voidPayment(
          { id: item.paymentId, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success(
                Number(result.depositApplied) > 0
                  ? `To'lov bekor qilindi — ${formatMoney(result.depositApplied)} depozitdan yechildi`
                  : "To'lov bekor qilindi",
              );
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  // "Hisob-fakturaga yechildi" → yechimni olib tashlash
  const askReleaseAllocation = (item) =>
    openModal("financeReason", {
      description: `${item.description} — ${formatMoney(item.amount)}${
        item.receiptLabel ? ` (chek ${item.receiptLabel})` : ""
      }`,
      consequences: [
        `${item.description} oyidan shu summa olib tashlanadi — oy yana qarz bo'ladi`,
        "Pul depozitga qaytadi: avval boshqa ochiq qarzlarga yechiladi, qolgani depozitda turadi",
        `${item.description} oyiga depozitdan avtomat yechish to'xtatiladi`,
      ],
      warning:
        "Qayta yoqish uchun depozitdagi \"Qarzlarga qo'llash\" tugmasini bosing.",
      confirmLabel: "O'chirish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        releaseAllocation(
          { allocationId: item.allocationId, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success(
                Number(result.appliedToOthers) > 0
                  ? `Yechim o'chirildi — ${formatMoney(result.releasedToDeposit)} depozitga qaytdi, ` +
                      `${formatMoney(result.appliedToOthers)} boshqa oylarga yechildi`
                  : `Yechim o'chirildi — ${formatMoney(result.releasedToDeposit)} depozitga qaytdi`,
              );
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Moliya</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            O'quvchining moliyaviy holati va to'lovlarini boshqarish
          </p>
        </div>

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

          <Can do="services.assign">
            <Button
              variant="secondary"
              onClick={() => openModal("assignService", { student })}
            >
              <Plus />
              Xizmat
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
        {/* ── 1. JAMI QARZ — eng muhim raqam, urg'uli (qarz bo'lsa qizil
            chegara, yo'q bo'lsa yashil holat) ── */}
        <div
          className={cn(
            "rounded-xl border p-3.5",
            hasDebt ? "border-red-100 bg-red-50/30" : "border-green-100 bg-green-50/30",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Jami qarz
          </p>
          {hasDebt ? (
            <>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {formatMoney(invoiceData?.totals?.debt)}
              </p>
              {invoiceData?.totals?.hasServices && (
                <div className="mt-1.5 space-y-0.5 border-t border-red-100/60 pt-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Tarifdan</span>
                    <span className="font-medium text-gray-700">
                      {formatMoney(invoiceData.totals.debtTariff)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Xizmatlardan</span>
                    <span className="font-medium text-gray-700">
                      {formatMoney(invoiceData.totals.debtServices)}
                    </span>
                  </div>
                </div>
              )}
              {invoiceData?.totals && dueMonths > 0 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  {invoiceData.totals.paidMonths} / {dueMonths} oy to'langan
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-green-700">0 so'm</p>
              <p className="mt-1 text-xs text-gray-500">Qarz mavjud emas</p>
            </>
          )}

          {/* Umumiy to'langan — o'quvchi bo'yicha barcha to'lovlar yig'indisi */}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-200/60 pt-2 text-xs">
            <span className="text-gray-500">Jami to'langan</span>
            <span className="font-semibold text-green-700">
              {formatMoney(String(totalPaid))}
            </span>
          </div>
        </div>

        {/* ── 2. SHU OY — majburiyat, to'langani, qoldig'i va progress ── */}
        <div className="rounded-xl border border-gray-100 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Shu oy
          </p>
          {currentEntry?.isVacation ? (
            <p className="mt-1 text-2xl font-bold text-amber-600">Ta'til</p>
          ) : currentInvoice ? (
            <>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatMoney(currentInvoice.amount)}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="text-gray-500">
                  To'landi{" "}
                  <b className="font-semibold text-green-700">
                    {formatMoney(currentInvoice.paidAmount)}
                  </b>
                </span>
                {currentLeft > 0 && (
                  <span className="text-gray-500">
                    Qoldiq{" "}
                    <b className="font-semibold text-red-600">
                      {formatMoney(String(currentLeft))}
                    </b>
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      currentPct >= 100 ? "bg-green-500" : "bg-blue-500",
                    )}
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-400">{currentPct}%</span>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-gray-400">—</p>
              <p className="mt-1 text-xs text-gray-500">Hisob-faktura shakllanmagan</p>
            </>
          )}
        </div>

        {/* ── 3. DEPOZIT ── */}
        <div className="rounded-xl border border-gray-100 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Depozit
            </p>

            <div className="flex shrink-0 items-center gap-0.5">
              {hasBalance && (
                <Can do="finance.pay">
                  <button
                    title="Qarzlarga qo'llash (avtomat yechish to'xtatilgan oylar ham)"
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

        {/* ── 4. TARIF VA HOLAT ── */}
        <div className="rounded-xl border border-gray-100 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Tarif va holat
          </p>
          <p className="mt-1 text-base font-semibold text-gray-900">
            {currentAssignment?.tariff?.name ?? "Tarif biriktirilmagan"}
          </p>
          {currentAssignment?.resolvedAmount != null && (
            <p className="mt-0.5 text-xs text-gray-500">
              {formatMoney(currentAssignment.resolvedAmount)} / oy
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
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

        {/* Inline yig'ma — hisoblangan / to'langan / qarz bir qarashda */}
        {invoiceData?.totals && (invoiceData?.timeline ?? []).length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-xl bg-gray-50 px-3 py-2 text-xs">
            <span className="text-gray-500">
              Jami hisoblangan{" "}
              <b className="font-semibold text-gray-800">
                {formatMoney(invoiceData.totals.invoiced)}
              </b>
            </span>
            <span className="text-gray-500">
              To'langan{" "}
              <b className="font-semibold text-green-700">
                {formatMoney(invoiceData.totals.paid)}
              </b>
            </span>
            <span className="text-gray-500">
              Qarz{" "}
              <b className={cn("font-semibold", hasDebt ? "text-red-600" : "text-gray-700")}>
                {formatMoney(invoiceData.totals.debt)}
              </b>
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2 rounded-xl border border-gray-100 p-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
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
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-3 py-2 font-medium">Oy</th>
                  <th className="px-3 py-2 font-medium">Hisoblangan</th>
                  <th className="px-3 py-2 font-medium">To'langan</th>
                  <th className="px-3 py-2 font-medium">Holat</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {invoiceData.timeline.map((row) => {
                  const invoice = row.invoice;
                  const badge = invoice ? INVOICE_STATUS_META[invoice.status] : null;
                  const isCurrent = row.month === invoiceData?.currentMonth;

                  return (
                    <tr
                      key={row.month}
                      className={cn(
                        "border-b border-gray-50 last:border-0",
                        // Joriy oy — yengil ko'k fon + chap ko'rsatkich
                        isCurrent && "bg-blue-50/40",
                        row.isVacation && "bg-amber-50/50",
                        // O'quvchi o'qimagan oy — jadvalda ko'rinadi, lekin
                        // "yetishmayotgan hisob-faktura" kabi ko'rinmasligi kerak
                        !row.isEnrolled && !row.isVacation && "opacity-50",
                      )}
                    >
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        {row.monthLabel}
                        {isCurrent && (
                          <span className="ml-1.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            Joriy oy
                          </span>
                        )}
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
                            {invoice.overrideReasonLabel && (
                              <span
                                title={invoice.overrideNote || undefined}
                                className="ml-1.5 rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700"
                              >
                                {invoice.overrideReasonLabel}
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
                          <div className="flex flex-wrap items-center gap-1">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>

                            {/* Admin shu oydan yechimni olib qo'ygan — depozit
                                bor-u oy qarz bo'lib turgani shu sababdan */}
                            {invoice.depositHold &&
                              OPEN_INVOICE_STATUSES.includes(invoice.status) && (
                                <span
                                  title={DEPOSIT_HOLD_META.title}
                                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${DEPOSIT_HOLD_META.className}`}
                                >
                                  {DEPOSIT_HOLD_META.label}
                                </span>
                              )}
                          </div>
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

                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Chek raqamlari — ota-ona telefon qilganda kerak.
                              Bitta chek oyga ikki marta tushishi mumkin
                              (to'lovdan + keyin depozitdan) — takrorlanmasin */}
                          <span className="text-xs text-gray-400">
                            {[
                              ...new Set(
                                (invoice?.payments ?? []).map((p) => p.receiptLabel),
                              ),
                            ].join(", ")}
                          </span>

                          {/* Oy summasini sabab bilan o'zgartirish — faqat
                              o'qigan, ta'til bo'lmagan va o'tgan/joriy oy uchun */}
                          {row.isEnrolled && !row.isVacation && !row.isFuture && (
                            <Can do="finance.adjust">
                              <button
                                type="button"
                                title="Oy summasini o'zgartirish"
                                onClick={() =>
                                  openModal("monthOverride", {
                                    studentId,
                                    month: row.month,
                                    invoice,
                                    student,
                                  })
                                }
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              >
                                <SlidersHorizontal className="size-3.5" />
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
      </div>

      {/* Xizmatlar — tarif + qo'shimcha xizmatlar bitta jadvalda. Narxni
          shu yerda o'quvchiga INDIVIDUAL tahrirlash (faqat shu o'quvchiga
          ta'sir qiladi) va xizmatni o'chirish mumkin. */}
      <StudentChargesTable
        tariffAssignment={currentAssignment}
        tariffDebt={invoiceData?.totals?.debtTariff}
        services={invoiceData?.services ?? []}
        onError={handleError}
        navigate={navigate}
      />

      {/* To'lovlar tarixi — o'quvchining barcha (bekor qilinmagan) to'lovlari,
          har biri chek raqami, sanasi, summasi, to'lov turi va qaysi oylarga
          taqsimlangani bilan. Chek yangi oynada chop etiladi. */}
      {paymentsData && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Receipt className="size-4 text-gray-400" />
            To'lovlar tarixi
            {paymentsData.length > 0 && (
              <span className="text-xs font-normal text-gray-400">
                ({paymentsData.length} ta)
              </span>
            )}
          </h3>
          {paymentsData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-8 text-center">
              <Receipt className="size-6 text-gray-300" />
              <p className="text-sm text-gray-500">Hali to'lov qabul qilinmagan</p>
              <Can do="finance.pay">
                <Button
                  variant="outline"
                  onClick={() => openModal("recordPayment", { student })}
                >
                  <Wallet className="size-4" />
                  Birinchi to'lovni qabul qilish
                </Button>
              </Can>
            </div>
          ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-3 py-2 font-medium">Chek</th>
                  <th className="px-3 py-2 font-medium">Sana</th>
                  <th className="px-3 py-2 text-right font-medium">Summa</th>
                  <th className="px-3 py-2 font-medium">To'lov turi</th>
                  <th className="px-3 py-2 font-medium">Taqsimlandi</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {paymentsData.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                      {payment.receiptLabel}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                      {formatDateUz(payment.paidAt)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {payment.account?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {payment.allocations?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {payment.allocations.map((a) => (
                            <span
                              key={a.id}
                              className="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-700"
                            >
                              {a.monthLabel} · {formatMoney(a.amount)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-blue-600">Depozitga</span>
                      )}
                    </td>
                    <td className="px-2">
                      <Link
                        target="_blank"
                        to={`/finance/receipt/${payment.id}`}
                        title="Chekni chop etish"
                        className="inline-flex rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Printer className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

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
                        {formatDateUz(item.occurredAt)}
                      </td>
                      <td className={cn("px-3 py-2 whitespace-nowrap", meta?.className)}>
                        {meta?.label ?? item.label}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {item.description}
                        {/* Yechim qaysi chekdan va qanday tushgani — tahrirlashdan
                            oldin "bu qaysi pul" degan savolga javob */}
                        {item.type === "allocation" && item.receiptLabel && (
                          <span className="ml-1.5 text-xs text-gray-400">
                            Chek {item.receiptLabel} · {item.sourceLabel}
                          </span>
                        )}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-medium whitespace-nowrap",
                          item.direction === "in" ? "text-green-600" : "text-gray-600",
                        )}
                      >
                        {item.direction === "in" ? "+" : "−"}
                        {formatMoney(item.amount)}
                      </td>

                      <td className="w-px px-2 py-2 text-right whitespace-nowrap">
                        {/* To'lov — to'lovlar registridagi AYNI ruxsat va oynalar */}
                        {item.type === "payment" && item.payment && (
                          <Can do="finance.void">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                title="To'lovni tahrirlash"
                                onClick={() =>
                                  openModal("editPayment", { payment: item.payment })
                                }
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                title="To'lovni bekor qilish"
                                onClick={() => askVoidPayment(item)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Ban className="size-3.5" />
                              </button>
                            </div>
                          </Can>
                        )}

                        {/* Yechim — kassaga tegmaydi, lekin oy qarzini
                            o'zgartiradi: `finance.adjust` */}
                        {item.type === "allocation" && item.allocationId && (
                          <Can do="finance.adjust">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                title="Yechimni tahrirlash"
                                onClick={() =>
                                  openModal("editAllocation", { item, studentId })
                                }
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                title="Yechimni o'chirish"
                                onClick={() => askReleaseAllocation(item)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
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

      {/* Mobil: pastda doim ko'rinadigan "To'lov qabul qilish" tugmasi —
          scroll qilganda ham asosiy amal qo'l ostida turadi (§24). */}
      <Can do="finance.pay">
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:hidden">
          <Button
            className="w-full"
            onClick={() => openModal("recordPayment", { student })}
          >
            <Wallet />
            To'lov qabul qilish
          </Button>
        </div>
      </Can>

      {/* Modallar shu bo'lim ichida — users feature'i moliyadan bexabar qoladi */}
      <AssignTariffModal />
      <AssignServiceModal />
      <ChangeStudentTariffModal />
      <MonthOverrideModal />
      <RecordPaymentModal />
      <StudentFinanceStatusModal />
      <AssignDiscountModal />
      <RefundDepositModal />
      <AdjustStudentBalanceModal />
      <EditPaymentModal />
      <EditAllocationModal />
      <ReasonModal />
    </div>
  );
};

/**
 * XIZMATLAR jadvali — tarif + qo'shimcha xizmatlar bitta joyda.
 *
 * Narxni SHU YERDA (jadvalning o'zida) o'quvchiga INDIVIDUAL tahrirlash
 * mumkin (`customAmount`): faqat shu o'quvchiga ta'sir qiladi, katalog narxi
 * o'zgarmaydi. Qo'shimcha xizmatni o'chirsa ham bo'ladi (o'tgan oyni qamragan
 * biriktirma yopiladi, aks holda o'chiriladi). Server to'lanmagan fakturani
 * avtomatik qayta hisoblaydi.
 */
const StudentChargesTable = ({
  tariffAssignment,
  tariffDebt,
  services,
  onError,
  navigate,
}) => {
  const now = currentMonthKey();
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmKey, setConfirmKey] = useState(null); // qaysi xizmat o'chirish tasdig'ida

  const { mutate: updateTariff } = useUpdateAssignment();
  const { mutate: updateService } = useUpdateServiceAssignment();
  const { mutate: deleteService } = useDeleteServiceAssignment();
  const { mutate: closeService } = useCloseServiceAssignment();

  const rows = [];
  if (tariffAssignment) {
    rows.push({
      key: "tariff",
      kind: "tariff",
      name: tariffAssignment.tariff?.name ?? "Tarif",
      amount: tariffAssignment.resolvedAmount ?? null,
      debt: tariffDebt,
      assignmentId: tariffAssignment.id,
      isCustom: tariffAssignment.customAmount != null,
      editable: true,
      deletable: false,
    });
  }
  for (const s of services) {
    rows.push({
      key: `svc-${s.serviceId}`,
      kind: "service",
      serviceId: s.serviceId,
      name: s.name,
      amount: s.amount,
      debt: s.debt,
      assignmentId: s.assignmentId,
      startMonth: s.startMonth,
      isActive: s.isActive,
      isCustom: s.isCustom,
      editable: Boolean(s.isActive && s.assignmentId),
      deletable: Boolean(s.isActive && s.assignmentId),
    });
  }

  if (rows.length === 0) return null;

  const startEdit = (row) => {
    setEditKey(row.key);
    setEditValue(row.amount != null ? String(Math.round(Number(row.amount))) : "");
  };
  const cancel = () => {
    setEditKey(null);
    setEditValue("");
  };
  const save = (row) => {
    setSaving(true);
    // Bo'sh → katalog narxiga qaytadi (customAmount olib tashlanadi)
    const data = { customAmount: editValue.trim() === "" ? null : editValue.trim() };
    const done = {
      onSuccess: () => {
        toast.success("Narx yangilandi");
        cancel();
      },
      onError,
      onSettled: () => setSaving(false),
    };
    if (row.kind === "tariff") updateTariff({ id: row.assignmentId, data }, done);
    else updateService({ id: row.assignmentId, data }, done);
  };
  const remove = (row) => {
    const done = {
      onSuccess: () => {
        toast.success("Xizmat o'chirildi");
        setConfirmKey(null);
      },
      onError,
    };
    // O'tgan oyni qamragan biriktirma o'chirilmaydi — o'tgan oyda YOPILADI
    if (row.startMonth >= now) deleteService(row.assignmentId, done);
    else closeService({ id: row.assignmentId, endMonth: prevMonthKey(now) }, done);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Xizmatlar</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              <th className="px-3 py-2 font-medium">Xizmat</th>
              <th className="px-3 py-2 text-right font-medium">Oylik</th>
              <th className="px-3 py-2 text-right font-medium">Qarz</th>
              <th className="px-3 py-2 text-right font-medium">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = editKey === row.key;
              return (
                <tr key={row.key} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {row.kind === "tariff" ? (
                        <>
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-700">
                            Tarif
                          </span>
                          <span className="font-medium text-gray-900">{row.name}</span>
                        </>
                      ) : (
                        <button
                          type="button"
                          title="Bu xizmatdan foydalanuvchilarni ko'rish"
                          onClick={() =>
                            navigate(`/finance/main/services?serviceId=${row.serviceId}`)
                          }
                          className="font-medium text-gray-900 hover:text-primary hover:underline"
                        >
                          {row.name}
                        </button>
                      )}
                      {row.kind === "service" && !row.isActive && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                          biriktirilmagan
                        </span>
                      )}
                      {row.isCustom && (
                        <span
                          title="Bu o'quvchiga individual narx"
                          className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700"
                        >
                          individual
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-right text-gray-600">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        autoFocus
                        value={editValue}
                        placeholder="Katalog narxi"
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-28 rounded-md border border-gray-200 px-2 py-1 text-right text-sm focus:border-primary focus:outline-none"
                      />
                    ) : row.amount != null ? (
                      formatMoney(row.amount)
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td
                    className={cn(
                      "px-3 py-2 text-right font-medium",
                      Number(row.debt) > 0 ? "text-red-600" : "text-gray-400",
                    )}
                  >
                    {formatMoney(row.debt)}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            title="Saqlash"
                            disabled={saving}
                            onClick={() => save(row)}
                            className="rounded-lg p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            title="Bekor"
                            onClick={cancel}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : confirmKey === row.key ? (
                        // Mini-tasdiq — tasodifan o'chirib yubormaslik uchun
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">O'chirilsinmi?</span>
                          <button
                            type="button"
                            onClick={() => remove(row)}
                            className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Ha
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmKey(null)}
                            className="rounded-md px-2 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                          >
                            Yo'q
                          </button>
                        </div>
                      ) : (
                        <>
                          {row.editable && (
                            <Can do={row.kind === "tariff" ? "tariffs.assign" : "services.assign"}>
                              <button
                                type="button"
                                title="Narxni individual tahrirlash"
                                onClick={() => startEdit(row)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            </Can>
                          )}
                          {row.deletable && (
                            <Can do="services.assign">
                              <button
                                type="button"
                                title="Xizmatni o'chirish"
                                onClick={() => setConfirmKey(row.key)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </Can>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFinanceSection;
