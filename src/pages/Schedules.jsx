import { useState, useEffect } from "react";
import { schedulesAPI, classesAPI, subjectsAPI, usersAPI } from "../api/client";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import Card from "@/components/Card";

const DAYS = [
  { value: "dushanba", label: "Dushanba" },
  { value: "seshanba", label: "Seshanba" },
  { value: "chorshanba", label: "Chorshanba" },
  { value: "payshanba", label: "Payshanba" },
  { value: "juma", label: "Juma" },
  { value: "shanba", label: "Shanba" },
];

const Schedules = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [daySubjects, setDaySubjects] = useState([
    { subject: "", teacher: "", order: 1 },
  ]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSchedules();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedClass(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error("Sinflarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Fanlarni yuklashda xatolik:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await usersAPI.getAll({ role: "teacher" });
      setTeachers(response.data.data);
    } catch (error) {
      console.error("O'qituvchilarni yuklashda xatolik:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await schedulesAPI.getByClass(selectedClass);
      setSchedules(response.data.data);
    } catch (error) {
      console.error("Jadvallarni yuklashda xatolik:", error);
    }
  };

  const handleOpenModal = (day, schedule = null) => {
    setSelectedDay(day);

    if (schedule) {
      // Object ID'larni olish (agar object bo'lsa, _id ni olish)
      const formattedSubjects = schedule.subjects.map((subj) => ({
        subject:
          typeof subj.subject === "object" ? subj.subject._id : subj.subject,
        teacher:
          typeof subj.teacher === "object" ? subj.teacher._id : subj.teacher,
        order: subj.order,
      }));
      setDaySubjects(formattedSubjects);
    } else {
      setDaySubjects([{ subject: "", teacher: "", order: 1 }]);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay("");
    setDaySubjects([
      { subject: "", teacher: "", order: 1, startTime: "", endTime: "" },
    ]);
  };

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
    // Order raqamlarini qayta hisoblash
    setDaySubjects(newSubjects.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateSubjectRow = (index, field, value) => {
    const newSubjects = [...daySubjects];
    newSubjects[index][field] = value;
    setDaySubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validatsiya
    const validSubjects = daySubjects.filter((s) => s.subject && s.teacher);

    if (validSubjects.length === 0) {
      toast.error("Kamida bitta fan va o'qituvchi tanlang");
      return;
    }

    try {
      await schedulesAPI.createOrUpdate({
        classId: selectedClass,
        day: selectedDay,
        subjects: validSubjects,
      });

      toast.success("Dars jadvali muvaffaqiyatli saqlandi");
      handleCloseModal();
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    try {
      await schedulesAPI.delete(scheduleId);
      toast.success("Jadval o'chirildi");
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const getScheduleForDay = (day) => {
    return schedules.find((s) => s.day === day);
  };

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {classes.map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.name + " sinf"}
          </option>
        ))}
      </select>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DAYS.map((day) => {
          const schedule = getScheduleForDay(day.value);

          return (
            <Card key={day.value}>
              <div className="flex justify-between items-start mb-4">
                {/*  */}
                <div className="flex items-center gap-3.5">
                  <Calendar
                    strokeWidth={1.5}
                    className="size-5 text-indigo-600"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {day.label}
                  </h3>
                </div>

                {/* Owner Controls */}
                {isOwner && (
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => handleOpenModal(day.value, schedule)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {schedule ? (
                        <Edit className="size-5" strokeWidth={1.5} />
                      ) : (
                        <Plus className="size-5" strokeWidth={1.5} />
                      )}
                    </button>
                    {schedule && (
                      <button
                        onClick={() => handleDeleteSchedule(schedule._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="size-5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {schedule ? (
                <div className="space-y-3">
                  {schedule.subjects.map((subj, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {index + 1}. {subj.subject?.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {subj.teacher?.firstName} {subj.teacher?.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Jadval yo'q
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {DAYS.find((d) => d.value === selectedDay)?.label} - Dars jadvali
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {daySubjects.map((subj, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3 px-4 py-2 rounded-t-lg bg-gray-100">
                    <h4 className="font-medium text-gray-900">
                      {index + 1}-dars
                    </h4>
                    {daySubjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 pt-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fan *
                      </label>
                      <select
                        value={subj.subject}
                        onChange={(e) =>
                          updateSubjectRow(index, "subject", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Fan tanlang</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        O'qituvchi *
                      </label>
                      <select
                        value={subj.teacher}
                        onChange={(e) =>
                          updateSubjectRow(index, "teacher", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">O'qituvchi tanlang</option>
                        {teachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.firstName} {teacher.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubjectRow}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
            >
              + Dars qo'shish
            </button>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Saqlash
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedules;
