import { useState, useEffect } from "react";
import { gradesAPI } from "../api/client";
import { toast } from "sonner";
import { TrendingUp, Calendar, BookOpen } from "lucide-react";
import Card from "@/components/Card";

const MyGrades = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");

  useEffect(() => {
    fetchMyGrades();
  }, []);

  const fetchMyGrades = async () => {
    try {
      const response = await gradesAPI.getStudentGrades();
      setData(response.data.data);
    } catch (error) {
      toast.error("Baholarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 5) return "bg-green-100 text-green-800 border-green-200";
    if (grade === 4) return "bg-blue-100 text-blue-800 border-blue-200";
    if (grade === 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getAverageColor = (avg) => {
    if (avg >= 4.5) return "text-green-600";
    if (avg >= 3.5) return "text-blue-600";
    if (avg >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredGrades =
    selectedSubject === "all"
      ? data?.grades || []
      : data?.grades.filter((g) => g.subject._id === selectedSubject) || [];

  const subjectsList = data?.statistics ? Object.values(data.statistics) : [];

  // Umumiy o'rtacha baho
  const overallAverage =
    subjectsList.length > 0
      ? (
          subjectsList.reduce(
            (sum, stat) => sum + parseFloat(stat.average),
            0
          ) / subjectsList.length
        ).toFixed(2)
      : 0;

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-100">
              <TrendingUp
                className="size-6 text-indigo-600"
                strokeWidth={1.5}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Umumiy o'rtacha
              </p>
              <p
                className={`text-2xl font-bold ${getAverageColor(
                  overallAverage
                )}`}
              >
                {overallAverage}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <BookOpen className="size-6 text-green-600" strokeWidth={1.5} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fanlar soni</p>
              <p className="text-2xl font-bold text-gray-900">
                {subjectsList.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <Calendar className="size-6 text-purple-600" strokeWidth={1.5} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jami baholar</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.grades.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subjects Statistics */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Fanlar bo'yicha statistika
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectsList.map((stat) => (
            <div
              key={stat.subject._id}
              className="p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => setSelectedSubject(stat.subject._id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">
                  {stat.subject.name}
                </h3>
                <span
                  className={`text-lg font-bold ${getAverageColor(
                    stat.average
                  )}`}
                >
                  {stat.average}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Baholar soni:</span>
                <span className="font-medium">{stat.count}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {stat.grades.map((grade, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs font-semibold rounded ${getGradeColor(
                      grade
                    )}`}
                  >
                    {grade}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Fan:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Barcha fanlar</option>
            {subjectsList.map((stat) => (
              <option key={stat.subject._id} value={stat.subject._id}>
                {stat.subject.name}
              </option>
            ))}
          </select>
          {selectedSubject !== "all" && (
            <button
              onClick={() => setSelectedSubject("all")}
              className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Tozalash
            </button>
          )}
        </div>
      </Card>

      {/* Grades Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedSubject === "all"
              ? "Barcha baholar"
              : "Fan bo'yicha baholar"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Izoh
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <tr key={grade._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grade.subject.name}
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(grade.date).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {grade.teacher.firstName} {grade.teacher.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {grade.comment || "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGrades.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Baholar topilmadi</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyGrades;
