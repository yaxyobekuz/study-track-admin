// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateBranch } from "@/features/branches/queries/branches.mutations";

// Data
import {
  BRANCH_CODE_HINT,
  BRANCH_CODE_PATTERN,
  suggestCode,
} from "@/features/branches/data/branch.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const CreateBranchModal = () => (
  <ResponsiveModal
    name="createBranch"
    title="Yangi filial"
    description="Filial uchun alohida baza yaratiladi — bu bir necha soniya davom etadi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { mutate: createBranch } = useCreateBranch();

  const { name, code, shortName, address, phone, setField } = useObjectState({
    name: "",
    code: "",
    shortName: "",
    address: "",
    phone: "",
  });

  // Nom yozilganda kod avtomatik taklif qilinadi, lekin foydalanuvchi kodni
  // qo'lda tegsa — taklif to'xtaydi (`codeTouched`).
  const handleNameChange = (value) => {
    setField("name", value);
    if (!code || code === suggestCode(name)) {
      setField("code", suggestCode(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!BRANCH_CODE_PATTERN.test(code)) {
      return toast.error("Filial kodi noto'g'ri formatda");
    }

    setIsLoading(true);

    createBranch(
      { name, code, shortName, address, phone },
      {
        onSuccess: () => {
          close();
          toast.success(`"${name}" yaratildi — baza tayyorlanmoqda`);
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        maxLength={80}
        label="Filial nomi"
        placeholder="Chilonzor filiali"
        onChange={(e) => handleNameChange(e.target.value)}
      />

      <InputField
        required
        name="code"
        value={code}
        maxLength={31}
        label="Filial kodi"
        placeholder="chilonzor"
        description={BRANCH_CODE_HINT}
        onChange={(e) => setField("code", e.target.value.toLowerCase())}
      />

      <InputField
        name="shortName"
        value={shortName}
        maxLength={32}
        label="Qisqa nomi"
        placeholder="Chilonzor"
        onChange={(e) => setField("shortName", e.target.value)}
      />

      <InputField
        name="address"
        value={address}
        maxLength={200}
        label="Manzil"
        placeholder="Toshkent, Chilonzor tumani"
        onChange={(e) => setField("address", e.target.value)}
      />

      <InputField
        name="phone"
        value={phone}
        maxLength={32}
        label="Telefon"
        placeholder="+998 90 123 45 67"
        onChange={(e) => setField("phone", e.target.value)}
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

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateBranchModal;
