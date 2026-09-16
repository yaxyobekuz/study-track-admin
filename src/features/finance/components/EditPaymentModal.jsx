// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useEditPayment } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// API & queries
import { financeQueries } from "../queries/finance.queries";
import { usersAPI } from "@/features/users/api/users.api";

/** Bugungi sana — `input[type=date]` max qiymati. */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/** ISO sana → `YYYY-MM-DD` (input qiymati). */
const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : "");

/**
 * To'lovni tahrirlash.
 *
 * ⚠️ Daftar APPEND-ONLY — "joyida o'zgartirish" yo'q. Tahrirlash = eski
 * to'lovni BEKOR QILISH + tahrirlangan yangi to'lov yaratish (server
 * `editPayment`). Ikkalasi ham auditda qoladi. O'quvchi, summa, to'lov turi,
 * sana va izoh — hammasi o'zgartirilishi mumkin.
 *
 * `openModal("editPayment", { payment })` — `payment` da xom maydonlar
 * (studentId, accountId, amount, paidAt, note) bo'lishi kerak.
 */
const EditPaymentModal = () => (
  <ResponsiveModal name="editPayment" title="To'lovni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, payment }) => {
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { data: students = [] } = useQuery({
    queryKey: ["users", "students", "payment-edit"],
    queryFn: () =>
      usersAPI
        .getAll({ role: "student", limit: 1000, isArchived: false })
        .then((r) => r.data.data ?? []),
  });

  const { mutate: editPayment } = useEditPayment();

  const { studentId, amount, accountId, paidAt, note, setField } = useObjectState({
    studentId: payment?.studentId ?? "",
    amount: payment?.amount != null ? String(Number(payment.amount)) : "",
    accountId: payment?.accountId ?? "",
    paidAt: toDateInput(payment?.paidAt),
    note: payment?.note ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!payment?.id) return;
    if (!studentId) return toast.error("O'quvchini tanlang");
    if (!(Number(amount) > 0)) return toast.error("Summani kiriting");
    if (!accountId) return toast.error("To'lov turini tanlang");

    setIsLoading(true);
    editPayment(
      {
        id: payment.id,
        data: { studentId, accountId, amount: String(amount), paidAt, note },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(`Tahrirlandi — yangi chek ${result.receiptLabel}`);
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          Eski to'lov <b>bekor qilinadi</b> va tahrirlangan yangi to'lov (yangi
          chek raqami bilan) yaratiladi. Taqsimot va depozit qayta hisoblanadi.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">O'quvchi</p>
        <Select
          searchable
          value={studentId}
          placeholder="O'quvchini tanlang"
          onChange={(v) => setField("studentId", v)}
          options={students.map((s) => ({
            label:
              `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() +
              (s.username ? ` (${s.username})` : ""),
            value: s.id,
          }))}
        />
      </div>

      <InputField
        required
        min="0"
        step="0.01"
        type="amount"
        name="amount"
        label="Summa (so'm)"
        value={amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">To'lov turi (qayerga tushdi)</p>
        <Select
          searchable
          value={accountId}
          placeholder="To'lov turini tanlang"
          onChange={(v) => setField("accountId", v)}
          options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        />
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

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-40" disabled={isLoading || accounts.length === 0}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default EditPaymentModal;
