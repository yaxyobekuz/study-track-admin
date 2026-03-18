// Toast
import { toast } from "sonner";

// API
import { rolesAPI } from "@/features/roles/api/roles.api";

// Components
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

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
    <form onSubmit={handleEditRole} className="space-y-3.5">
      <Input
        required
        name="name"
        value={name}
        label="Rol nomi"
        onChange={(v) => setField("name", v)}
      />

      <div>
        <Input
          required
          name="value"
          value={value}
          label="Rol kaliti"
          disabled={hasUsers}
          onChange={(v) => setField("value", v?.toLowerCase().trim())}
        />
        {hasUsers && (
          <p className="text-xs text-amber-600 mt-1">
            Foydalanuvchilar mavjud, kalitni o'zgartirib bo'lmaydi
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditRoleModal;
