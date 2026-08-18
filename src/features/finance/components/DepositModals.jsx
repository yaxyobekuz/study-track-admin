// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useAdjustAccount,
  useAdjustStudentBalance,
  useRefundDeposit,
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

const Footer = ({ close, isLoading, label }) => (
  <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
    <Button
      type="button"
      onClick={close}
      variant="secondary"
      className="w-full xs:w-32"
    >
      Bekor qilish
    </Button>

    <Button className="w-full xs:w-32" disabled={isLoading}>
      {label}
      {isLoading && "..."}
    </Button>
  </div>
);

// ─────────────────────────────────────────────
// Depozitni qaytarish
// ─────────────────────────────────────────────

/**
 * Ota-onaga oldindan to'langan pulni qaytarish — pul tashqariga CHIQADI,
 * shuning uchun qaysi to'lov turidan berilgani tanlanadi.
 *
 * Qoldiqdan ko'pini qaytarib bo'lmaydi (server rad etadi).
 */
export const RefundDepositModal = () => (
  <ResponsiveModal name="refundDeposit" title="Depozitni qaytarish">
    <RefundForm />
  </ResponsiveModal>
);

const RefundForm = ({ close, isLoading, setIsLoading, student, balance }) => {
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { mutate: refundDeposit } = useRefundDeposit();

  const { amount, accountId, reason, refundedAt, setField } = useObjectState({
    amount: balance ?? "",
    accountId: "",
    reason: "",
    refundedAt: todayInputValue(),
  });

  const resolvedAccountId = accountId || (accounts.length === 1 ? accounts[0].id : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolvedAccountId) return toast.error("Pul qaysi to'lov turidan berilishini tanlang");

    setIsLoading(true);

    refundDeposit(
      {
        studentId: student.id,
        data: { amount: String(amount), accountId: resolvedAccountId, reason, refundedAt },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(`Qaytarildi. Qolgan depozit: ${formatMoney(result.balance)}`);
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">
          {student?.fullName || student?.studentName}
        </p>
        <p className="text-gray-500">Depozitda: {formatMoney(balance)}</p>
      </div>

      <InputField
        required
        autoFocus
        min="0"
        step="0.01"
        type="number"
        name="amount"
        label="Qaytariladigan summa (so'm)"
        value={amount}
        max={balance}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Qaysi to'lov turidan</p>
        <Select
          value={resolvedAccountId}
          placeholder="To'lov turini tanlang"
          onChange={(v) => setField("accountId", v)}
          options={accounts.map((a) => ({
            label: `${a.name} — ${formatMoney(a.balance)}`,
            value: a.id,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField
          required
          type="date"
          name="refundedAt"
          label="Sana"
          value={refundedAt}
          max={todayInputValue()}
          onChange={(e) => setField("refundedAt", e.target.value)}
        />

        <InputField
          required
          name="reason"
          label="Sabab"
          value={reason}
          placeholder="O'qishdan ketdi"
          onChange={(e) => setField("reason", e.target.value)}
        />
      </div>

      <Footer close={close} isLoading={isLoading} label="Qaytarish" />
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Qo'lda to'g'rilash
// ─────────────────────────────────────────────

const DIRECTION_OPTIONS = [
  { label: "Qo'shish (+)", value: "plus" },
  { label: "Ayirish (−)", value: "minus" },
];

/**
 * O'quvchi qoldig'ini qo'lda to'g'rilash — eski qarzni ko'chirish yoki
 * kiritishdagi xatoni tuzatish.
 *
 * To'lov turiga TEGMAYDI: bu pul harakati emas, hisob tuzatishi. Sabab
 * majburiy va serverda logga tushadi.
 */
export const AdjustStudentBalanceModal = () => (
  <ResponsiveModal name="adjustStudentBalance" title="Qoldiqni to'g'rilash">
    <AdjustForm scope="student" />
  </ResponsiveModal>
);

/** To'lov turi qoldig'ini to'g'rilash — smena yopilishidagi sanoq farqi. */
export const AdjustAccountModal = () => (
  <ResponsiveModal name="adjustAccount" title="To'lov turi qoldig'ini to'g'rilash">
    <AdjustForm scope="account" />
  </ResponsiveModal>
);

const AdjustForm = ({
  close,
  isLoading,
  setIsLoading,
  scope,
  student,
  account,
  balance,
}) => {
  const isAccount = scope === "account";

  const { mutate: adjustAccount } = useAdjustAccount();
  const { mutate: adjustStudent } = useAdjustStudentBalance();

  const { direction, value, reason, setField } = useObjectState({
    direction: "plus",
    value: "",
    reason: "",
  });

  const currentBalance = isAccount ? account?.balance : balance;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Ishorani UI tanlaydi, serverga ISHORALI son ketadi
    const signed = direction === "minus" ? `-${value}` : String(value);

    const onSuccess = () => {
      close();
      toast.success("To'g'rilandi");
    };
    const onError = (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    const onSettled = () => setIsLoading(false);

    if (isAccount) {
      adjustAccount(
        { id: account.id, data: { amount: signed, reason } },
        { onSuccess, onError, onSettled },
      );
    } else {
      adjustStudent(
        { studentId: student.id, data: { amount: signed, reason } },
        { onSuccess, onError, onSettled },
      );
    }
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">
          {isAccount ? account?.name : student?.fullName || student?.studentName}
        </p>
        <p className="text-gray-500">Joriy qoldiq: {formatMoney(currentBalance)}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Yo'nalish</p>
          <Select
            value={direction}
            options={DIRECTION_OPTIONS}
            onChange={(v) => setField("direction", v)}
          />
        </div>

        <InputField
          required
          autoFocus
          min="0"
          step="0.01"
          type="number"
          name="value"
          label="Summa (so'm)"
          value={value}
          onChange={(e) => setField("value", e.target.value)}
        />
      </div>

      <InputField
        required
        name="reason"
        label="Sabab"
        value={reason}
        placeholder={
          isAccount ? "Smena yopilishida 20 000 kam chiqdi" : "O'tgan yildan qolgan avans"
        }
        onChange={(e) => setField("reason", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Bu amal auditga yoziladi. {isAccount ? "To'lov turi" : "O'quvchi"} qoldig'i
        sababsiz o'zgarmasligi kerak — shuning uchun izoh aniq bo'lsin.
      </p>

      <Footer close={close} isLoading={isLoading} label="To'g'rilash" />
    </InputGroup>
  );
};
