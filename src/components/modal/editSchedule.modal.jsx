// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { Trash2 } from "lucide-react";

// API
import { schedulesAPI } from "@/api/client";

// Components
import Button from "../form/button";
import Select from "../form/select";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

const EditScheduleModal = () => (
  <ResponsiveModal name="editSchedule" title="Dars jadvalini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  day,
  close,
  classId,
  isLoading,
  setIsLoading,
  ...scheduleData
}) => {
  const { invalidateCacheByStartsName, getCollectionData } =
    useArrayStore("schedules");
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  const [daySubjects, setDaySubjects] = useState(() => {
    if (scheduleData.subjects && scheduleData.subjects.length > 0) {
      return scheduleData.subjects.map((subj) => ({
        subject:
          typeof subj.subject === "object" ? subj.subject._id : subj.subject,
        teacher:
          typeof subj.teacher === "object" ? subj.teacher._id : subj.teacher,
        order: subj.order,
      }));
    }
    return [{ subject: "", teacher: "", order: 1 }];
  });

  const addSubjectRow = () => {
    setDaySubjects([
      ...daySubjects,
      {
        subject: "",
        teacher: "",
        order: daySubjects.length + 1,
      },
    ]);
  };

  const removeSubjectRow = (index) => {
    const newSubjects = daySubjects.filter((_, i) => i !== index);
    setDaySubjects(newSubjects.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateSubjectRow = (index, field, value) => {
    const newSubjects = [...daySubjects];
    newSubjects[index][field] = value;
    setDaySubjects(newSubjects);
  };

  const handleEditSchedule = (e) => {
    e.preventDefault();

    const validSubjects = daySubjects.filter((s) => s.subject && s.teacher);

    if (validSubjects.length === 0) {
      return toast.error("Kamida bitta fan va o'qituvchi tanlang");
    }

    setIsLoading(true);

    schedulesAPI
      .createOrUpdate({
        day,
        classId,
        subjects: validSubjects,
      })
      .then(() => {
        close();
        invalidateCacheByStartsName();
        toast.success("Dars jadvali yangilandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditSchedule} className="space-y-3.5">
      <div className="space-y-4">
        {daySubjects.map((subj, index) => (
          <div key={index} className="border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center px-4 py-2 rounded-t-lg bg-gray-100">
              <h4 className="font-medium text-gray-900">{index + 1}-dars</h4>
              {daySubjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubjectRow(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-1.5">
              <Select
                required
                label="Fan"
                value={subj.subject}
                onChange={(v) => updateSubjectRow(index, "subject", v)}
                options={subjects.map((s) => ({ label: s.name, value: s._id }))}
              />

              <Select
                required
                label="O'qituvchi"
                value={subj.teacher}
                onChange={(v) => updateSubjectRow(index, "teacher", v)}
                options={teachers.map((t) => ({
                  label: `${t.firstName} ${t.lastName}`,
                  value: t._id,
                }))}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add subject button */}
      <button
        type="button"
        onClick={addSubjectRow}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
      >
        + Dars qo'shish
      </button>

      {/* Action buttons */}
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

export default EditScheduleModal;
