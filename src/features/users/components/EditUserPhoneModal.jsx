// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateUserPhone } from "@/features/users/queries/users.mutations";

// Data
import { getPhoneLabels, maskedPhoneOrNull } from "../data/users.data";

/**
 * Telefon raqamlari kartasining tahrirlash oynasi.
 *
 * Alohida modal va alohida endpoint (`PUT /users/:id/phone`): raqam
 * identifikatsiya maydoni bo'lgani uchun `users.update` emas, `users.phone`
 * ruxsati bilan ochiladi. Bo'sh qoldirilgan maydon `null` bo'lib ketadi —
 * ya'ni raqam o'chiriladi.
 */
const EditUserPhoneModal = () => (
  <ResponsiveModal name="editUserPhone" title="Telefon raqamlari">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: updatePhone } = useUpdateUserPhone();
  const labels = getPhoneLabels(user.role);

  const { phone, parentPhone, setField } = useObjectState({
    phone: user.phone ?? "",
    parentPhone: user.parentPhone ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updatePhone(
      {
        id: user.id,
        data: {
          phone: maskedPhoneOrNull(phone),
          parentPhone: maskedPhoneOrNull(parentPhone),
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Telefon raqamlari saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* `type="tel"` → InputTel (maskali): +998 (90) 123-45-67 */}
      <InputField
        type="tel"
        name="phone"
        value={phone}
        label={labels.phone}
        autoComplete="off"
        onChange={(e) => setField("phone", e.target.value)}
      />

      <InputField
        type="tel"
        name="parentPhone"
        value={parentPhone}
        label={labels.parentPhone}
        autoComplete="off"
        onChange={(e) => setField("parentPhone", e.target.value)}
      />

      <p className="text-xs text-gray-400">
        Bo'sh qoldirilgan maydon o'chiriladi.
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

        <Button autoFocus disabled={isLoading} className="w-full xs:w-32">
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditUserPhoneModal;
