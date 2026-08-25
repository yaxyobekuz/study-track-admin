// Router
import { useNavigate, useParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeft, Printer } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useBranch from "@/shared/hooks/useBranch";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateTimeUz, formatDateUz } from "@/shared/utils/date.utils";

// Queries
import { financeQueries } from "../queries/finance.queries";

/**
 * TO'LOV CHEKI — ota-onaga beriladigan qog'oz nusxa.
 *
 * ⚠️ ALOHIDA SAHIFA, modal EMAS. Modal ichida chop etish ishonchsiz:
 * oyna `overflow` va `position` bilan cheklangan, shuning uchun qog'ozga
 * faqat sarlavha tushib, qolgan qismi qirqilib qolardi. Bu sahifa esa
 * yon menyu va yuqori paneldan TASHQARIDA (`DashboardLayout` dan tashqari
 * marshrut) — brauzer ko'rgan narsani aynan chop etadi.
 *
 * Chek serverdan qayta o'qiladi: unda taqsimot qatorlari — pul qaysi
 * oylarga yopilgani — bo'lishi kerak, ro'yxat esa faqat umumiy summani
 * biladi. Ota-ona uchun aynan shu muhim: "300 ming so'm berdim, qaysi
 * oylarga ketdi?".
 *
 * Alohida PDF kutubxona yo'q: brauzerning o'zi chop etish oynasida
 * "PDF sifatida saqlash" ni taklif qiladi.
 */
const PaymentReceiptPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { branch } = useBranch();

  const { data: payment, isLoading } = useQuery(
    financeQueries.paymentDetail(paymentId),
  );

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-gray-500">Yuklanmoqda...</p>
    );
  }

  if (!payment) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-500">Chek topilmadi</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
          Orqaga
        </Button>
      </div>
    );
  }

  const allocations = payment.allocations ?? [];
  const hasDeposit = Number(payment.depositAmount) > 0;

  return (
    <div className="mx-auto max-w-md p-4 print:max-w-none print:p-0">
      {/* Tugmalar qog'ozga tushmaydi */}
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft />
          Orqaga
        </Button>

        <Button onClick={() => window.print()}>
          <Printer />
          Chop etish
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 print:rounded-none print:border-0 print:p-0">
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">
            {branch?.name ?? "Maktab"}
          </p>
          <p className="text-sm text-gray-500">To'lov cheki</p>
          <p className="mt-1 text-lg font-bold tracking-wide text-gray-900">
            {payment.receiptLabel}
          </p>
        </div>

        <Divider />

        <Row label="Sana" value={formatDateTimeUz(payment.paidAt)} />
        <Row label="O'quvchi" value={payment.studentName} />
        <Row label="To'lov turi" value={payment.account?.name ?? "—"} />
        <Row label="Summa" value={`${formatMoney(payment.amount)} so'm`} strong />

        {/* Bekor qilingan chek ham chop etiladi — lekin shunday BELGILANADI,
            aks holda qo'lda tuzatilgan nusxaga o'xshab qolardi */}
        {payment.isVoided && (
          <p className="mt-2 rounded-lg bg-red-50 p-2 text-center text-sm font-medium text-red-700">
            BEKOR QILINGAN
            {payment.voidReason ? ` — ${payment.voidReason}` : ""}
          </p>
        )}

        {allocations.length > 0 && (
          <>
            <Divider />
            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
              Qaysi oylarga yopildi
            </p>
            {allocations.map((allocation) => (
              <Row
                key={allocation.id}
                label={`${allocation.monthLabel ?? "—"} · ${allocation.sourceLabel}`}
                value={`${formatMoney(allocation.amount)} so'm`}
              />
            ))}
          </>
        )}

        {hasDeposit && (
          <>
            <Divider />
            <Row
              label="Hisobda qoldi (keyingi oyga)"
              value={`${formatMoney(payment.depositAmount)} so'm`}
            />
          </>
        )}

        {payment.note && (
          <>
            <Divider />
            <p className="text-sm text-gray-600">{payment.note}</p>
          </>
        )}

        <Divider />
        <p className="text-center text-xs text-gray-400">
          Chop etildi: {formatDateUz(new Date())}
        </p>
      </div>
    </div>
  );
};

const Divider = () => (
  <div className="my-3 border-t border-dashed border-gray-300" />
);

const Row = ({ label, value, strong = false }) => (
  <div className="flex justify-between gap-3 py-1 text-sm">
    <span className="text-gray-500">{label}</span>
    <span
      className={`text-right ${strong ? "font-semibold text-gray-900" : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

export default PaymentReceiptPage;
