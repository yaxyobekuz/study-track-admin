// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { statisticsAPI } from "@/api/client";

// Components
import ResponsiveModal from "../ResponsiveModal";

// Icons
import { User, Award, School, BarChart3, Users } from "lucide-react";

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

  const { student, classes, simpleStats, rankings } = data;

  return (
    <div className="space-y-8">
      {/* Student Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-4">
          <div className="size-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="size-6 text-blue-600" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {student.fullName}
            </h3>

            <div className="flex flex-wrap gap-2">
              {classes && classes.length > 0 ? (
                classes.map((cls) => (
                  <span
                    key={cls._id}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                  >
                    {cls.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly stats */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900">
          Haftalik reyting
        </h4>

        {/* Total score */}
        <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-green-600" />
            <h4 className="text-sm font-medium text-gray-700 sm:text-base">
              Umumiy Ball
            </h4>
          </div>

          <p className="font-semibold text-green-600 xs:text-lg sm:font-bold">
            {simpleStats.totalSum}
          </p>
        </div>

        {/* Total grades */}
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-700 sm:text-base">
              Jami Baholar
            </h4>
          </div>

          <p className="font-semibold text-blue-600 xs:text-lg sm:font-bold">
            {simpleStats.totalGrades}
          </p>
        </div>

        {/* Rankings */}
        {rankings && (
          <>
            {/* School Ranking */}
            {rankings.schoolRank && (
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <School className="size-5 text-purple-600" />
                  <h4 className="text-sm font-medium text-gray-700 sm:text-base">
                    Maktabdagi reyting
                  </h4>
                </div>

                <p className="font-semibold text-purple-600 xs:text-lg sm:font-bold">
                  {rankings.schoolRank} /{" "}
                  <span className="">{rankings.schoolTotalStudents}</span>
                </p>
              </div>
            )}

            {/* Class Rankings */}
            {rankings.classRanks.map((classRank) => (
              <div
                key={classRank.class._id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-purple-600" />
                  <h4 className="text-sm font-medium text-gray-700 sm:text-base">
                    {classRank.class.name}dagi reyting
                  </h4>
                </div>

                <p className="font-semibold text-purple-600 xs:text-lg sm:font-bold">
                  {classRank.rank} / {classRank.totalStudents}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Subjects - Stats */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900">
          Fanlar bo'yicha baholar
        </h4>

        {simpleStats.subjects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Fanlar bo'yicha baholar topilmadi
          </p>
        ) : (
          simpleStats.subjects.map((subject, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              {/* Top */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {subject.subject.name}
                </h3>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {subject.sum}
                  </p>

                  <p className="text-xs text-gray-500">
                    {subject.count} ta baho
                  </p>
                </div>
              </div>

              {/* Grades */}
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
  );
};

export default StudentStatisticsModal;
