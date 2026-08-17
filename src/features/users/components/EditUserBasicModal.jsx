// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateUser } from "@/features/users/queries/users.mutations";

// Data
import { genderOptions } from "../data/users.data";

/**
 * Asosiy ma'lumot kartasining tahrirlash oynasi: ism, familiya, jins.
 *
 * Faqat shu uch maydon yuboriladi — server qolgan maydonlarga tegmaydi
 * (`updateUser` da har bir maydon `!== undefined` sharti bilan yoziladi),
 * shuning uchun ish jadvali yoki sinflar tasodifan o'chib ketmaydi.
 */
const EditUserBasicModal = () => (
  <ResponsiveModal name="editUserBasic" title="Asosiy ma'lumotni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: updateUser } = useUpdateUser();

  const { firstName, lastName, gender, setField } = useObjectState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    gender: user.gender ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updateUser(
      {
        id: user.id,
        data: { firstName, lastName, gender: gender || null },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Ma'lumotlar saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        label="Ism"
        name="firstName"
        value={firstName}
        placeholder="Falonchi"
        onChange={(e) => setField("firstName", e.target.value)}
      />

      <InputField
        required
        label="Familiya"
        name="lastName"
        value={lastName}
        placeholder="Falonchiyev"
        onChange={(e) => setField("lastName", e.target.value)}
      />

      <SelectField
        label="Jins"
        value={gender}
        options={genderOptions}
        placeholder="Jinsni tanlang"
        onChange={(value) => setField("gender", value)}
      />

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

export default EditUserBasicModal;
