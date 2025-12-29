import { useState, useEffect } from "react";
import { gradesAPI, classesAPI, usersAPI } from "../api/client";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";
import { Save, Edit2, Check, X } from "lucide-react";
import Card from "@/components/Card";

const AddGrade = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [tempGrade, setTempGrade] = useState({ grade: 5, comment: "" });

  // Load saved selections from localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem("addGrade_selectedClass");
    const savedSubject = localStorage.getItem("addGrade_selectedSubject");

    if (savedClass) setSelectedClass(savedClass);
    if (savedSubject) setSelectedSubject(savedSubject);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTeacherSubjects();
      setSelectedSubject("");
      setStudents([]);
      localStorage.setItem("addGrade_selectedClass", selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudentsWithGrades();
      localStorage.setItem("addGrade_selectedSubject", selectedSubject);
    }
  }, [selectedClass, selectedSubject]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      const allClasses = response.data.data || [];
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Sinflarni yuklashda xatolik");
      setClasses([]);
    }
  };

  const fetchTeacherSubjects = async () => {
    try {
      const response = await gradesAPI.getTeacherSubjects(selectedClass);
      if (response.data.message && response.data.data.length === 0) {
        toast.info(response.data.message);
      }
      setSubjects(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fanlarni yuklashda xatolik"
      );
      console.error(error);
    }
  };

  const fetchStudentsWithGrades = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await gradesAPI.getStudentsWithGrades({
        classId: selectedClass,
        subjectId: selectedSubject,
        date: today,
      });
      setStudents(response.data.data);
    } catch (error) {
      toast.error("O'quvchilarni yuklashda xatolik");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditGrade = async (studentId, isEdit = false) => {
    try {
      const data = {
        studentId,
        subjectId: selectedSubject,
        classId: selectedClass,
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

  const getGradeColor = (grade) => {
    if (grade === 5) return "bg-green-100 text-green-800 border-green-300";
    if (grade === 4) return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade === 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Baho qo'yish</h1>
        <p className="text-gray-600">
          Sinf va fan tanlab, o'quvchilarga baho qo'ying (faqat bugungi kun
          uchun)
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            📅{" "}
            {new Date().toLocaleDateString("uz-UZ", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sinf *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Sinf tanlang</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fan *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass || subjects.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Fan tanlang</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {selectedClass && subjects.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                Bugun bu sinfda sizning darslaringiz yo'q
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Students Table */}
      {selectedClass && selectedSubject && (
        <Card>
          <div className="bg-white rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Yuklanmoqda...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Bu sinfda o'quvchilar yo'q</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      O'quvchi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Baho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Izoh
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harakatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => {
                    const isEditing = editingStudentId === student._id;
                    const hasGrade = student.grade !== null;

                    return (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
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
                            </select>
                          ) : hasGrade ? (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                student.grade.grade
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
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempGrade.comment}
                              onChange={(e) =>
                                setTempGrade({
                                  ...tempGrade,
                                  comment: e.target.value,
                                })
                              }
                              placeholder="Izoh (ixtiyoriy)"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          ) : hasGrade && student.grade.comment ? (
                            <div className="text-sm text-gray-600">
                              {student.grade.comment}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
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
                                  className="w-4 h-4 mr-1"
                                  strokeWidth={1.5}
                                />
                                Saqlash
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                              >
                                <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                Bekor
                              </button>
                            </div>
                          ) : (
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
                                    className="w-4 h-4 mr-1"
                                    strokeWidth={1.5}
                                  />
                                  Tahrirlash
                                </>
                              ) : (
                                <>
                                  <Save
                                    className="w-4 h-4 mr-1"
                                    strokeWidth={1.5}
                                  />
                                  Baho qo'yish
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
