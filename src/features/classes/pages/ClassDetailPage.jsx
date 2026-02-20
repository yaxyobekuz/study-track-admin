// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/shared/api/users.api";
import { classesAPI } from "@/shared/api/classes.api";

// React
import { useState, useEffect } from "react";

// Router
import { useParams, useNavigate } from "react-router-dom";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";

// Icons
import { Users, ArrowLeft, Download } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();

  const [classInfo, setClassInfo] = useState(null);
  const [loadingClass, setLoadingClass] = useState(true);

  // Students data
  const studentsCollectionName = `class-students-${classId}`;
  const students = getCollectionData(studentsCollectionName);
  const isLoadingStudents = isCollectionLoading(studentsCollectionName);

  // Initialize collection for students
  useEffect(() => {
    if (!hasCollection(studentsCollectionName)) {
      initialize(false, studentsCollectionName);
    }
  }, [studentsCollectionName, hasCollection, initialize]);

  // Fetch class info
  useEffect(() => {
    if (classId) {
      fetchClassInfo();
      fetchStudentsByClass();
    }
  }, [classId]);

  const fetchClassInfo = () => {
    setLoadingClass(true);
    classesAPI
      .getOne(classId)
      .then((response) => {
        setClassInfo(response.data.data);
        setLoadingClass(false);
      })
      .catch(() => {
        toast.error("Sinf ma'lumotlarini yuklashda xatolik");
        setLoadingClass(false);
      });
  };

  const fetchStudentsByClass = () => {
    setCollectionLoadingState(true, studentsCollectionName);

    usersAPI
      .getAll({ role: "student", class: classId, limit: 200 })
      .then((response) => {
        setCollection(response.data.data || [], null, studentsCollectionName);
      })
      .catch(() => {
        toast.error("O'quvchilarni yuklashda xatolik");
        setCollection([], true, studentsCollectionName);
      });
  };

  const handleEditClass = () => {
    openModal("editClass", classInfo);
  };

  const handleExport = async () => {
    try {
      const response = await classesAPI.exportStudents(classId);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const today = new Date().toISOString().split("T")[0];
      link.download = `${classInfo.name}_oquvchilar_${today}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fayl muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error(error.message || "Eksport qilishda xatolik yuz berdi");
    }
  };

  if (loadingClass) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  if (!classInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Sinf topilmadi</p>
        <Button onClick={() => navigate("/classes")}>Orqaga</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            onClick={() => navigate("/classes")}
            className="px-3"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">{classInfo.name}</h1>
        </div>

        {students?.length > 0 && (
          <Button variant="primary" onClick={handleExport} className="px-3.5">
            <Download className="size-4 mr-2" strokeWidth={1.5} />
            Yuklash
          </Button>
        )}
      </div>

      {/* Students Section */}
      <Card>
        {/* Loading */}
        {isLoadingStudents && (
          <div className="text-center py-8">
            <p className="text-gray-500">Yuklanmoqda...</p>
          </div>
        )}

        {/* No Students */}
        {!isLoadingStudents && students?.length === 0 && (
          <div className="text-center py-8">
            <Users
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-500">Bu sinfda o'quvchilar yo'q</p>
          </div>
        )}

        {/* Students Table */}
        {!isLoadingStudents && students?.length > 0 && (
          <div className="rounded-lg overflow-x-auto">
            <table className="divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Ism</th>
                  <th className="px-6 py-3 text-left">Familiya</th>
                  <th className="px-6 py-3 text-left">Username</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClassDetail;
