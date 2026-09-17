// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useEditAllocation } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import { OPEN_INVOICE_STATUSES } from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";

/**
 * "Hisob-fakturaga yechildi" qatorini tahrirlash: yechilgan summani
 * KAMAYTIRISH va/yoki pulni boshqa ochiq oyga KO'CHIRISH.
 *
 * Oqibatlar serverda hisoblanadi (`studentAccount.reworkAllocation`) va
 * natija raqamlari toast'da serverdan ko'rsatiladi — frontend summalar
 * ustida arifmetika qilmaydi:
 *  - oydan olingan, lekin ko'chirilmagan pul depozitga qaytadi va avval
 *    boshqa ochiq qarzlarga yechiladi;
 *  - o'sha oyga depozitdan AVTOMAT yechish to'xtatiladi ("Qarzlarga
 *    qo'llash" tugmasi qayta yoqadi).
 *
 * `openModal("editAllocation", { item, studentId })` — `item` "Depozit
 * harakatlari" dagi `allocation` qatori.
 */
const EditAllocationModal = () => (
  <ResponsiveModal name="editAllocation" title="Yechimni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, item, studentId }) => {
  const { data: invoiceData } = useQuery(financeQueries.studentInvoices(studentId));
  const { mutate: editAllocation } = useEditAllocation();

  const { amount, invoiceId, reason, setField } = useObjectState({
    amount: item?.amount != null ? String(Number(item.amount)) : "",
    invoiceId: item?.invoiceId ?? "",
    reason: "",
  });

  // Ko'chirish mumkin bo'lgan oylar: hozirgi oy + boshqa OCHIQ qarzlar
  const targets = (invoiceData?.invoices ?? []).filter(
    (invoice) =>
      invoice.id === item?.invoiceId || OPEN_INVOICE_STATUSES.includes(invoice.status),
  );

  const options = targets
    .sort((a, b) => a.month - b.month)
    .map((invoice) => ({
      value: invoice.id,
      label:
        invoice.id === item?.invoiceId
          ? `${invoice.monthLabel} (hozirgi)`
          : `${invoice.monthLabel} — qarz ${formatMoney(invoice.debt)}`,
    }));

  const moving = Boolean(invoiceId) && invoiceId !== item?.invoiceId;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item?.allocationId) return;
    if (amount === "" || Number(amount) < 0) return toast.error("Summani kiriting");
    if (!reason.trim()) return toast.error("Sabab kiritilishi shart");

    setIsLoading(true);
    editAllocation(
      {
        allocationId: item.allocationId,
        data: {
          amount: String(amount),
          reason: reason.trim(),
          ...(moving ? { invoiceId } : {}),
        },
      },
      {
        onSuccess: (result) => {
          close();

          const parts = [
            result.moved
              ? `${formatMoney(result.amount)} ${result.targetMonthLabel} oyiga ko'chirildi`
              : `${result.sourceMonthLabel} yechimi yangilandi`,
          ];
          if (Number(result.releasedToDeposit) > 0) {
            parts.push(`${formatMoney(result.releasedToDeposit)} depozitga qaytdi`);
          }
          if (Number(result.appliedToOthers) > 0) {
            parts.push(`${formatMoney(result.appliedToOthers)} boshqa oylarga yechildi`);
          }
          toast.success(parts.join(", "));
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
          {item?.description} — {formatMoney(item?.amount)}
        </p>
        <p className="text-gray-500">
          {[item?.receiptLabel && `Chek ${item.receiptLabel}`, item?.sourceLabel, formatDateUz(item?.occurredAt)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          Summani faqat <b>kamaytirish</b> mumkin. Oydan olingan pul depozitga
          qaytadi va avval boshqa ochiq qarzlarga yechiladi, qolgani depozitda
          turadi. Pul olingan oyga depozitdan <b>avtomat yechish to'xtatiladi</b>{" "}
          — depozitdagi "Qarzlarga qo'llash" tugmasi uni qayta yoqadi.
        </p>
      </div>

      <InputField
        required
        min="0"
        step="0.01"
        type="amount"
        name="amount"
        label="Yechiladigan summa (so'm)"
        value={amount}
        max={item?.amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Qaysi oyga yechilsin</p>
        <Select
          searchable
          value={invoiceId}
          placeholder="Oyni tanlang"
          onChange={(v) => setField("invoiceId", v)}
          options={options}
        />
        {moving && (
          <p className="text-xs text-gray-500">
            Pul tanlangan oyga ko'chiriladi — summa shu oyning qarzidan oshmasligi kerak.
          </p>
        )}
      </div>

      <InputField
        required
        name="reason"
        label="Sabab"
        value={reason}
        placeholder="Nima uchun?"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-40" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default EditAllocationModal;
