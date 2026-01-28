// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { statisticsAPI } from "@/api/client";

// Components
import ResponsiveModal from "../ResponsiveModal";

// Icons
import { User, Award, BookOpen, BarChart3 } from "lucide-react";

const StudentStatisticsModal = () => (
  <ResponsiveModal name="studentStats" title="O'quvchi statistikasi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    statisticsAPI
      .getStudentWeekly(studentId)
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Statistikalarni yuklashda xatolik",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Ma'lumot topilmadi</p>
      </div>
    );
  }

  const { student, class: studentClass, simpleStats, rankings } = data;

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {student.fullName}
            </h3>
            <p className="text-sm text-gray-600">
              Sinf: <span className="font-medium">{studentClass.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="size-5 text-green-600" />
            <p className="text-sm font-medium text-gray-700">Umumiy Ball</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {simpleStats.totalSum}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="size-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">Jami Baholar</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {simpleStats.totalGrades}
          </p>
        </div>
      </div>

      {/* Rankings */}
      {rankings && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Reytinglar
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Sinf bo'yicha</p>
              <p className="text-2xl font-bold text-blue-600">
                {rankings.classRank} / {rankings.classTotalStudents}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Maktab bo'yicha</p>
              <p className="text-2xl font-bold text-blue-600">
                {rankings.schoolRank} / {rankings.schoolTotalStudents}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subjects - Stats */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="size-5 text-blue-600" />
          Fanlar bo'yicha baholar
        </h4>
        <div className="space-y-3">
          {simpleStats.subjects.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Fanlar bo'yicha baholar topilmadi
            </p>
          ) : (
            simpleStats.subjects.map((subject, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {subject.subject.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      O'qituvchi: {subject.teachers.join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {subject.sum}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subject.count} ta baho
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {subject.grades.map((grade, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded text-sm font-semibold ${
                        grade === 5
                          ? "bg-green-100 text-green-800"
                          : grade === 4
                            ? "bg-blue-100 text-blue-800"
                            : grade === 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentStatisticsModal;
