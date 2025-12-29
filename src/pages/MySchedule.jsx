import { useState, useEffect } from "react";
import { schedulesAPI } from "../api/client";
import { toast } from "sonner";
import { Calendar, BookOpen } from "lucide-react";

const DAYS = [
  { value: "dushanba", label: "Dushanba" },
  { value: "seshanba", label: "Seshanba" },
  { value: "chorshanba", label: "Chorshanba" },
  { value: "payshanba", label: "Payshanba" },
  { value: "juma", label: "Juma" },
  { value: "shanba", label: "Shanba" },
];

const MySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    try {
      const response = await schedulesAPI.getTeacherSchedule();
      setSchedules(response.data.data);
      setTeacherId(response.data.teacherId);
    } catch (error) {
      toast.error("Jadvalni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Sinflar bo'yicha guruhlash
  const schedulesByClass = schedules.reduce((acc, schedule) => {
    const className = schedule.class.name;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(schedule);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Mening dars jadvalim
        </h1>
        <p className="text-gray-600 mt-1">
          Barcha sinflar bo'yicha haftalik jadval
        </p>
      </div>

      {Object.keys(schedulesByClass).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-500 text-lg">
            Sizga hali dars jadvali tayinlanmagan
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(schedulesByClass).map(
            ([className, classSchedules]) => (
              <div
                key={className}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    {className} sinf
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DAYS.map((day) => {
                      const daySchedule = classSchedules.find(
                        (s) => s.day === day.value
                      );
                      const lessons = daySchedule?.subjects || [];

                      return (
                        <div
                          key={day.value}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center mb-3">
                            <Calendar className="size-5 text-indigo-600 mr-2" strokeWidth={1.5} />
                            <h3 className="font-semibold text-gray-900">
                              {day.label}
                            </h3>
                          </div>

                          {lessons.length > 0 ? (
                            <div className="space-y-2">
                              {lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, idx) => {
                                  const isMyLesson =
                                    lesson.teacher._id === teacherId;
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                                        isMyLesson
                                          ? "bg-indigo-50 border-indigo-100"
                                          : "bg-gray-50 border-gray-200 opacity-50 select-none"
                                      }`}
                                    >
                                      <div className="flex items-center flex-1 min-w-0 gap-3">
                                        {/* Lesson order */}
                                        <span
                                          className={`flex items-center justify-center size-6 rounded-full text-xs flex-shrink-0 ${
                                            isMyLesson
                                              ? "bg-indigo-600 text-white"
                                              : "bg-gray-400 text-white"
                                          }`}
                                        >
                                          {lesson.order}
                                        </span>

                                        {/* Subject name */}
                                        <span
                                          className={`capitalize text-sm font-medium truncate ${
                                            isMyLesson
                                              ? "text-gray-900"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {lesson.subject.name}
                                        </span>
                                      </div>

                                      <p className="capitalize text-xs text-gray-400 mt-1 ml-6">
                                        {isMyLesson
                                          ? "Siz"
                                          : lesson.teacher.firstName +
                                            " " +
                                            lesson.teacher.lastName}
                                      </p>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Dars yo'q
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Summary */}
      {Object.keys(schedulesByClass).length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Xulosa</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Sinflar soni</p>
              <p className="text-2xl font-bold text-blue-900">
                {Object.keys(schedulesByClass).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Mening haftalik darslarim</p>
              <p className="text-2xl font-bold text-blue-900">
                {schedules.reduce(
                  (sum, s) =>
                    sum +
                    s.subjects.filter((subj) => subj.teacher._id === teacherId)
                      .length,
                  0
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Kunlik o'rtacha</p>
              <p className="text-2xl font-bold text-blue-900">
                {(
                  schedules.reduce(
                    (sum, s) =>
                      sum +
                      s.subjects.filter(
                        (subj) => subj.teacher._id === teacherId
                      ).length,
                    0
                  ) / 6
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySchedule;
