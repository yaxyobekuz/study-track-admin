// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useUpsertMonthOverride,
  useDeleteMonthOverride,
} from "../queries/finance.mutations";

// Queries
import { financeQueries } from "../queries/finance.queries";

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
import { MONTH_OVERRIDE_REASON_OPTIONS } from "../data/finance.data";

/**
 * Bitta oy summasini SABAB bilan o'zgartirish (kech qo'shilgan / kasallik /
 * oilaviy / boshqa). Faqat o'sha oyga ta'sir qiladi — keyingi oylar odatdagi
 * tarif bo'yicha qoladi.
 *
 * `openModal("monthOverride", { studentId, month, invoice, student })`
 *
 * Server override yozgach o'sha oy hisob-fakturasini avtomat qayta muhrlaydi,
 * shuning uchun bu yerda alohida "qayta shakllantirish" qadami yo'q.
 */
const MonthOverrideModal = () => (
  <ResponsiveModal name="monthOverride" title="Oy summasini o'zgartirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  studentId,
  month,
  invoice,
  student,
}) => {
  const { mutate: upsert } = useUpsertMonthOverride();
  const { mutate: remove } = useDeleteMonthOverride();

  // Prefill — hisob-faktura (timeline'dan, allaqachon keshda) ustuvorligi bilan
  const existingReason = invoice?.overrideReason ?? null;

  // O'chirish uchun override id — ro'yxatdan (asinxron kelishi mumkin)
  const { data: overrides = [] } = useQuery(
    financeQueries.studentMonthOverrides(studentId),
  );
  const overrideId = overrides.find((o) => o.month === month)?.id ?? null;

  const { amount, reasonCode, note, setField } = useObjectState({
    amount: existingReason ? String(invoice?.amount ?? "") : "",
    reasonCode: existingReason ?? "",
    note: invoice?.overrideNote ?? "",
  });

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount.trim()) return toast.error("Summani kiriting");
    if (!reasonCode) return toast.error("Sababni tanlang");

    setIsLoading(true);
    upsert(
      { studentId, data: { month, amount: amount.trim(), reasonCode, note } },
      {
        onSuccess: () => {
          close();
          toast.success("Oy summasi o'zgartirildi");
        },
        onError: handleError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        {student?.fullName && (
          <p className="font-medium text-gray-900">{student.fullName}</p>
        )}
        <p className="text-gray-500">{formatMonthKey(month)}</p>
        {invoice && (
          <p className="mt-1 text-xs text-gray-500">
            Joriy summa: <b>{formatMoney(invoice.amount)}</b>
          </p>
        )}
      </div>

      <InputField
        required
        autoFocus
        type="number"
        name="amount"
        label="Yangi summa (so'm)"
        value={amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Sabab</p>
        <Select
          value={reasonCode}
          placeholder="Sababni tanlang"
          options={MONTH_OVERRIDE_REASON_OPTIONS}
          onChange={(v) => setField("reasonCode", v)}
        />
      </div>

      <InputField
        name="note"
        label="Izoh"
        value={note}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Bu summa faqat <b>{formatMonthKey(month)}</b> oyiga tegishli. Keyingi
        oylar odatdagi tarif bo'yicha hisoblanadi. Chegirma va proratsiya
        qo'llanmaydi — qarz aynan shu summa bo'ladi.
      </p>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        {existingReason && overrideId && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-red-600 xs:mr-auto xs:w-auto"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              remove(overrideId, {
                onSuccess: () => {
                  close();
                  toast.success("Oy summasi odatdagi tarifga qaytarildi");
                },
                onError: handleError,
                onSettled: () => setIsLoading(false),
              });
            }}
          >
            Bekor qilish (odatiy narx)
          </Button>
        )}

        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Yopish
        </Button>

        <Button className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default MonthOverrideModal;
