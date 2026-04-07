// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Components
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { genderOptions } from "../data/users.data";
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

const EditUserModal = () => (
  <ResponsiveModal name="editUser" title="Foydalanuvchini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { getCollectionData, invalidateCache } = useArrayStore("classes");
  const classes = getCollectionData();

  const hasCustomSchedule = !!(user.workStartTime || user.workEndTime);

  const { firstName, lastName, gender, state, setField } = useObjectState({
    classes: user.classes?.map((c) => c._id) || [],
    lastName: user.lastName,
    firstName: user.firstName,
    gender: user.gender || "",
    workStartTime: user.workStartTime || "",
    workEndTime: user.workEndTime || "",
    workDays: user.workDays || [1, 2, 3, 4, 5],
    hasCustomSchedule,
  });

  const toggleWorkDay = (day) => {
    const current = state.workDays || [];
    setField(
      "workDays",
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()
    );
  };

  const handleCustomScheduleToggle = (checked) => {
    setField("hasCustomSchedule", checked);
    if (!checked) {
      setField("workStartTime", "");
      setField("workEndTime", "");
      setField("workDays", null);
    } else {
      setField("workDays", user.workDays || [1, 2, 3, 4, 5]);
    }
  };

  const showScheduleSection = user.role !== "student" && user.role !== "owner";

  const handleEditUser = (e) => {
    e.preventDefault();

    if (user.role === "student" && (!state.classes || state.classes.length === 0)) {
      return toast.warning("Kamida bitta sinf tanlanishi kerak");
    }

    setIsLoading(true);

    const data = {
      ...state,
      workStartTime: state.hasCustomSchedule ? (state.workStartTime || null) : null,
      workEndTime: state.hasCustomSchedule ? (state.workEndTime || null) : null,
      workDays: state.hasCustomSchedule ? state.workDays : null,
      hasCustomSchedule: undefined,
    };

    usersAPI
      .update(user._id, data)
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

      <Select
        label="Jins"
        value={gender}
        placeholder="Jinsni tanlang"
        onChange={(v) => setField("gender", v || null)}
        options={genderOptions}
      />

      {user.role === "student" && (
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
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={state.hasCustomSchedule}
              onChange={(e) => handleCustomScheduleToggle(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              Maxsus ish jadvali (ixtiyoriy)
            </span>
          </label>

          {state.hasCustomSchedule && (
            <div className="pl-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="time"
                  label="Boshlanish vaqti"
                  value={state.workStartTime}
                  onChange={(v) => setField("workStartTime", v)}
                />
                <Input
                  type="time"
                  label="Tugash vaqti"
                  value={state.workEndTime}
                  onChange={(v) => setField("workEndTime", v)}
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
                        (state.workDays || []).includes(day)
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
          )}
        </div>
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
