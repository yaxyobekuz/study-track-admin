// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useCreateUser } from "@/features/users/queries/users.mutations";
import { financeQueries } from "@/features/finance/queries/finance.queries";

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

/** Bugungi sana `<input type="date">` qiymati sifatida (mahalliy, YYYY-MM-DD). */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const CreateUserModal = () => (
  <ResponsiveModal name="createUser" title="Yangi foydalanuvchi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { data: classes = [] } = useClasses();
  const { data: rolesData = [] } = useRoles();
  const roles = rolesData.filter((r) => r.value !== "owner");
  const { data: tariffs = [] } = useQuery(financeQueries.assignableTariffs());

  const { mutate: createUser } = useCreateUser();

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
    // O'quvchi moliyasi
    enrollmentDate: todayInputValue(),
    firstMonthAmount: "",
    tariffId: "",
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
    const isStudent = role === "student";
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
      // Moliya maydonlari faqat o'quvchi uchun yuboriladi
      enrollmentDate: isStudent ? state.enrollmentDate || undefined : undefined,
      firstMonthAmount: isStudent
        ? state.firstMonthAmount || undefined
        : undefined,
      tariffId: isStudent ? state.tariffId || undefined : undefined,
    };

    createUser(data, {
      onSuccess: () => {
        close();
        toast.success("Foydalanuvchi yaratildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
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
        <>
          <MultiSelect
            required
            label="Sinflar"
            value={state.classes}
            placeholder="Sinflarni tanlang..."
            onChange={(v) => setField("classes", v)}
            options={classes.map((cls) => ({ label: cls.name, value: cls.id }))}
          />

          {/* ── Moliya: kirgan sana + birinchi oy summasi + tarif ── */}
          <div className="rounded-xl bg-gray-50 p-3 space-y-3.5">
            <p className="text-xs font-medium text-gray-500">
              Moliya — birinchi oy qo'lda, keyingi oylar tarif bo'yicha
            </p>

            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <InputField
                type="date"
                name="enrollmentDate"
                label="Kirgan sana"
                value={state.enrollmentDate}
                onChange={(e) => setField("enrollmentDate", e.target.value)}
              />
              <InputField
                min="0"
                step="0.01"
                type="number"
                name="firstMonthAmount"
                label="Birinchi oy to'lovi (so'm)"
                value={state.firstMonthAmount}
                placeholder="Masalan: 300000"
                onChange={(e) => setField("firstMonthAmount", e.target.value)}
              />
            </div>

            <SelectField
              label="Tarif"
              value={state.tariffId}
              placeholder="Tarifni tanlang"
              onChange={(v) => setField("tariffId", v)}
              options={tariffs.map((t) => ({ label: t.name, value: t.id }))}
            />
          </div>
        </>
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
