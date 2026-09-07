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
import {
  WORK_DAYS_OPTIONS,
  WORK_TIME_SOURCE,
} from "@/features/attendance/data/attendance.data";

/** `weeklySchedule` eski ma'lumotlarda Map bo'lishi mumkin. */
const toPlainSchedule = (value) => {
  if (!value) return {};
  return value instanceof Map ? Object.fromEntries(value) : value;
};

const isTeacher = (user) =>
  user.role === "teacher" || (user.extraRoles ?? []).includes("teacher");

/**
 * Ish vaqti UCH rejimdan birida bo'ladi va ular BIR-BIRINI istisno qiladi:
 *
 *   role     — rol standarti (hech narsa kiritilmagan)
 *   custom   — shu xodimga qo'lda kiritilgan vaqt
 *   schedule — DARS JADVALIDAN hisoblanadi (faqat o'qituvchi)
 *
 * ⚠️ Rejimlar radio bilan tanlanadi, checkbox bilan EMAS: "maxsus jadval" va
 * "dars jadvalidan" bir vaqtda yoqilsa, qaysi biri amal qilishini ekrandan
 * o'qib bo'lmasdi.
 */
const MODES = {
  ROLE: "role",
  CUSTOM: "custom",
  SCHEDULE: "schedule",
};

const resolveInitialMode = (user) => {
  if (user.workTimeSource === WORK_TIME_SOURCE.SCHEDULE) return MODES.SCHEDULE;
  if (user.workStartTime && user.workEndTime) return MODES.CUSTOM;
  return MODES.ROLE;
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
    description="Ish vaqti qaysi manbadan olinishini tanlang."
  >
    <Content />
  </ResponsiveModal>
);

const ModeOption = ({ value, current, onSelect, title, description }) => (
  <label
    className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
      current === value
        ? "border-primary bg-primary/5"
        : "border-gray-200 hover:border-gray-300"
    }`}
  >
    <input
      type="radio"
      name="workTimeMode"
      className="mt-0.5 size-4"
      checked={current === value}
      onChange={() => onSelect(value)}
    />
    <span className="space-y-0.5">
      <span className="block text-sm font-medium text-gray-800">{title}</span>
      <span className="block text-xs text-gray-500">{description}</span>
    </span>
  </label>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: updateUser } = useUpdateUser();
  const canUseSchedule = isTeacher(user);

  const { state, setField } = useObjectState({
    mode: resolveInitialMode(user),
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

  // ⚠️ Har rejim TO'LIQ payload yuboradi: yarim to'ldirilgan yangilanish
  // xodimni "dars jadvalidan, lekin qo'lda kiritilgan vaqt bilan" degan
  // ikki manbali holatda qoldirardi.
  const buildPayload = () => {
    if (state.mode === MODES.SCHEDULE) {
      // Qo'lda kiritilgan vaqtlarga TEGILMAYDI: rejim qaytarilganda ular
      // joyida turishi kerak (server ham shunday ishlaydi).
      return { workTimeSource: WORK_TIME_SOURCE.SCHEDULE };
    }

    if (state.mode === MODES.CUSTOM) {
      return {
        workTimeSource: WORK_TIME_SOURCE.MANUAL,
        workStartTime: state.workStartTime,
        workEndTime: state.workEndTime,
        workDays: state.workDays,
        weeklySchedule: state.weeklySchedule,
      };
    }

    return {
      workTimeSource: WORK_TIME_SOURCE.MANUAL,
      workStartTime: null,
      workEndTime: null,
      workDays: [],
      weeklySchedule: {},
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      state.mode === MODES.CUSTOM &&
      (!state.workStartTime || !state.workEndTime)
    ) {
      return toast.warning("Boshlanish va tugash vaqtini kiriting");
    }

    setIsLoading(true);

    updateUser(
      { id: user.id, data: buildPayload() },
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
      <div className="space-y-2">
        <ModeOption
          value={MODES.ROLE}
          current={state.mode}
          onSelect={(mode) => setField("mode", mode)}
          title="Rol standarti"
          description="Xodim roli uchun belgilangan umumiy ish vaqti amal qiladi."
        />

        <ModeOption
          value={MODES.CUSTOM}
          current={state.mode}
          onSelect={(mode) => setField("mode", mode)}
          title="Maxsus ish jadvali"
          description="Shu xodim uchun alohida vaqt va ish kunlari."
        />

        {canUseSchedule && (
          <ModeOption
            value={MODES.SCHEDULE}
            current={state.mode}
            onSelect={(mode) => setField("mode", mode)}
            title="Dars jadvalidan (avtomatik)"
            description="Kunning birinchi darsi boshlanishi — ish boshlanishi, oxirgi darsi tugashi — ish tugashi. Darsi yo'q kun ish kuni sanalmaydi."
          />
        )}
      </div>

      {state.mode === MODES.SCHEDULE && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Ish vaqti dars jadvali o'zgarganda o'zi ham o'zgaradi — qo'lda
          yangilash shart emas. Jadvalda darsi bo'lmasa, xodimdan davomat talab
          qilinmaydi.
        </p>
      )}

      {state.mode === MODES.CUSTOM && (
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
