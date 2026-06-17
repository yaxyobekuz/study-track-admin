// Data
import { days } from "@/shared/data/days.data";

// Toast
import { toast } from "sonner";

// React
import { useState, useMemo } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { Trash2, Plus } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";
import { scheduleSettingsAPI } from "@/features/schedule-settings/api/scheduleSettings.api";

// Components
import Card from "@/shared/components/ui/Card";
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

const toLessonShape = (subj, index) => ({
  subject: typeof subj.subject === "object" ? subj.subject?._id : subj.subject,
  teacher: typeof subj.teacher === "object" ? subj.teacher?._id : subj.teacher,
  order: subj.order ?? index + 1,
  startTime: subj.startTime || "",
  endTime: subj.endTime || "",
});

/**
 * Shared form for editing the whole-week schedule of a single class.
 * @param {object} props
 * @param {string} props.classId
 * @param {Array} [props.initialSchedules] - existing schedules ([{ day, subjects }])
 */
const ScheduleForm = ({ classId, initialSchedules = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getCollectionData } = useArrayStore();
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  // Dars tartibi -> standart { startTime, endTime } sozlamalari
  const { data: settingsData } = useQuery({
    queryKey: ["schedule-settings"],
    queryFn: () => scheduleSettingsAPI.getSettings(),
  });

  const periodMap = useMemo(() => {
    const map = new Map();
    const periods = settingsData?.data?.data?.periods || [];
    for (const p of periods) {
      map.set(Number(p.order), { startTime: p.startTime, endTime: p.endTime });
    }
    return map;
  }, [settingsData]);

  const [week, setWeek] = useState(() => {
    const initial = {};
    for (const day of days) {
      const schedule = initialSchedules.find((s) => s.day === day.value);
      initial[day.value] = (schedule?.subjects || []).map(toLessonShape);
    }
    return initial;
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => schedulesAPI.saveClassSchedule(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules", "class", classId],
      });
      toast.success("Dars jadvali saqlandi");
      navigate(`/schedules/${classId}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const addLesson = (day) => {
    setWeek((prev) => {
      const lessons = prev[day];
      const nextOrder =
        Math.max(0, ...lessons.map((s) => Number(s.order) || 0)) + 1;
      const lesson = createEmptyLesson(nextOrder);
      // Sozlamada shu tartib uchun standart vaqtlar bo'lsa, avto to'ldiramiz
      const preset = periodMap.get(nextOrder);
      if (preset) {
        lesson.startTime = preset.startTime;
        lesson.endTime = preset.endTime;
      }
      return { ...prev, [day]: [...lessons, lesson] };
    });
  };

  const removeLesson = (day, index) => {
    setWeek((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateLesson = (day, index, field, value) => {
    setWeek((prev) => {
      const lessons = [...prev[day]];
      let updated = { ...lessons[index], [field]: value };

      // Dars tartibi o'zgarganda, sozlamadagi standart vaqtlarni avto to'ldiramiz
      if (field === "order") {
        const preset = periodMap.get(Number(value));
        if (preset) {
          updated = {
            ...updated,
            startTime: preset.startTime,
            endTime: preset.endTime,
          };
        }
      }

      lessons[index] = updated;
      return { ...prev, [day]: lessons };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = [];

    for (const day of days) {
      const validLessons = week[day.value].filter(
        (s) => s.subject && s.teacher,
      );

      // Order numbers must be unique within the day
      const orders = validLessons.map((s) => Number(s.order));
      if (new Set(orders).size !== orders.length) {
        return toast.error(
          `${day.label}: dars tartib raqamlari takrorlanmasligi kerak`,
        );
      }

      payload.push({
        day: day.value,
        subjects: validLessons.map((s) => ({ ...s, order: Number(s.order) })),
      });
    }

    if (payload.every((d) => d.subjects.length === 0)) {
      return toast.error("Kamida bitta kun uchun dars jadvali kiriting");
    }

    saveMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const lessons = week[day.value];

          return (
            <Card key={day.value} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {day.label}
              </h3>

              {lessons.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Bu kun uchun dars yo'q
                </p>
              )}

              {lessons.map((subj, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl"
                >
                  <div className="flex justify-between items-center px-4 py-2 rounded-t-lg bg-gray-100">
                    <h4 className="font-medium text-gray-900">
                      {index + 1}-dars
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeLesson(day.value, index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
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
                      onChange={(e) =>
                        updateLesson(day.value, index, "order", e.target.value)
                      }
                    />

                    <SelectField
                      required
                      searchable
                      label="Fan"
                      placeholder="Fanni tanlang"
                      value={subj.subject}
                      onChange={(v) =>
                        updateLesson(day.value, index, "subject", v)
                      }
                      options={subjects.map((s) => ({
                        label: s?.name,
                        value: s?._id,
                      }))}
                    />

                    <SelectField
                      required
                      searchable
                      className="col-span-2"
                      label="O'qituvchi"
                      placeholder="O'qituvchini tanlang"
                      value={subj.teacher}
                      onChange={(v) =>
                        updateLesson(day.value, index, "teacher", v)
                      }
                      options={teachers.map((t) => ({
                        value: t?._id,
                        label: t?.fullName,
                      }))}
                    />

                    <div className="grid grid-cols-2 gap-1.5 col-span-2">
                      <InputField
                        required
                        type="time"
                        label="Boshlanish vaqti"
                        value={subj.startTime}
                        onChange={(e) =>
                          updateLesson(
                            day.value,
                            index,
                            "startTime",
                            e.target.value,
                          )
                        }
                      />

                      <InputField
                        required
                        type="time"
                        label="Tugash vaqti"
                        value={subj.endTime}
                        onChange={(e) =>
                          updateLesson(
                            day.value,
                            index,
                            "endTime",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </InputGroup>
                </div>
              ))}

              {/* Add lesson button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => addLesson(day.value)}
                className="w-full border-2 border-dashed text-gray-600 hover:border-blue-500 hover:text-blue-500"
              >
                <Plus className="size-4" strokeWidth={1.5} />
                Dars qo'shish
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Action buttons (fixed bottom bar) */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-4 flex flex-col-reverse gap-3.5 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={() => navigate(`/schedules/${classId}`)}
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={saveMutation.isPending}>
          Saqlash
          {saveMutation.isPending && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
