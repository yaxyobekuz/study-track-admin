// Icons
import {
  User,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

// React
import { useState, useEffect } from "react";

// Components
import Card from "@/components/Card";

// API
import { gradesAPI } from "@/api/client";
import Button from "@/components/form/button";
import { useNavigate } from "react-router-dom";

const MissingGrades = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeachers, setExpandedTeachers] = useState({});

  const fetchData = () => {
    setLoading(true);
    setError(null);

    gradesAPI
      .getMissingToday()
      .then((res) => {
        setData(res.data.data);
        // Barcha o'qituvchilarni ochiq qilish
        const expanded = {};
        res.data.data.byTeacher?.forEach((t) => {
          expanded[t.teacher._id] = false;
        });
        setExpandedTeachers(expanded);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Ma'lumotlarni yuklashda xatolik",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTeacher = (teacherId) => {
    setExpandedTeachers((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  // Loading
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            onClick={() => navigate("/grades")}
            className="px-3"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">
            Qo'yilmagan baholar
          </h1>
        </div>

        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            onClick={() => navigate("/grades")}
            className="px-3"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">
            Qo'yilmagan baholar
          </h1>
        </div>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="size-6" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Yakshanba yoki bayram
  if (data?.isSunday || data?.isHoliday) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            onClick={() => navigate("/grades")}
            className="px-3"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">
            Qo'yilmagan baholar
          </h1>
        </div>
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 text-blue-700">
            <Clock className="size-6" />
            <p>{data.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Barcha baholar qo'yilgan
  if (!data?.byTeacher || data.byTeacher.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              onClick={() => navigate("/grades")}
              className="px-3"
            >
              <ArrowLeft className="size-5" strokeWidth={1.5} />
            </Button>

            <h1 className="text-2xl font-bold text-gray-900">
              Qo'yilmagan baholar
            </h1>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="size-4" />
            Yangilash
          </button>
        </div>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800 text-lg">
                Barcha baholar qo'yilgan!
              </h3>
              <p className="text-green-600">
                Bugun ({data?.dayName}) tugagan darslar uchun barcha
                o'qituvchilar baholarini qo'yishgan
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            onClick={() => navigate("/grades")}
            className="px-3"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">
            Qo'yilmagan baholar
          </h1>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="size-4" />
          Yangilash
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <User className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">
                {data.summary.totalTeachers}
              </p>
              <p className="text-sm text-orange-600">O'qituvchi</p>
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <BookOpen className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">
                {data.summary.totalLessons}
              </p>
              <p className="text-sm text-amber-600">Dars</p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <GraduationCap className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {data.summary.totalMissingStudents}
              </p>
              <p className="text-sm text-red-600">Baholanmagan o'quvchi</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Teachers List */}
      <div className="space-y-4">
        {data.byTeacher.map((teacherData) => (
          <Card key={teacherData.teacher._id} className="p-0 overflow-hidden">
            {/* Teacher Header */}
            <button
              onClick={() => toggleTeacher(teacherData.teacher._id)}
              className="w-full flex items-center justify-between p-4 bg-indigo-500 text-white hover:bg-indigo-600 transition-colors mb-0"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-400 rounded-full">
                  <User className="size-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">
                    {teacherData.teacher.firstName}{" "}
                    {teacherData.teacher.lastName}
                  </h3>
                  <p className="text-sm opacity-70">
                    {teacherData.lessons.length} ta dars,{" "}
                    {teacherData.lessons.reduce(
                      (acc, l) => acc + l.missingStudents.length,
                      0,
                    )}{" "}
                    ta o'quvchi
                  </p>
                </div>
              </div>
              {expandedTeachers[teacherData.teacher._id] ? (
                <ChevronUp className="size-5" />
              ) : (
                <ChevronDown className="size-5" />
              )}
            </button>

            {/* Lessons */}
            {expandedTeachers[teacherData.teacher._id] && (
              <div className="p-5 space-y-4">
                {teacherData.lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Lesson Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-semibold rounded text-sm">
                          {lesson.lessonOrder}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {lesson.class.name} - {lesson.subject.name}
                          </p>
                          {lesson.startTime && lesson.endTime && (
                            <p className="text-xs text-gray-500">
                              {lesson.startTime} - {lesson.endTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {lesson.missingStudents.length} /{" "}
                          {lesson.totalStudents}
                        </span>
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="p-3">
                      <p className="text-sm text-gray-500 mb-2">
                        Baholanmagan o'quvchilar:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lesson.missingStudents.map((student) => (
                          <span
                            key={student._id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                          >
                            {student.firstName} {student.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MissingGrades;
