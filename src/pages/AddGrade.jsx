// UI
import { toast } from "sonner";

// API
import { gradesAPI } from "../api/client";

// React
import { useState, useEffect } from "react";

// Components
import Card from "@/components/Card";
import Select from "@/components/form/select";

// Helpers
import { getGradeColor } from "@/helpers/grade.helpers";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectStore from "@/hooks/useObjectStore.hook";

// Icons
import { Check, Edit2, Save, X, CalendarOff, Trash2 } from "lucide-react";

const AddGrade = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjectWithOrder, setSelectedSubjectWithOrder] = useState(""); // Format: "subjectId_order"
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [tempGrade, setTempGrade] = useState({ grade: 5, comment: "" });

  // Holiday Info
  const { getEntity } = useObjectStore("holidayCheck");
  const holidayInfo = getEntity("today") || { isHoliday: false, holiday: null };

  const { data: classes } = useArrayStore("classes");

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
      setSubjects(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fanlarni yuklashda xatolik",
      );
      console.error(error);
    }
  };

  const fetchStudentsWithGrades = async () => {
    if (!selectedSubjectWithOrder) return;

    // Parse subjectId and lessonOrder from "subjectId_order" format
    const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

    setLoading(true);
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

  const handleAddOrEditGrade = async (studentId, isEdit = false) => {
    try {
      // Parse subjectId and lessonOrder from "subjectId_order" format
      const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

      const data = {
        studentId,
        subjectId: subjectId,
        classId: selectedClass,
        lessonOrder: parseInt(lessonOrder),
        grade: parseInt(tempGrade.grade),
        comment: tempGrade.comment,
      };

      if (isEdit) {
        const student = students.find((s) => s._id === studentId);
        await gradesAPI.update(student.grade._id, {
          grade: parseInt(tempGrade.grade),
          comment: tempGrade.comment,
        });
        toast.success("Baho muvaffaqiyatli yangilandi");
      } else {
        await gradesAPI.create(data);
        toast.success("Baho muvaffaqiyatli qo'yildi");
      }

      setEditingStudentId(null);
      setTempGrade({ grade: 5, comment: "" });
      fetchStudentsWithGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
    }
  };

  const startEditing = (student) => {
    setEditingStudentId(student._id);
    if (student.grade) {
      setTempGrade({
        grade: student.grade.grade,
        comment: student.grade.comment || "",
      });
    } else {
      setTempGrade({ grade: 5, comment: "" });
    }
  };

  const cancelEditing = () => {
    setEditingStudentId(null);
    setTempGrade({ grade: 5, comment: "" });
  };

  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm("Bahoni o'chirishni tasdiqlaysizmi?")) {
      return;
    }

    try {
      await gradesAPI.delete(gradeId);
      toast.success("Baho muvaffaqiyatli o'chirildi");
      fetchStudentsWithGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
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
          options={classes.map((cls) => ({
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
            const displayOrder = (subject.startingOrder || 1) + (subject.order || 1) - 1;
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
                      <th className="px-6 py-3 text-left">#</th>
                      <th className="px-6 py-3 text-left">O'quvchi</th>
                      <th className="px-6 py-3 text-left">Baho</th>
                      <th className="px-6 py-3 text-right">Harakatlar</th>
                    </tr>
                  </thead>

                  {/* Tbody */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => {
                      const isEditing = editingStudentId === student._id;
                      const hasGrade = student.grade !== null;

                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          {/* Index */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>

                          {/* Student */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </td>

                          {/* Grade */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                value={tempGrade.grade}
                                onChange={(e) =>
                                  setTempGrade({
                                    ...tempGrade,
                                    grade: e.target.value,
                                  })
                                }
                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="5">5 - A'lo</option>
                                <option value="4">4 - Yaxshi</option>
                                <option value="3">3 - Qoniqarli</option>
                                <option value="2">2 - Qoniqarsiz</option>
                                <option value="1">1 - Yomon</option>
                              </select>
                            ) : hasGrade ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                  student.grade.grade,
                                )}`}
                              >
                                {student.grade.grade}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Baho yo'q
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isEditing ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() =>
                                    handleAddOrEditGrade(student._id, hasGrade)
                                  }
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  <Check
                                    className="size-4 mr-1"
                                    strokeWidth={1.5}
                                  />
                                  Saqlash
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                  <X
                                    className="size-4 mr-1"
                                    strokeWidth={1.5}
                                  />
                                  Bekor
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => startEditing(student)}
                                  className={`inline-flex items-center px-3 py-1.5 ${
                                    hasGrade
                                      ? "bg-yellow-600 hover:bg-yellow-700"
                                      : "bg-indigo-600 hover:bg-indigo-700"
                                  } text-white rounded-lg`}
                                >
                                  {hasGrade ? (
                                    <>
                                      <Edit2
                                        className="size-4 mr-1"
                                        strokeWidth={1.5}
                                      />
                                      Tahrirlash
                                    </>
                                  ) : (
                                    <>
                                      <Save
                                        className="size-4 mr-1"
                                        strokeWidth={1.5}
                                      />
                                      Baho qo'yish
                                    </>
                                  )}
                                </button>

                                {hasGrade && (
                                  <button
                                    onClick={() => handleDeleteGrade(student.grade._id)}
                                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                  >
                                    <Trash2
                                      className="size-4 mr-1"
                                      strokeWidth={1.5}
                                    />
                                    O'chirish
                                  </button>
                                )}
                              </div>
                            )}
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
