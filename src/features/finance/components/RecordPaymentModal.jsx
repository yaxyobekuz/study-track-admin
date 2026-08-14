// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreatePayment } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatMonthKey } from "@/shared/helpers/month.helpers";

// Data
import { PAYMENT_METHOD_OPTIONS } from "../data/finance.data";

/** Bugungi sana `input[type=date]` uchun. */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * To'lov qabul qilish.
 *
 * Summa qoldiqdan oshsa server rad etadi — ortiqcha to'lov yozilmaydi.
 * To'lov keyin o'zgartirilmaydi: xato bo'lsa bekor qilinib, qaytadan
 * kiritiladi (append-only moliyaviy log).
 */
const RecordPaymentModal = () => (
  <ResponsiveModal name="recordPayment" title="To'lov qabul qilish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, invoice }) => {
  const { mutate: createPayment } = useCreatePayment();

  const { amount, paidAt, method, note, setField } = useObjectState({
    // Odatiy holat — qoldiqni to'liq to'lash
    amount: invoice?.debt ?? "",
    paidAt: todayInputValue(),
    method: "cash",
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!invoice) return;

    setIsLoading(true);

    createPayment(
      {
        id: invoice.id,
        data: { amount: String(amount), paidAt, method, note },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(
            result.invoice.status === "paid"
              ? "To'lov qabul qilindi — majburiyat yopildi"
              : `To'lov qabul qilindi. Qoldiq: ${formatMoney(result.invoice.debt)}`,
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
      {invoice && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-0.5">
          <p className="font-medium text-gray-900">{invoice.studentName}</p>
          <p className="text-gray-500">
            {formatMonthKey(invoice.month)} · {invoice.tariffName || "—"}
          </p>
          <p className="text-gray-500">
            Summa: {formatMoney(invoice.amount)} · To'langan:{" "}
            {formatMoney(invoice.paidAmount)}
          </p>
          <p className="font-medium text-red-600">
            Qoldiq: {formatMoney(invoice.debt)}
          </p>
        </div>
      )}

      <InputField
        required
        min="0"
        step="0.01"
        type="number"
        name="amount"
        label="To'lov summasi (so'm)"
        value={amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <InputField
          required
          type="date"
          name="paidAt"
          label="To'lov sanasi"
          value={paidAt}
          max={todayInputValue()}
          onChange={(e) => setField("paidAt", e.target.value)}
        />

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">To'lov usuli</p>
          <Select
            value={method}
            options={PAYMENT_METHOD_OPTIONS}
            onChange={(v) => setField("method", v)}
          />
        </div>
      </div>

      <InputField
        name="note"
        value={note}
        label="Izoh"
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        To'lov keyin o'zgartirilmaydi — xato bo'lsa bekor qilinib, qaytadan
        kiritiladi.
      </p>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default RecordPaymentModal;
