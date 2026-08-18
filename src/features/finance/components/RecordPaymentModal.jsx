// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowRight, PiggyBank } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useCreatePayment,
  usePreviewPayment,
} from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { financeQueries } from "../queries/finance.queries";

/** Bugungi sana `input[type=date]` uchun. */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * To'lov qabul qilish — kassirning asosiy amali.
 *
 * Kassir BITTA summa kiritadi; server uni eng eski qarzdan boshlab
 * taqsimlaydi va ortiqchasini depozitga qo'yadi. Taqsimot SAQLASHDAN
 * OLDIN ko'rsatiladi (`/payments/preview` hech narsa yozmaydi) — kassir
 * "pulim qayerga ketdi?" degan savolga ota-ona hali yonida turganda
 * javob bera olishi kerak.
 *
 * `openModal("recordPayment", { student })` — `student` da kamida
 * `{ id, fullName }` bo'lishi kerak.
 */
const RecordPaymentModal = () => (
  <ResponsiveModal name="recordPayment" title="To'lov qabul qilish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, student }) => {
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { mutate: createPayment } = useCreatePayment();
  const { mutate: runPreview, isPending: isPreviewing } = usePreviewPayment();

  const [preview, setPreview] = useState(null);

  const { amount, accountId, paidAt, note, setField } = useObjectState({
    amount: "",
    accountId: "",
    paidAt: todayInputValue(),
    note: "",
  });

  // Faqat bitta hisob bo'lsa tanlash shart emas
  const resolvedAccountId = accountId || (accounts.length === 1 ? accounts[0].id : "");

  /**
   * Taqsimotni hisoblash — summa kiritilib bo'lgach (blur). Har harfda
   * emas: bu server so'rovi va oraliq qiymatlar ("15", "150", "1500")
   * mazmunsiz natija berardi.
   */
  const refreshPreview = () => {
    const value = Number(amount);
    if (!student?.id || !Number.isFinite(value) || value <= 0) {
      setPreview(null);
      return;
    }

    runPreview(
      { studentId: student.id, amount: String(amount) },
      {
        onSuccess: setPreview,
        onError: () => setPreview(null),
      },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!student?.id) return;

    if (!resolvedAccountId) {
      toast.error("Pul qaysi to'lov turiga tushganini tanlang");
      return;
    }

    setIsLoading(true);

    createPayment(
      {
        studentId: student.id,
        accountId: resolvedAccountId,
        amount: String(amount),
        paidAt,
        note,
      },
      {
        onSuccess: (result) => {
          close();
          const deposit = Number(result.summary.depositAmount);
          toast.success(
            deposit > 0
              ? `Chek ${result.receiptLabel} — ${formatMoney(result.summary.depositAmount)} depozitga tushdi`
              : `Chek ${result.receiptLabel} qabul qilindi`,
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {student && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">
            {student.fullName || student.studentName}
          </p>
          {student.className && (
            <p className="text-gray-500">{student.className}</p>
          )}
        </div>
      )}

      <InputField
        required
        autoFocus
        min="0"
        step="0.01"
        type="number"
        name="amount"
        label="Qabul qilingan summa (so'm)"
        value={amount}
        onBlur={refreshPreview}
        onChange={(e) => {
          setField("amount", e.target.value);
          setPreview(null);
        }}
      />

      {/* Taqsimot — saqlashdan OLDIN */}
      {isPreviewing && (
        <p className="text-sm text-gray-500">Taqsimot hisoblanmoqda...</p>
      )}

      {preview && !isPreviewing && (
        <div className="space-y-2 rounded-xl border border-gray-100 p-3">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Qanday taqsimlanadi
          </p>

          {preview.allocations.length === 0 && (
            <p className="text-sm text-gray-500">
              Ochiq qarz yo'q — hammasi depozitga tushadi.
            </p>
          )}

          {preview.allocations.map((row) => (
            <div key={row.invoiceId} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-gray-700">
                {row.monthLabel}
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-gray-300" />
              <span className="shrink-0 font-medium text-gray-900">
                {formatMoney(row.amount)}
              </span>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                  row.closes
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {row.closes ? "yopiladi" : "qisman"}
              </span>
            </div>
          ))}

          {Number(preview.depositAmount) > 0 && (
            <div className="flex items-center gap-2 border-t border-gray-100 pt-2 text-sm">
              <PiggyBank className="size-3.5 shrink-0 text-blue-500" />
              <span className="min-w-0 flex-1 text-gray-700">Depozitga</span>
              <span className="shrink-0 font-medium text-blue-600">
                {formatMoney(preview.depositAmount)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Pul qayerga tushdi</p>
        <Select
          value={resolvedAccountId}
          placeholder="To'lov turini tanlang"
          onChange={(v) => setField("accountId", v)}
          options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        />
        {accounts.length === 0 && (
          <p className="text-xs text-amber-700">
            Faol to'lov turi yo'q — avval "To'lov turlari" bo'limida qo'shing.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField
          required
          type="date"
          name="paidAt"
          label="To'lov sanasi"
          value={paidAt}
          max={todayInputValue()}
          onChange={(e) => setField("paidAt", e.target.value)}
        />

        <InputField
          name="note"
          value={note}
          label="Izoh"
          placeholder="Ixtiyoriy"
          onChange={(e) => setField("note", e.target.value)}
        />
      </div>

      <p className="text-xs text-gray-500">
        To'lov keyin o'zgartirilmaydi — xato bo'lsa to'liq bekor qilinib,
        qaytadan kiritiladi.
      </p>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          className="w-full xs:w-40"
          disabled={isLoading || accounts.length === 0}
        >
          Qabul qilish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default RecordPaymentModal;
