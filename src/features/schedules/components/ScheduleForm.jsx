// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Icons
import { Trash2 } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

const createEmptyLesson = (order) => ({
  subject: "",
  teacher: "",
  order,
  startTime: "",
  endTime: "",
});

/**
 * Shared form for creating and editing a class schedule for a single day.
 * @param {object} props
 * @param {"create"|"edit"} props.mode
 * @param {string} props.classId
 * @param {string} props.day - day key (e.g. "dushanba")
 * @param {Array} [props.initialSubjects] - existing lessons for edit mode
 */
const ScheduleForm = ({ mode, classId, day, initialSubjects = [] }) => {
  const navigate = useNavigate();
  const { invalidateCacheByStartsName, getCollectionData } =
    useArrayStore("schedules");
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  const [isLoading, setIsLoading] = useState(false);
  const [daySubjects, setDaySubjects] = useState(() => {
    if (initialSubjects.length > 0) {
      return initialSubjects.map((subj, index) => ({
        subject:
          typeof subj.subject === "object" ? subj.subject?._id : subj.subject,
        teacher:
          typeof subj.teacher === "object" ? subj.teacher?._id : subj.teacher,
        order: subj.order ?? index + 1,
        startTime: subj.startTime || "",
        endTime: subj.endTime || "",
      }));
    }
    return [createEmptyLesson(1)];
  });

  const addLesson = () => {
    const nextOrder =
      Math.max(0, ...daySubjects.map((s) => Number(s.order) || 0)) + 1;
    setDaySubjects([...daySubjects, createEmptyLesson(nextOrder)]);
  };

  const removeLesson = (index) => {
    setDaySubjects(daySubjects.filter((_, i) => i !== index));
  };

  const updateLesson = (index, field, value) => {
    const newSubjects = [...daySubjects];
    newSubjects[index][field] = value;
    setDaySubjects(newSubjects);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validSubjects = daySubjects.filter((s) => s.subject && s.teacher);

    if (validSubjects.length === 0) {
      return toast.error("Kamida bitta fan va o'qituvchi tanlang");
    }

    // Order numbers must be unique within the day
    const orders = validSubjects.map((s) => Number(s.order));
    if (new Set(orders).size !== orders.length) {
      return toast.error("Dars tartib raqamlari takrorlanmasligi kerak");
    }

    setIsLoading(true);

    schedulesAPI
      .createOrUpdate({
        day,
        classId,
        subjects: validSubjects.map((s) => ({ ...s, order: Number(s.order) })),
      })
      .then(() => {
        invalidateCacheByStartsName();
        toast.success(
          mode === "edit"
            ? "Dars jadvali yangilandi"
            : "Dars jadvali yaratildi",
        );
        navigate("/schedules");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-4">
        {daySubjects.map((subj, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center px-4 py-2 rounded-t-lg bg-gray-100">
              <h4 className="font-medium text-gray-900">{index + 1}-dars</h4>
              {daySubjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLesson(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            <InputGroup className="grid-cols-2 p-1.5">
              <InputField
                min={1}
                max={100}
                required
                type="number"
                label="Dars tartibi"
                placeholder="1, 2, 3, ..."
                value={subj.order}
                onChange={(e) => updateLesson(index, "order", e.target.value)}
              />

              <SelectField
                required
                label="Fan"
                value={subj.subject}
                onChange={(v) => updateLesson(index, "subject", v)}
                options={subjects.map((s) => ({
                  label: s?.name,
                  value: s?._id,
                }))}
              />

              <SelectField
                required
                label="O'qituvchi"
                value={subj.teacher}
                onChange={(v) => updateLesson(index, "teacher", v)}
                options={teachers.map((t) => ({
                  value: t?._id,
                  label: t?.fullName,
                }))}
              />

              <div className="grid grid-cols-2 gap-1.5">
                <InputField
                  required
                  type="time"
                  label="Boshlanish vaqti"
                  value={subj.startTime}
                  onChange={(e) =>
                    updateLesson(index, "startTime", e.target.value)
                  }
                />

                <InputField
                  required
                  type="time"
                  label="Tugash vaqti"
                  value={subj.endTime}
                  onChange={(e) =>
                    updateLesson(index, "endTime", e.target.value)
                  }
                />
              </div>
            </InputGroup>
          </div>
        ))}
      </div>

      {/* Add lesson button */}
      <Button
        type="button"
        variant="outline"
        onClick={addLesson}
        className="w-full border-2 border-dashed text-gray-600 hover:border-blue-500 hover:text-blue-500"
      >
        + Dars qo'shish
      </Button>

      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={() => navigate("/schedules")}
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={isLoading}>
          {mode === "edit" ? "Yangilash" : "Yaratish"}
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
