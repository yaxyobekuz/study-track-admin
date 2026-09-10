// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateService, useUpdateService } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Qo'shimcha xizmat (yotoqxona, ovqat, transport, ...) qo'shish/tahrirlash.
 *
 * Narx TAHRIRLANADI (tarif versiyasidan farqli): xizmat narxi o'zgarsa,
 * biriktirilgan o'quvchilarning TO'LANMAGAN hisob-fakturalari server tomonda
 * avtomatik qayta hisoblanadi — to'langan oylar muhrlangan bo'lib qoladi.
 */
export const CreateServiceModal = () => (
  <ResponsiveModal name="createService" title="Yangi xizmat">
    <Form />
  </ResponsiveModal>
);

export const EditServiceModal = () => (
  <ResponsiveModal name="editService" title="Xizmatni tahrirlash">
    <Form />
  </ResponsiveModal>
);

const Form = ({ close, isLoading, setIsLoading, service }) => {
  const isEdit = Boolean(service?.id);

  const { mutate: createService } = useCreateService();
  const { mutate: updateService } = useUpdateService();

  const { name, monthlyAmount, note, setField } = useObjectState({
    name: service?.name ?? "",
    monthlyAmount: service?.monthlyAmount ?? "",
    note: service?.note ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { name, monthlyAmount: String(monthlyAmount), note };

    const onSuccess = () => {
      close();
      toast.success(isEdit ? "Xizmat yangilandi" : "Xizmat qo'shildi");
    };
    const onError = (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    const onSettled = () => setIsLoading(false);

    if (isEdit) {
      updateService({ id: service.id, data: payload }, { onSuccess, onError, onSettled });
    } else {
      createService(payload, { onSuccess, onError, onSettled });
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
        placeholder="Yotoqxona"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        required
        min="0"
        step="0.01"
        type="amount"
        name="monthlyAmount"
        label="Oylik narx (so'm)"
        value={monthlyAmount}
        onChange={(e) => setField("monthlyAmount", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh"
        value={note}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      {isEdit && (
        <p className="text-xs text-gray-500">
          Narx o'zgartirilsa, biriktirilgan o'quvchilarning to'lanmagan
          hisob-fakturalari avtomatik qayta hisoblanadi. To'langan oylar
          o'zgarmaydi.
        </p>
      )}

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
