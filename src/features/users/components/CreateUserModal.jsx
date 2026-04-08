// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import MultiSelect from "@/shared/components/form/multi-select";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import { Field, FieldLabel } from "@/shared/components/shadcn/field";

// Data
import { genderOptions } from "../data/users.data";
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

const CreateUserModal = () => (
  <ResponsiveModal name="createUser" title="Yangi foydalanuvchi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { getCollectionData, invalidateCache } = useArrayStore("classes");
  const classes = getCollectionData();

  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData().filter((r) => r.value !== "owner");

  const {
    role,
    state,
    gender,
    setField,
    username,
    password,
    lastName,
    firstName,
  } = useObjectState({
    classes: [],
    username: "",
    password: "",
    lastName: "",
    firstName: "",
    gender: "male",
    workDays: null,
    role: "student",
    workEndTime: "",
    workStartTime: "",
    hasCustomSchedule: false,
  });

  const toggleWorkDay = (day) => {
    const current = state.workDays || [];
    setField(
      "workDays",
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(),
    );
  };

  const handleCustomScheduleToggle = (checked) => {
    setField("hasCustomSchedule", checked);
    if (!checked) {
      setField("workStartTime", "");
      setField("workEndTime", "");
      setField("workDays", null);
    } else {
      setField("workDays", [1, 2, 3, 4, 5]);
    }
  };

  const showScheduleSection = role !== "student" && role !== "owner";

  const handleCreateUser = (e) => {
    e.preventDefault();

    if (role === "student" && (!state.classes || state.classes.length === 0)) {
      return toast.warning("Kamida bitta sinf tanlanishi kerak");
    }

    setIsLoading(true);
    const data = {
      ...state,
      password: password?.trim(),
      gender: gender || null,
      workStartTime: state.hasCustomSchedule
        ? state.workStartTime || null
        : null,
      workEndTime: state.hasCustomSchedule ? state.workEndTime || null : null,
      workDays: state.hasCustomSchedule ? state.workDays : null,
      hasCustomSchedule: undefined,
    };

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
    <form onSubmit={handleCreateUser} className="space-y-3.5">
      <InputField
        required
        label="Ism"
        name="firstName"
        value={firstName}
        autoComplete="off"
        placeholder="Falonchi"
        onChange={(e) => setField("firstName", e.target.value)}
      />

      <InputField
        required
        name="lastName"
        label="Familiya"
        value={lastName}
        autoComplete="off"
        placeholder="Falonchiyev"
        onChange={(e) => setField("lastName", e.target.value)}
      />

      <InputField
        required
        name="username"
        value={username}
        autoComplete="off"
        label="Foydalanuvchi nomi"
        placeholder="Raqam va harflardan iborat"
        onChange={(e) =>
          setField("username", e.target.value?.toLowerCase()?.trim())
        }
      />

      <InputField
        required
        label="O'ron"
        minLength={6}
        type="password"
        name="password"
        value={password}
        autoComplete="off"
        onChange={(e) => setField("password", e.target.value)}
      />

      <SelectField
        required
        label="Rol"
        value={role}
        onChange={(v) => setField("role", v)}
        options={roles.map((r) => ({ label: r.name, value: r.value }))}
      />

      <SelectField
        label="Jins"
        value={gender}
        options={genderOptions}
        placeholder="Jinsni tanlang"
        onChange={(v) => setField("gender", v)}
      />

      {role === "student" && (
        <MultiSelect
          required
          label="Sinflar"
          value={state.classes}
          placeholder="Sinflarni tanlang..."
          onChange={(v) => setField("classes", v)}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />
      )}

      {showScheduleSection && (
        <div className="space-y-4">
          {/* Label */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={state.hasCustomSchedule}
              onChange={(e) => handleCustomScheduleToggle(e.target.checked)}
            />

            <span className="text-sm font-medium text-gray-700">
              Maxsus ish jadvali belgilash (ixtiyoriy)
            </span>
          </label>

          {/* Content */}
          {state.hasCustomSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  type="time"
                  label="Boshlanish vaqti"
                  value={state.workStartTime}
                  onChange={(e) => setField("workStartTime", e.target.value)}
                />

                <InputField
                  type="time"
                  label="Tugash vaqti"
                  value={state.workEndTime}
                  onChange={(e) => setField("workEndTime", e.target.value)}
                />
              </div>

              <Field>
                <FieldLabel>Ish kunlari</FieldLabel>

                <div className="flex gap-1.5 flex-wrap">
                  {WORK_DAYS_OPTIONS.map(({ label, value: day }) => {
                    const isSelected = (state.workDays || []).includes(day);

                    return (
                      <Button
                        key={day}
                        type="button"
                        className="flex-1 rounded-full"
                        onClick={() => toggleWorkDay(day)}
                        variant={isSelected ? "default" : "secondary"}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading} className="w-full xs:w-32">
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserModal;
