// Toast
import { toast } from "sonner";

// API
import { rolesAPI } from "@/features/roles/api/roles.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const EditRoleModal = () => (
  <ResponsiveModal name="editRole" title="Rolni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...role }) => {
  const { invalidateCache } = useArrayStore("roles");

  const hasUsers = role.usersCount > 0;

  const { name, value, state, setField } = useObjectState({
    name: role.name || "",
    value: role.value || "",
  });

  const handleEditRole = (e) => {
    e.preventDefault();
    setIsLoading(true);

    rolesAPI
      .update(role._id, state)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Rol yangilandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <InputGroup onSubmit={handleEditRole} as="form">
      <InputField
        required
        name="name"
        value={name}
        label="Rol nomi"
        onChange={(e) => setField("name", e.target.value)}
      />

      <div>
        <InputField
          required
          name="value"
          value={value}
          label="Rol kaliti"
          disabled={hasUsers}
          description={
            hasUsers
              ? "Foydalanuvchilar mavjud, kalitni o'zgartirib bo'lmaydi"
              : "Faqat kichik lotin harflari, raqamlar va pastki chiziq"
          }
          onChange={(e) =>
            setField("value", e.target.value?.toLowerCase().trim())
          }
        />
      </div>

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
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default EditRoleModal;
