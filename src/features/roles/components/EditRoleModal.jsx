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

// Data
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

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
    workStartTime: role.workStartTime || "",
    workEndTime: role.workEndTime || "",
    workDays: role.workDays || [1, 2, 3, 4, 5],
  });

  const toggleWorkDay = (day) => {
    const current = state.workDays || [];
    setField(
      "workDays",
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()
    );
  };

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

      {/* Ish jadvali */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700">Ish jadvali (davomat)</p>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            type="time"
            name="workStartTime"
            label="Boshlanish vaqti"
            value={state.workStartTime}
            onChange={(e) => setField("workStartTime", e.target.value)}
          />
          <InputField
            type="time"
            name="workEndTime"
            label="Tugash vaqti"
            value={state.workEndTime}
            onChange={(e) => setField("workEndTime", e.target.value)}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Ish kunlari</p>
          <div className="flex gap-1.5 flex-wrap">
            {WORK_DAYS_OPTIONS.map(({ label, value: day }) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkDay(day)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  state.workDays?.includes(day)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
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
