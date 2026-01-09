// Toast
import { toast } from "sonner";

// API
import { gradesAPI } from "../api/client";

// React
import { useState, useEffect } from "react";

// Components
import Card from "@/components/Card";
import Input from "@/components/form/input";
import Select from "@/components/form/select";

// Utils
import { formatDateUZ } from "../utils/date.utils";

// Helpers
import { getGradeColor } from "@/helpers/grade.helpers";

const MyGrades = () => {
  // Load saved filters from localStorage
  const getSavedFilters = () => {
    const savedDate = localStorage.getItem("myGrades_date");
    return savedDate || new Date().toISOString().split("T")[0];
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDate, setSelectedDate] = useState(getSavedFilters());

  // Save date to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("myGrades_date", selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchMyGrades();
  }, [selectedDate]);

  const fetchMyGrades = async () => {
    setLoading(true);
    try {
      const response = await gradesAPI.getStudentGrades(selectedDate);
      setData(response.data.data);
    } catch (error) {
      toast.error("Baholarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades =
    selectedSubject === "all"
      ? data?.grades || []
      : data?.grades.filter((g) => g.subject._id === selectedSubject) || [];

  const subjectsList = data?.statistics ? Object.values(data.statistics) : [];

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <Card className="grid grid-cols-1 gap-5 mb-6 md:grid-cols-2">
        <Input
          required
          type="date"
          label="Sana"
          value={selectedDate}
          onChange={(v) => setSelectedDate(v)}
        />

        <Select
          required
          label="Fan"
          value={selectedSubject}
          onChange={(v) => setSelectedSubject(v)}
          options={[
            { label: "Barcha fanlar", value: "all" },
            ...subjectsList.map((s) => ({
              label: s.subject.name,
              value: s.subject._id,
            })),
          ]}
        />
      </Card>

      {/* Grades Table */}
      <Card responsive>
        <div className="rounded-lg overflow-x-auto">
          {!!filteredGrades.length && (
            <table className="divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">Fan</th>
                  <th className="px-6 py-3 text-left">Baho</th>
                  <th className="px-6 py-3 text-left">Sana</th>
                  <th className="px-6 py-3 text-left">O'qituvchi</th>
                </tr>
              </thead>

              {/* Tbody */}
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
                        {formatDateUZ(grade.date)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {grade.teacher.firstName} {grade.teacher.lastName}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!filteredGrades.length && (
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
