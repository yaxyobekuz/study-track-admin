// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateDiscount, useUpdateDiscount } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { DISCOUNT_RULES_HINT, DISCOUNT_TYPE_OPTIONS } from "../data/finance.data";

/**
 * Chegirma turi qo'shish.
 *
 * Miqdor BIRIKTIRILGANDAN KEYIN o'zgarmaydi (server rad etadi): aks holda
 * bitta tahrir bilan hamma o'quvchining kelasi oy summasi jimgina siljib
 * ketardi. Narxni o'zgartirish uchun yangi chegirma yaratiladi — tarif
 * versiyalari bilan bir xil doktrina.
 */
export const CreateDiscountModal = () => (
  <ResponsiveModal name="createDiscount" title="Yangi chegirma">
    <Form />
  </ResponsiveModal>
);

/** Tahrirlash — nomi, izohi va holati. Miqdor faqat biriktirilmagan bo'lsa. */
export const EditDiscountModal = () => (
  <ResponsiveModal name="editDiscount" title="Chegirmani tahrirlash">
    <Form />
  </ResponsiveModal>
);

const Form = ({ close, isLoading, setIsLoading, discount }) => {
  const isEdit = Boolean(discount?.id);
  const isLocked = isEdit && (discount.totalAssignments ?? 0) > 0;

  const { mutate: createDiscount } = useCreateDiscount();
  const { mutate: updateDiscount } = useUpdateDiscount();

  const { name, description, type, value, isExclusive, isActive, setField } =
    useObjectState({
      name: discount?.name ?? "",
      description: discount?.description ?? "",
      type: discount?.type ?? "percent",
      value: discount?.value ?? "",
      isExclusive: discount?.isExclusive ?? false,
      isActive: discount?.isActive ?? true,
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      description,
      isExclusive,
      isActive,
      // Bloklangan bo'lsa miqdor umuman yuborilmaydi — server `!== undefined`
      // bo'yicha tekshiradi, shuning uchun yubormaslik xavfsiz
      ...(isLocked ? {} : { type, value: String(value) }),
    };

    const onSuccess = () => {
      close();
      toast.success(isEdit ? "Chegirma yangilandi" : "Chegirma qo'shildi");
    };
    const onError = (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    const onSettled = () => setIsLoading(false);

    if (isEdit) {
      updateDiscount({ id: discount.id, data: payload }, { onSuccess, onError, onSettled });
    } else {
      createDiscount(payload, { onSuccess, onError, onSettled });
    }
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        autoFocus
        name="name"
        label="Nomi"
        value={name}
        placeholder="Aka-uka chegirmasi"
        onChange={(e) => setField("name", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Turi</p>
          <Select
            value={type}
            options={DISCOUNT_TYPE_OPTIONS}
            onChange={(v) => setField("type", v)}
          />
        </div>

        <InputField
          required
          min="0"
          step="0.01"
          type="number"
          name="value"
          value={value}
          max={type === "percent" ? "100" : undefined}
          label={type === "percent" ? "Miqdori (%)" : "Miqdori (so'm)"}
          onChange={(e) => setField("value", e.target.value)}
        />
      </div>

      {isLocked && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Bu chegirma {discount.totalAssignments} ta biriktirishda ishlatilgan —
          miqdorini o'zgartirib bo'lmaydi. Boshqa miqdor kerak bo'lsa yangi
          chegirma yarating va o'quvchilarni unga ko'chiring.
        </p>
      )}

      <InputField
        name="description"
        label="Izoh"
        value={description}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("description", e.target.value)}
      />

      <div className="space-y-3 rounded-xl bg-gray-50 p-3">
        <label className="flex cursor-pointer items-start justify-between gap-3">
          <span className="text-sm">
            <span className="font-medium text-gray-900">Faol</span>
            <span className="block text-xs text-gray-500">
              Nofaol chegirmani yangi o'quvchilarga biriktirib bo'lmaydi
            </span>
          </span>
          <Switch checked={isActive} onChange={(v) => setField("isActive", v)} />
        </label>

        <label className="flex cursor-pointer items-start justify-between gap-3 border-t border-gray-200 pt-3">
          <span className="text-sm">
            <span className="font-medium text-gray-900">Yakka (grant)</span>
            <span className="block text-xs text-gray-500">
              Boshqa chegirmalar bilan birga berilmaydi
            </span>
          </span>
          <Switch
            checked={isExclusive}
            onChange={(v) => setField("isExclusive", v)}
          />
        </label>
      </div>

      <p className="text-xs text-gray-500">{DISCOUNT_RULES_HINT}</p>

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
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};
