import { useState, useEffect } from "react";
import { gradesAPI, classesAPI, subjectsAPI, usersAPI } from "../api/client";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    classId: "",
    subjectId: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    student: "",
    subject: "",
    class: "",
    grade: 5,
    date: new Date().toISOString().split("T")[0],
    comment: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (filters.classId) {
      fetchStudents(filters.classId);
    }
  }, [filters.classId]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      const allClasses = response.data.data;

      // Teacher uchun faqat biriktirilgan sinflar
      if (user?.role === "teacher" && user?.assignedClasses) {
        const assignedClassIds = user.assignedClasses.map((c) => c._id);
        setClasses(allClasses.filter((c) => assignedClassIds.includes(c._id)));
      } else {
        setClasses(allClasses);
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

  const fetchStudents = async (classId) => {
    try {
      const response = await usersAPI.getAll({
        role: "student",
        class: classId,
      });
      setStudents(response.data.data);
    } catch (error) {
      console.error("O'quvchilarni yuklashda xatolik:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await gradesAPI.getAll(filters);
      setGrades(response.data.data);
    } catch (error) {
      toast.error("Baholarni yuklashda xatolik");
    }
  };

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        student: grade.student._id,
        subject: grade.subject._id,
        class: grade.class._id,
        grade: grade.grade,
        date: new Date(grade.date).toISOString().split("T")[0],
        comment: grade.comment || "",
      });
      if (grade.class._id) {
        fetchStudents(grade.class._id);
      }
    } else {
      setEditingGrade(null);
      setFormData({
        student: "",
        subject: "",
        class: filters.classId || "",
        grade: 5,
        date: new Date().toISOString().split("T")[0],
        comment: "",
      });
      if (filters.classId) {
        fetchStudents(filters.classId);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        studentId: formData.student,
        subjectId: formData.subject,
        classId: formData.class,
        grade: parseInt(formData.grade),
        date: formData.date,
        comment: formData.comment,
      };

      if (editingGrade) {
        await gradesAPI.update(editingGrade._id, data);
        toast.success("Baho muvaffaqiyatli yangilandi");
      } else {
        await gradesAPI.create(data);
        toast.success("Baho muvaffaqiyatli qo'yildi");
      }

      handleCloseModal();
      fetchGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (user?.role !== "owner") {
      toast.error("Faqat ega baho o'chira oladi");
      return;
    }

    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    try {
      await gradesAPI.delete(id);
      toast.success("Baho o'chirildi");
      fetchGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const canEdit = (grade) => {
    const gradeDate = new Date(grade.date);
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate - gradeDate) / (1000 * 60 * 60 * 24)
    );

    if (user?.role === "owner") return true;
    if (
      user?.role === "teacher" &&
      grade.teacher._id === user.id &&
      daysDiff <= 2
    )
      return true;

    return false;
  };

  const getGradeColor = (grade) => {
    if (grade === 5) return "bg-green-100 text-green-800";
    if (grade === 4) return "bg-blue-100 text-blue-800";
    if (grade === 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Baholar</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Baho qo'yish
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sinf
              </label>
              <select
                value={filters.classId}
                onChange={(e) =>
                  setFilters({ ...filters, classId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Barcha sinflar</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fan
              </label>
              <select
                value={filters.subjectId}
                onChange={(e) =>
                  setFilters({ ...filters, subjectId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Barcha fanlar</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dan
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gacha
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() => {
                setFilters({
                  classId: "",
                  subjectId: "",
                  startDate: "",
                  endDate: "",
                });
                fetchGrades();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Tozalash
            </button>
            <button
              onClick={fetchGrades}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Qidirish
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                O'quvchi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sinf
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Baho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sana
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                O'qituvchi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Harakatlar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grades.map((grade) => (
              <tr key={grade._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {grade.student?.firstName} {grade.student?.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {grade.class?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {grade.subject?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(
                      grade.grade
                    )}`}
                  >
                    {grade.grade}
                  </span>
                  {grade.isEdited && (
                    <span className="ml-2 text-xs text-gray-500">
                      (tahrirlangan)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(grade.date).toLocaleDateString("uz-UZ")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {grade.teacher?.firstName} {grade.teacher?.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {canEdit(grade) && (
                      <button
                        onClick={() => handleOpenModal(grade)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    {user?.role === "owner" && (
                      <button
                        onClick={() => handleDelete(grade._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {grades.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Baholar topilmadi</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrade ? "Bahoni tahrirlash" : "Baho qo'yish"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sinf *
              </label>
              <select
                required
                value={formData.class}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    class: e.target.value,
                    student: "",
                  });
                  fetchStudents(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O'quvchi *
              </label>
              <select
                required
                value={formData.student}
                onChange={(e) =>
                  setFormData({ ...formData, student: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!formData.class}
              >
                <option value="">O'quvchi tanlang</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fan *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Fan tanlang</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Baho *
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="5">5 - A'lo</option>
                  <option value="4">4 - Yaxshi</option>
                  <option value="3">3 - Qoniqarli</option>
                  <option value="2">2 - Qoniqarsiz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sana *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Baho haqida qo'shimcha ma'lumot"
              />
            </div>

            {editingGrade && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Faqat bugungi yoki 2 kun oldingi baholarni tahrirlash
                  mumkin
                </p>
              </div>
            )}

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
                {editingGrade ? "Saqlash" : "Qo'yish"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Grades;
