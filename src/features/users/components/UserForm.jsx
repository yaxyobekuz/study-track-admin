// Toast
import { toast } from "sonner";

// Router
import { useNavigate } from "react-router-dom";

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
import { Field, FieldLabel } from "@/shared/components/shadcn/field";
import WeeklyScheduleEditor from "./WeeklyScheduleEditor";

// Data
import { genderOptions } from "../data/users.data";
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

/**
 * mode: "create" | "edit"
 * initialData: existing user object (edit mode only)
 */
const UserForm = ({ mode = "create", initialData = null }) => {
  const navigate = useNavigate();
  const { getCollectionData, invalidateCache } = useArrayStore("classes");
  const classes = getCollectionData();

  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData().filter((r) => r.value !== "owner");

  const isEdit = mode === "edit";

  const {
    state,
    setField,
  } = useObjectState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    username: initialData?.username || "",
    password: "",
    role: initialData?.role || "student",
    gender: initialData?.gender || "male",
    classes: initialData?.classes?.map((c) => (typeof c === "object" ? c._id : c)) || [],
    workStartTime: initialData?.workStartTime || "",
    workEndTime: initialData?.workEndTime || "",
    workDays: initialData?.workDays || [1, 2, 3, 4, 5],
    weeklySchedule: initialData?.weeklySchedule
      ? (initialData.weeklySchedule instanceof Map
          ? Object.fromEntries(initialData.weeklySchedule)
          : initialData.weeklySchedule)
      : {},
    hasCustomSchedule: !!(initialData?.workStartTime && initialData?.workEndTime),
    isLoading: false,
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
      setField("workDays", [1, 2, 3, 4, 5]);
      setField("weeklySchedule", {});
    } else {
      setField("workDays", initialData?.workDays || [1, 2, 3, 4, 5]);
    }
  };

  const showScheduleSection = state.role !== "student" && state.role !== "owner";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state.role === "student" && (!state.classes || state.classes.length === 0)) {
      return toast.warning("Kamida bitta sinf tanlanishi kerak");
    }

    setField("isLoading", true);

    const payload = {
      firstName: state.firstName,
      lastName: state.lastName,
      gender: state.gender || null,
      ...(isEdit
        ? {}
        : {
            username: state.username,
            password: state.password,
            role: state.role,
          }),
      classes: state.role === "student" ? state.classes : undefined,
      workStartTime: showScheduleSection && state.hasCustomSchedule ? state.workStartTime || null : null,
      workEndTime: showScheduleSection && state.hasCustomSchedule ? state.workEndTime || null : null,
      workDays: showScheduleSection && state.hasCustomSchedule ? state.workDays : null,
      weeklySchedule: showScheduleSection && state.hasCustomSchedule ? state.weeklySchedule : {},
    };

    try {
      if (isEdit) {
        await usersAPI.update(initialData._id, payload);
        toast.success("Foydalanuvchi yangilandi");
      } else {
        await usersAPI.create(payload);
        toast.success("Foydalanuvchi yaratildi");
      }
      invalidateCache("users");
      navigate("/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setField("isLoading", false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <InputField
        required
        label="Ism"
        name="firstName"
        value={state.firstName}
        autoComplete="off"
        placeholder="Falonchi"
        onChange={(e) => setField("firstName", e.target.value)}
      />

      <InputField
        required
        name="lastName"
        label="Familiya"
        value={state.lastName}
        autoComplete="off"
        placeholder="Falonchiyev"
        onChange={(e) => setField("lastName", e.target.value)}
      />

      {!isEdit && (
        <>
          <InputField
            required
            name="username"
            value={state.username}
            autoComplete="off"
            label="Foydalanuvchi nomi"
            placeholder="Raqam va harflardan iborat"
            onChange={(e) =>
              setField("username", e.target.value?.toLowerCase()?.trim())
            }
          />

          <InputField
            required
            label="Parol"
            minLength={6}
            type="password"
            name="password"
            value={state.password}
            autoComplete="off"
            onChange={(e) => setField("password", e.target.value)}
          />

          <SelectField
            required
            label="Rol"
            value={state.role}
            onChange={(v) => setField("role", v)}
            options={roles.map((r) => ({ label: r.name, value: r.value }))}
          />
        </>
      )}

      <SelectField
        label="Jins"
        value={state.gender}
        options={genderOptions}
        placeholder="Jinsni tanlang"
        onChange={(v) => setField("gender", v)}
      />

      {state.role === "student" && (
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
        <div className="space-y-4 pt-2">
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

          {state.hasCustomSchedule && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-100">
              {/* Default vaqtlar */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  type="time"
                  label="Asosiy boshlanish vaqti"
                  value={state.workStartTime}
                  onChange={(e) => setField("workStartTime", e.target.value)}
                />
                <InputField
                  type="time"
                  label="Asosiy tugash vaqti"
                  value={state.workEndTime}
                  onChange={(e) => setField("workEndTime", e.target.value)}
                />
              </div>

              {/* Ish kunlari */}
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

              {/* Haftalik jadval */}
              <Field>
                <FieldLabel>Har kun uchun alohida vaqt (ixtiyoriy)</FieldLabel>
                <p className="text-xs text-gray-400 mb-2">
                  Faqat asosiy vaqtdan farq qiladigan kunlarni belgilang
                </p>
                <WeeklyScheduleEditor
                  workDays={state.workDays || []}
                  weeklySchedule={state.weeklySchedule}
                  defaultStart={state.workStartTime}
                  defaultEnd={state.workEndTime}
                  onChange={(ws) => setField("weeklySchedule", ws)}
                />
              </Field>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/users")}
        >
          Bekor qilish
        </Button>
        <Button disabled={state.isLoading}>
          {isEdit ? "Saqlash" : "Yaratish"}
          {state.isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
