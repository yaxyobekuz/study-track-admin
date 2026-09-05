// Toast
import { toast } from "sonner";

// Icons
import { ArrowRight } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateTransfer } from "../queries/finance.mutations";

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
 * To'lov turlari orasida pul o'tkazish — inkassatsiya (naqd puldan bankka),
 * Click hamyonidan hisob-raqamga.
 *
 * KOMISSIYA: manbadan to'liq summa chiqadi, manzilga esa komissiya
 * ayirilgandan keyingi qismi tushadi. Foydalanuvchi buni saqlashdan
 * oldin ko'radi — aks holda bank ushlab qolgan pul "yo'qolgan"dek
 * ko'rinardi.
 */
// Uchta ikki ustunli qator bor (qayerdan/qayerga, summa/komissiya,
// sana/izoh) — sukutdagi `max-w-md` da ular siqilib qolardi.
const AccountTransferModal = () => (
  <ResponsiveModal
    name="accountTransfer"
    title="To'lov turlari orasida o'tkazma"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, fromAccount }) => {
  const { data } = useQuery(financeQueries.accountList({ status: "active" }));
  const accounts = data?.items ?? [];

  const { mutate: createTransfer } = useCreateTransfer();

  const { fromAccountId, toAccountId, amount, fee, occurredAt, note, setField } =
    useObjectState({
      fromAccountId: fromAccount?.id ?? "",
      toAccountId: "",
      amount: "",
      fee: "0",
      occurredAt: todayInputValue(),
      note: "",
    });

  const source = accounts.find((a) => a.id === fromAccountId);
  const target = accounts.find((a) => a.id === toAccountId);
  const received = Math.max(0, Number(amount || 0) - Number(fee || 0));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromAccountId || !toAccountId) {
      return toast.error("Ikkala to'lov turini ham tanlang");
    }
    if (fromAccountId === toAccountId) {
      return toast.error("Bitta turning o'ziga o'tkazma qilib bo'lmaydi");
    }

    setIsLoading(true);

    createTransfer(
      {
        fromAccountId,
        toAccountId,
        amount: String(amount),
        fee: String(fee || 0),
        occurredAt,
        note,
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(
            `${formatMoney(result.receivedAmount)} o'tkazildi`,
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  // ⚠️ Variant yorlig'ida FAQAT NOM turadi. Radix tanlangan variantni
  // trigger'ga o'sha holicha ko'chiradi, ya'ni "nom — qoldiq" ko'rinishi
  // ikki ustunli tor maydonga sig'masdi. Qoldiq esa yo'qolmaydi — u
  // tanlagich OSTIDA, tanlangan hisob bo'yicha ko'rsatiladi.
  const accountOptions = accounts.map((a) => ({ label: a.name, value: a.id }));

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {/* `min-w-0` — grid ustuni tanlagich matniga qarab kerilib
          ketmasligi uchun (ustunning sukut minimal kengligi = min-content) */}
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Qayerdan</p>
          <Select
            value={fromAccountId}
            options={accountOptions}
            placeholder="Tanlang"
            onChange={(v) => setField("fromAccountId", v)}
          />
          <p className="truncate text-xs text-gray-400">
            {source ? `Qoldiq: ${formatMoney(source.balance)}` : "\u00a0"}
          </p>
        </div>

        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Qayerga</p>
          <Select
            value={toAccountId}
            placeholder="Tanlang"
            onChange={(v) => setField("toAccountId", v)}
            options={accountOptions.filter((o) => o.value !== fromAccountId)}
          />
          <p className="truncate text-xs text-gray-400">
            {target ? `Qoldiq: ${formatMoney(target.balance)}` : "\u00a0"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField
          required
          min="0"
          step="0.01"
          type="number"
          name="amount"
          label="Summa (so'm)"
          value={amount}
          onChange={(e) => setField("amount", e.target.value)}
        />

        <InputField
          min="0"
          step="0.01"
          type="number"
          name="fee"
          label="Komissiya (so'm)"
          value={fee}
          onChange={(e) => setField("fee", e.target.value)}
        />
      </div>

      {/* Natija — saqlashdan oldin */}
      {Number(amount) > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm">
          <span className="text-gray-600">{formatMoney(amount)} chiqadi</span>
          <ArrowRight className="size-3.5 shrink-0 text-gray-400" />
          <span className="font-medium text-gray-900">
            {formatMoney(String(received))} tushadi
          </span>
        </div>
      )}

      {source && Number(amount) > Number(source.balance) && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          "{source.name}" bo'yicha {formatMoney(source.balance)} bor — bu
          summani o'tkazib bo'lmaydi.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField
          required
          type="date"
          name="occurredAt"
          label="Sana"
          value={occurredAt}
          max={todayInputValue()}
          onChange={(e) => setField("occurredAt", e.target.value)}
        />

        <InputField
          name="note"
          label="Izoh"
          value={note}
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

        <Button className="w-full xs:w-32" disabled={isLoading}>
          O'tkazish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default AccountTransferModal;
