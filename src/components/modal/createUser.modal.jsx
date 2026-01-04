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

const CreateUserModal = () => (
  <ResponsiveModal name="createUser" title="Yangi foydalanuvchi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { getCollectionData, invalidateCache } = useArrayStore("classes");
  const classes = getCollectionData();

  const { username, password, firstName, lastName, role, state, setField } =
    useObjectState({
      class: "",
      username: "",
      password: "",
      lastName: "",
      firstName: "",
      role: "student",
    });

  const handleCreateUser = (e) => {
    e.preventDefault();

    if (role === "student" && !state.class) {
      return toast.warning("Sinf tanlanmagan");
    }

    setIsLoading(true);
    const data = { ...state, password: password?.trim() };

    usersAPI
      .create(data)
      .then(() => {
        close();
        invalidateCache("users");
        toast.success("Foydalanuvchi yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleCreateUser} className="space-y-5">
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

      <Input
        required
        name="username"
        label="Username"
        value={username}
        className="[&>input]:lowercase"
        onChange={(v) => setField("username", v?.trim())}
      />

      <Input
        required
        label="Parol"
        minLength={6}
        type="password"
        name="password"
        value={password}
        onChange={(v) => setField("password", v)}
      />

      <Select
        required
        label="Rol"
        value={role}
        onChange={(v) => setField("role", v)}
        options={[
          { label: "O'quvchi", value: "student" },
          { label: "O'qituvchi", value: "teacher" },
        ]}
      />
      {role === "student" && (
        <Select
          required
          label="Sinf"
          value={state.class}
          onChange={(v) => setField("class", v)}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />
      )}

      <div className="flex justify-end gap-5 w-full">
        <Button
          type="button"
          className="w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserModal;
