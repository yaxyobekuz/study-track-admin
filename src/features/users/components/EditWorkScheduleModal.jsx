// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import WeeklyScheduleEditor from "./WeeklyScheduleEditor";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateUser } from "@/features/users/queries/users.mutations";

// Data
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

/** `weeklySchedule` eski ma'lumotlarda Map bo'lishi mumkin. */
const toPlainSchedule = (value) => {
  if (!value) return {};
  return value instanceof Map ? Object.fromEntries(value) : value;
};

/**
 * Xodimning ish jadvali.
 *
 * Jadval bo'lmasa xodim rolining standart vaqti amal qiladi — shuning uchun
 * "maxsus jadval" o'chirilganda maydonlar `null` qilib yuboriladi, bo'sh satr
 * emas: server shuni rol merosiga qaytish deb tushunadi.
 */
const EditWorkScheduleModal = () => (
  <ResponsiveModal
    name="editWorkSchedule"
    title="Ish jadvali"
    description="Bo'sh qoldirilsa, xodim roli uchun belgilangan standart vaqt amal qiladi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: updateUser } = useUpdateUser();

  const { state, setField } = useObjectState({
    hasCustomSchedule: Boolean(user.workStartTime && user.workEndTime),
    workStartTime: user.workStartTime ?? "",
    workEndTime: user.workEndTime ?? "",
    workDays: user.workDays?.length ? user.workDays : [1, 2, 3, 4, 5],
    weeklySchedule: toPlainSchedule(user.weeklySchedule),
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (state.hasCustomSchedule && (!state.workStartTime || !state.workEndTime)) {
      return toast.warning("Boshlanish va tugash vaqtini kiriting");
    }

    setIsLoading(true);

    updateUser(
      {
        id: user.id,
        data: state.hasCustomSchedule
          ? {
              workStartTime: state.workStartTime,
              workEndTime: state.workEndTime,
              workDays: state.workDays,
              weeklySchedule: state.weeklySchedule,
            }
          : {
              workStartTime: null,
              workEndTime: null,
              workDays: [],
              weeklySchedule: {},
            },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Ish jadvali saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="size-4 rounded"
          checked={state.hasCustomSchedule}
          onChange={(e) => setField("hasCustomSchedule", e.target.checked)}
        />
        <span className="text-sm font-medium text-gray-700">
          Maxsus ish jadvali belgilash
        </span>
      </label>

      {state.hasCustomSchedule && (
        <div className="space-y-4 border-l-2 border-gray-100 pl-5">
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

          <div>
            <p className="mb-2 text-xs text-gray-500">Ish kunlari</p>
            <div className="flex flex-wrap gap-1.5">
              {WORK_DAYS_OPTIONS.map(({ label, value: day }) => {
                const isSelected = (state.workDays || []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkDay(day)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">
              Har kun uchun alohida vaqt (ixtiyoriy)
            </p>
            <WeeklyScheduleEditor
              workDays={state.workDays || []}
              weeklySchedule={state.weeklySchedule}
              defaultStart={state.workStartTime}
              defaultEnd={state.workEndTime}
              onChange={(schedule) => setField("weeklySchedule", schedule)}
            />
          </div>
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

        <Button autoFocus disabled={isLoading} className="w-full xs:w-32">
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditWorkScheduleModal;
