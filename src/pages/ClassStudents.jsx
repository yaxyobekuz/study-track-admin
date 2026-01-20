// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "../api/client";

// React
import { useState, useEffect } from "react";

// Components
import Card from "@/components/Card";
import Select from "@/components/form/select";

// Icons
import { Users, GraduationCap } from "lucide-react";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

const ClassStudents = () => {
  // Load saved filter from localStorage
  const getSavedFilter = () => {
    const savedClassId = localStorage.getItem("classStudents_classId");
    return { classId: savedClassId || "" };
  };

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();
  const [filters, setFilters] = useState(getSavedFilter());

  // Classes data
  const classes = getCollectionData("classes");

  // Students data
  const studentsCollectionName = `class-students-${filters.classId}`;
  const students = getCollectionData(studentsCollectionName);
  const isLoading = isCollectionLoading(studentsCollectionName);

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("classStudents_classId", filters.classId);
  }, [filters]);

  useEffect(() => {
    // Initialize collection (pagination = false)
    if (!hasCollection(studentsCollectionName))
      initialize(false, studentsCollectionName);

    // Fetch students by class
    if (filters.classId && !students?.length) {
      fetchStudentsByClass();
    }
  }, [filters.classId]);

  const fetchStudentsByClass = () => {
    setCollectionLoadingState(true, studentsCollectionName);

    usersAPI
      .getAll({ role: "student", class: filters.classId, limit: 200 })
      .then((response) => {
        if (response.data.data && response.data.data.length > 0) {
          setCollection(response.data.data, null, studentsCollectionName);
        } else {
          setCollection([], null, studentsCollectionName);
        }
      })
      .catch(() => {
        toast.error("O'quvchilarni yuklashda xatolik");
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
      </Card>

      {/* Students View */}
      {!filters.classId && !isLoading && (
        <Card className="text-center">
          <GraduationCap
            className="w-12 h-12 text-blue-600 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-blue-800 text-lg">
            O'quvchilarni ko'rish uchun sinfni tanlang
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
          <Users
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">
            Tanlangan sinfda o'quvchilar topilmadi
          </p>
        </Card>
      )}

      {/* Students Table */}
      {students.length > 0 && (
        <Card responsive>
          <div className="rounded-lg overflow-x-auto">
            <table className="divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Ism</th>
                  <th className="px-6 py-3 text-left">Familiya</th>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-left">Sinflar</th>
                </tr>
              </thead>

              {/* Tbody */}
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    {/* Index */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>

                    {/* First Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName}
                      </div>
                    </td>

                    {/* Last Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.lastName}
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {student.username}
                      </div>
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {student.classes?.map((c) => c.name).join(", ") || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassStudents;
