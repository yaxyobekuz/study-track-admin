// UI
import { toast } from "sonner";

// API
import { gradesAPI, schedulesAPI } from "../api/client";

// React
import { useState, useEffect } from "react";

// Components
import Card from "@/components/Card";
import Select from "@/components/form/select";

// Helpers
import { getGradeColor } from "@/helpers/grade.helpers";

// Hooks
import useObjectStore from "@/hooks/useObjectStore.hook";

// Icons
import { CalendarOff, Trash2, Loader2 } from "lucide-react";
import Button from "@/components/form/button";

const AddGrade = () => {
  const [todayClasses, setTodayClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudentId, setLoadingStudentId] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjectWithOrder, setSelectedSubjectWithOrder] = useState(""); // Format: "subjectId_order"

  // Holiday Info
  const { getEntity } = useObjectStore("holidayCheck");
  const holidayInfo = getEntity("today") || { isHoliday: false, holiday: null };

  // Fetch today's classes from schedule
  useEffect(() => {
    schedulesAPI
      .getMyToday()
      .then((res) => {
        const classes = res.data.data.map((schedule) => schedule.class);
        setTodayClasses(classes);
      })
      .catch((error) => {
        toast.error("Bugungi dars jadvalini yuklashda xatolik");
        console.error(error);
      });
  }, []);

  // Load saved selections from localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem("addGrade_selectedClass");
    const savedSubjectWithOrder = localStorage.getItem(
      "addGrade_selectedSubjectWithOrder",
    );

    if (savedClass) setSelectedClass(savedClass);
    if (savedSubjectWithOrder)
      setSelectedSubjectWithOrder(savedSubjectWithOrder);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTeacherSubjects();
      setSelectedSubjectWithOrder("");
      setStudents([]);
      localStorage.setItem("addGrade_selectedClass", selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubjectWithOrder) {
      fetchStudentsWithGrades();
      localStorage.setItem(
        "addGrade_selectedSubjectWithOrder",
        selectedSubjectWithOrder,
      );
    }
  }, [selectedClass, selectedSubjectWithOrder]);

  const fetchTeacherSubjects = async () => {
    try {
      const response = await gradesAPI.getTeacherSubjects(selectedClass);
      if (response.data.message && response.data.data.length === 0) {
        toast.info(response.data.message);
      }
      const data = response.data.data;
      setSubjects(data);

      // Auto-select first subject
      if (data.length > 0) {
        setSelectedSubjectWithOrder(`${data[0]._id}_${data[0].order}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fanlarni yuklashda xatolik",
      );
      console.error(error);
    }
  };

  const fetchStudentsWithGrades = async (showLoader = true) => {
    if (!selectedSubjectWithOrder) return;

    // Parse subjectId and lessonOrder from "subjectId_order" format
    const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

    if (showLoader) setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await gradesAPI.getStudentsWithGrades({
        classId: selectedClass,
        subjectId: subjectId,
        lessonOrder: lessonOrder,
        date: today,
      });
      setStudents(response.data.data);
      setCurrentTopic(response.data.currentTopic || null);
    } catch (error) {
      toast.error("O'quvchilarni yuklashda xatolik");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = async (student, gradeValue) => {
    if (gradeValue === "") return;

    const hasGrade = student.grade !== null;
    const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

    setLoadingStudentId(student._id);
    try {
      if (hasGrade) {
        await gradesAPI.update(student.grade._id, {
          grade: parseInt(gradeValue),
          comment: student.grade.comment || "",
        });
        toast.success("Baho muvaffaqiyatli yangilandi");
      } else {
        await gradesAPI.create({
          studentId: student._id,
          subjectId,
          classId: selectedClass,
          lessonOrder: parseInt(lessonOrder),
          grade: parseInt(gradeValue),
          comment: "",
        });
        toast.success("Baho muvaffaqiyatli qo'yildi");
      }

      await fetchStudentsWithGrades(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleDeleteGrade = async (student) => {
    setLoadingStudentId(student._id);
    try {
      await gradesAPI.delete(student.grade._id);
      toast.success("Baho muvaffaqiyatli o'chirildi");
      await fetchStudentsWithGrades(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
    } finally {
      setLoadingStudentId(null);
    }
  };

  if (holidayInfo.isHoliday) {
    return (
      <Card className="text-center py-12">
        <CalendarOff
          className="w-16 h-16 text-orange-500 mx-auto mb-4"
          strokeWidth={1.5}
        />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Bugun dam olish kuni
        </h2>
        <p className="text-gray-600 mb-2 font-medium">
          {holidayInfo.holiday?.name}
        </p>
        {holidayInfo.holiday?.description && (
          <p className="text-gray-500 text-sm">
            {holidayInfo.holiday.description}
          </p>
        )}
        <p className="text-orange-600 mt-4">
          Dam olish kunlarida baho qo'yish mumkin emas
        </p>
      </Card>
    );
  }

  return (
    <div>
      {/* Filters */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          required
          label="Sinf"
          value={selectedClass}
          onChange={(value) => setSelectedClass(value)}
          options={todayClasses.map((cls) => ({
            label: cls.name,
            value: cls._id,
          }))}
        />

        <Select
          required
          label="Fan"
          value={selectedSubjectWithOrder}
          onChange={(value) => setSelectedSubjectWithOrder(value)}
          options={subjects.map((subject) => {
            const displayOrder =
              (subject.startingOrder || 1) + (subject.order || 1) - 1;
            return {
              label: `${displayOrder}. ${subject.name}`,
              value: `${subject._id}_${subject.order}`,
            };
          })}
        />
      </Card>

      {/* Current Topic Display */}
      {selectedClass && selectedSubjectWithOrder && currentTopic && (
        <Card className="mb-4 space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentTopic.name}
          </h3>

          {currentTopic.description && (
            <p className="text-gray-600">{currentTopic.description}</p>
          )}
        </Card>
      )}

      {/* Students Table */}
      {selectedClass && selectedSubjectWithOrder && (
        <Card responsive>
          <div className="bg-white rounded-lg overflow-hidden">
            {/* No data */}
            {students.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">Bu sinfda o'quvchilar yo'q</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">Yuklanmoqda...</p>
              </div>
            )}

            {/* Students Table */}
            {students.length > 0 && !loading && (
              <div className="rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Thead */}
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left max-sm:hidden">#</th>
                      <th className="px-6 py-3 text-left">O'quvchi</th>
                      <th className="px-6 py-3 text-left">Baho</th>
                    </tr>
                  </thead>

                  {/* Tbody */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => {
                      const hasGrade = student.grade !== null;
                      const isRowLoading = loadingStudentId === student._id;

                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          {/* Index */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-sm:hidden">
                            {index + 1}
                          </td>

                          {/* Student */}
                          <td className="px-4 py-4 whitespace-nowrap xs:px-6">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} <br className="xs:hidden" />{" "}
                              {student.lastName}
                            </div>
                          </td>

                          {/* Grade */}
                          <td className="px-6 py-4 whitespace-nowrap max-sm:pl-0">
                            <div className="flex items-center gap-2">
                              {isRowLoading ? (
                                <div className="flex items-center justify-center w-40 h-10">
                                  <Loader2
                                    className="size-6 text-indigo-600 animate-spin"
                                    strokeWidth={2}
                                  />
                                </div>
                              ) : (
                                <>
                                  <Select
                                    size="md"
                                    value={
                                      hasGrade
                                        ? String(student.grade.grade)
                                        : ""
                                    }
                                    onChange={(value) =>
                                      handleGradeChange(student, value)
                                    }
                                    className="w-40"
                                    disabled={isRowLoading}
                                    placeholder="Bahoni tanlang"
                                    triggerClassName={
                                      hasGrade
                                        ? getGradeColor(student.grade.grade)
                                        : ""
                                    }
                                    options={[
                                      { label: "5 - A'lo", value: "5" },
                                      { label: "4 - Yaxshi", value: "4" },
                                      { label: "3 - Qoniqarli", value: "3" },
                                      { label: "2 - Qoniqarsiz", value: "2" },
                                      { label: "1 - Yomon", value: "1" },
                                    ]}
                                  />

                                  {hasGrade && (
                                    <Button
                                      variant="danger"
                                      className="size-10"
                                      disabled={isRowLoading}
                                      onClick={() => handleDeleteGrade(student)}
                                    >
                                      <Trash2
                                        className="size-4"
                                        strokeWidth={1.5}
                                      />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {!selectedClass && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            Baho qo'yish uchun sinf va fan tanlang
          </p>
        </div>
      )}
    </div>
  );
};

export default AddGrade;
