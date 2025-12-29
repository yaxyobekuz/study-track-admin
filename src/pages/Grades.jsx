import { useState, useEffect } from "react";
import { gradesAPI, classesAPI, subjectsAPI, schedulesAPI } from "../api/client";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";
import { Filter, Eye, Calendar } from "lucide-react";

const Grades = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [todaySubjects, setTodaySubjects] = useState([]); // Bugungi kun fanlar
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Load saved filters from localStorage
  const getSavedFilters = () => {
    const savedClassId = localStorage.getItem("grades_classId");
    const savedSubjectId = localStorage.getItem("grades_subjectId");
    const savedDate = localStorage.getItem("grades_date");
    
    return {
      classId: savedClassId || "",
      subjectId: savedSubjectId || "",
      date: savedDate || new Date().toISOString().split("T")[0],
    };
  };

  const [filters, setFilters] = useState(getSavedFilters());

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("grades_classId", filters.classId);
    localStorage.setItem("grades_subjectId", filters.subjectId);
    localStorage.setItem("grades_date", filters.date);
  }, [filters]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (filters.classId && filters.date) {
      fetchGradesByClass();
      fetchTodaySubjects();
    }
  }, [filters.classId, filters.date]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      const allClasses = response.data.data || [];
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Sinflarni yuklashda xatolik");
      setClasses([]);
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

  const fetchTodaySubjects = async () => {
    try {
      const date = new Date(filters.date);
      const daysUz = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
      const dayName = daysUz[date.getDay()];

      if (dayName === "yakshanba") {
        setTodaySubjects([]);
        return;
      }

      const response = await schedulesAPI.getByDay(filters.classId, dayName);
      if (response.data.data && response.data.data.subjects) {
        // Extract unique subjects from schedule
        const scheduleSubjects = response.data.data.subjects
          .filter(s => s.subject)
          .map(s => s.subject);
        setTodaySubjects(scheduleSubjects);
      } else {
        setTodaySubjects([]);
      }
    } catch (error) {
      console.error("Bugungi fanlarni yuklashda xatolik:", error);
      setTodaySubjects([]);
    }
  };

  const fetchGradesByClass = async () => {
    setLoading(true);
    try {
      const response = await gradesAPI.getByClassAndDate(
        filters.classId,
        filters.date
      );

      // Group grades by student
      const gradesByStudent = {};
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach((grade) => {
          const studentId = grade.student._id;
          if (!gradesByStudent[studentId]) {
            gradesByStudent[studentId] = {
              student: grade.student,
              grades: [],
            };
          }
          gradesByStudent[studentId].grades.push(grade);
        });
      }

      setStudents(Object.values(gradesByStudent));
    } catch (error) {
      toast.error("Baholarni yuklashda xatolik");
      console.error(error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeForSubject = (studentGrades, subjectId) => {
    if (!subjectId) return null;
    return studentGrades.find((g) => g.subject._id === subjectId);
  };

  const getGradeColor = (grade) => {
    if (grade === 5) return "bg-green-100 text-green-800 border-green-300";
    if (grade === 4) return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade === 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const calculateAverage = (grades) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  if (loading && !filters.classId) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Baholar Jurnali</h1>
          <p className="text-gray-600 mt-1">
            Sinf bo'yicha baholarni ko'rish va monitoring qilish
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="size-5 mr-2" strokeWidth={1.5} />
          {showFilters ? "Filterni yashirish" : "Filterni ko'rsatish"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf *
              </label>
              <select
                value={filters.classId}
                onChange={(e) =>
                  setFilters({ ...filters, classId: e.target.value })
                }
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
                Fan (Ixtiyoriy)
              </label>
              <select
                value={filters.subjectId}
                onChange={(e) =>
                  setFilters({ ...filters, subjectId: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sana *
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Grades View */}
      {!filters.classId ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-blue-800 text-lg">
            Baholarni ko'rish uchun sinf va sana tanlang
          </p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Yuklanmoqda...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-500">Tanlangan kun uchun baholar topilmadi</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {classes.find((c) => c._id === filters.classId)?.name} - Baholar
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sana: {new Date(filters.date).toLocaleDateString("uz-UZ")}
              {filters.subjectId &&
                ` • Fan: ${
                  subjects.find((s) => s._id === filters.subjectId)?.name
                }`}
              {!filters.subjectId && todaySubjects.length === 0 && (
                <span className="text-amber-600 font-medium"> • Tanlangan kun uchun dars jadvali topilmadi</span>
              )}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50">
                    O'quvchi
                  </th>
                  {filters.subjectId ? (
                    <>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Baho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Izoh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        O'qituvchi
                      </th>
                    </>
                  ) : (
                    <>
                      {todaySubjects.map((subject) => (
                        <th
                          key={subject._id}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {subject.name}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                        O'rtacha
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((studentData, index) => {
                  const relevantGrades = filters.subjectId
                    ? studentData.grades.filter(
                        (g) => g.subject._id === filters.subjectId
                      )
                    : studentData.grades;

                  return (
                    <tr
                      key={studentData.student._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky left-0 bg-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap sticky left-12 bg-white">
                        <div className="text-sm font-medium text-gray-900">
                          {studentData.student.firstName}{" "}
                          {studentData.student.lastName}
                        </div>
                      </td>

                      {filters.subjectId ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {relevantGrades.length > 0 ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                  relevantGrades[0].grade
                                )}`}
                              >
                                {relevantGrades[0].grade}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {relevantGrades.length > 0 &&
                            relevantGrades[0].comment ? (
                              <span className="text-sm text-gray-600">
                                {relevantGrades[0].comment}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {relevantGrades.length > 0 ? (
                              <span className="text-sm text-gray-600">
                                {relevantGrades[0].teacher.firstName}{" "}
                                {relevantGrades[0].teacher.lastName}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          {todaySubjects.map((subject) => {
                            const grade = getGradeForSubject(
                              studentData.grades,
                              subject._id
                            );
                            return (
                              <td
                                key={subject._id}
                                className="px-4 py-4 whitespace-nowrap text-center"
                              >
                                {grade ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                      grade.grade
                                    )}`}
                                    title={
                                      grade.comment
                                        ? `Izoh: ${grade.comment}`
                                        : ""
                                    }
                                  >
                                    {grade.grade}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                            {studentData.grades.length > 0 ? (
                              <span className="text-sm font-semibold text-blue-900">
                                {calculateAverage(studentData.grades)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Jami {students.length} ta o'quvchi
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
