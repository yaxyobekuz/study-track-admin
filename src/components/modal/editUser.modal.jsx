// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/api/client";

// Components
import Input from "../form/input";
import Select from "../form/select";
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectState from "@/hooks/useObjectState.hook";

const EditUserModal = () => (
  <ResponsiveModal name="editUser" title="Foydalanuvchini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { getCollectionData, invalidateCache } = useArrayStore("classes");
  const classes = getCollectionData();

  const { firstName, lastName, state, setField } = useObjectState({
    class: user.class._id,
    lastName: user.lastName,
    firstName: user.firstName,
  });

  const handleEditUser = (e) => {
    e.preventDefault();

    if (user.role === "student" && !state.class) {
      return toast.warning("Sinf tanlanmagan");
    }

    setIsLoading(true);

    usersAPI
      .update(user._id, state)
      .then(() => {
        close();
        invalidateCache("users");
        toast.success("Foydalanuvchi tahrirlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditUser} className="space-y-3.5">
      <Input
        required
        label="Ism"
        name="firstName"
        value={firstName}
        onChange={(v) => setField("firstName", v)}
      />

      <Input
        required
        name="lastName"
        label="Familiya"
        value={lastName}
        onChange={(v) => setField("lastName", v)}
      />

      {user.role === "student" && (
        <Select
          required
          label="Sinf"
          value={state.class}
          onChange={(v) => setField("class", v)}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />
      )}

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

export default EditUserModal;
