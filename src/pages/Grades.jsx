// Toast
import { toast } from "sonner";

// Helpers
import {
  getGradeColor,
  getGradeForSubject,
  calculateAverageGrade,
} from "@/helpers/grade.helpers";

// React
import { useState, useEffect } from "react";

// Icons
import { Eye, Calendar } from "lucide-react";

// Components
import Card from "@/components/Card";
import Input from "@/components/form/input";
import Select from "@/components/form/select";

// Utils
import { getDayOfWeekUZ } from "@/utils/date.utils";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

// API
import { gradesAPI, schedulesAPI } from "../api/client";

const Grades = () => {
  // Load saved filters from localStorage
  const getSavedFilters = () => {
    const savedClassId = localStorage.getItem("grades_classId");
    const savedSubjectId = localStorage.getItem("grades_subjectId");
    const savedDate = localStorage.getItem("grades_date");

    return {
      classId: savedClassId || "",
      subjectId: savedSubjectId || "all",
      date: savedDate || new Date().toISOString().split("T")[0],
    };
  };

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();
  const [filters, setFilters] = useState(getSavedFilters());

  // Classes and subjects data
  const classes = getCollectionData("classes");
  const subjects = getCollectionData("subjects");
  // Students data
  const studentsCollectionName = `students-${filters.classId}-${filters.date}`;
  const students = getCollectionData(studentsCollectionName);
  const isLoading = isCollectionLoading(studentsCollectionName);
  // Today's subjects data
  const todaySubjectsCollectionName = `subjects-${filters.classId}-${filters.date}`;
  const todaySubjects = getCollectionData(todaySubjectsCollectionName);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("grades_classId", filters.classId);
    localStorage.setItem("grades_subjectId", filters.subjectId);
    localStorage.setItem("grades_date", filters.date);
  }, [filters]);

  useEffect(() => {
    // Initialize collections (pagination = false)
    if (!hasCollection(studentsCollectionName))
      initialize(false, studentsCollectionName);
    if (!hasCollection(todaySubjectsCollectionName))
      initialize(false, todaySubjectsCollectionName);

    // Fetch grades and today's subjects
    if (
      filters.classId &&
      filters.date &&
      !students?.length &&
      !todaySubjects?.length
    ) {
      fetchGradesByClass();
      fetchTodaySubjects();
    }
  }, [filters.classId, filters.date]);

  const fetchTodaySubjects = () => {
    const dayName = getDayOfWeekUZ(filters.date);
    if (dayName === "yakshanba") {
      return setCollection([], null, todaySubjectsCollectionName);
    }

    schedulesAPI
      .getByDay(filters.classId, dayName)
      .then((response) => {
        if (response.data.data && response.data.data.subjects) {
          const scheduleSubjects = response.data.data.subjects
            .filter((s) => s.subject)
            .map((s) => s.subject);

          setCollection(scheduleSubjects, null, todaySubjectsCollectionName);
        } else {
          setCollection([], null, todaySubjectsCollectionName);
        }
      })
      .catch(() => setCollection([], true, todaySubjectsCollectionName));
  };

  const fetchGradesByClass = () => {
    setCollectionLoadingState(true, studentsCollectionName);

    gradesAPI
      .getByClassAndDate(filters.classId, filters.date)
      .then((response) => {
        const gradesByStudent = {};
        if (response.data.data && response.data.data.length > 0) {
          response.data.data.forEach((grade) => {
            const studentId = grade.student._id;
            if (gradesByStudent[studentId]) return;

            gradesByStudent[studentId] = { student: grade.student, grades: [] };
            gradesByStudent[studentId].grades.push(grade);
          });
        }

        setCollection(
          Object.values(gradesByStudent),
          null,
          studentsCollectionName
        );
      })
      .catch(() => {
        toast.error("Baholarni yuklashda xatolik");
        setCollection([], true, studentsCollectionName);
      });
  };

  if (isLoading && !filters.classId) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <Card className="grid grid-cols-1 gap-5 mb-6 md:grid-cols-3">
        <Select
          required
          label="Sinf"
          value={filters.classId}
          onChange={(value) => setFilters({ ...filters, classId: value })}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />

        <Select
          required
          label="Fan"
          value={filters.subjectId}
          onChange={(v) => setFilters({ ...filters, subjectId: v })}
          options={[
            { label: "Barchasi", value: "all" },
            ...subjects.map((subject) => ({
              label: subject.name,
              value: subject._id,
            })),
          ]}
        />

        <Input
          required
          label="Sana"
          type="date"
          value={filters.date}
          onChange={(v) => setFilters({ ...filters, date: v })}
        />
      </Card>

      {/* Grades View */}
      {!filters.classId && !isLoading && (
        <Card className="text-center">
          <Calendar
            className="w-12 h-12 text-blue-600 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-blue-800 text-lg">
            Baholarni ko'rish uchun kerakli maydonlarni tanlang
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && filters.classId && (
        <Card className="text-center">
          <p className="text-gray-500">Yuklanmoqda...</p>
        </Card>
      )}

      {/* No data */}
      {students.length === 0 && !isLoading && filters.classId && (
        <Card className="text-center">
          <Eye
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Tanlangan kun uchun baholar topilmadi</p>
        </Card>
      )}

      {/* Grades */}
      {students.length > 0 && (
        <Card responsive>
          <div className="rounded-lg overflow-x-auto">
            <table className="divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">O'quvchi</th>

                  {/* Subject */}
                  {filters.subjectId !== "all" && (
                    <>
                      <th className="px-6 py-3 text-center">Baho</th>
                      <th className="px-6 py-3 text-left">O'qituvchi</th>
                    </>
                  )}

                  {/* All subjects */}
                  {filters.subjectId === "all" && (
                    <>
                      {todaySubjects.map((subject) => (
                        <th key={subject._id} className="px-4 py-3 text-center">
                          {subject.name}
                        </th>
                      ))}

                      <th className="px-6 py-3 text-center">O'rtacha</th>
                    </>
                  )}
                </tr>
              </thead>

              {/* Tbody */}
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((studentData, index) => {
                  const relevantGrades =
                    filters.subjectId !== "all"
                      ? studentData.grades.filter(
                          (g) => g.subject._id === filters.subjectId
                        )
                      : studentData.grades;

                  return (
                    <tr
                      key={studentData.student._id}
                      className="hover:bg-gray-50"
                    >
                      {/* Index */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {studentData.student.firstName}{" "}
                          {studentData.student.lastName}
                        </div>
                      </td>

                      {/* Single subject */}
                      {filters.subjectId !== "all" && (
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
                      )}

                      {/* All subjects */}
                      {filters.subjectId == "all" && (
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

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {studentData.grades.length > 0 ? (
                              <span className="text-sm font-semibold text-blue-900">
                                {calculateAverageGrade(studentData.grades)}
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
        </Card>
      )}
    </div>
  );
};

export default Grades;
