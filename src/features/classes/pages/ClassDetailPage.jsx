// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Router
import { useParams, useNavigate } from "react-router-dom";

// Components
import Button from "@/shared/components/ui/button/Button";

// Icons
import {
  Users,
  ArrowLeft,
  Download,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  X,
} from "lucide-react";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

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
  const [selected, setSelected] = useState([]);

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

  // Ro'yxatda hozir mavjud bo'lgan tanlangan o'quvchilar (eskirgan ID larsiz)
  const visibleIds = new Set(students.map((s) => s._id));
  const selectedValid = selected.filter((id) => visibleIds.has(id));

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const allSelected =
    students.length > 0 && selectedValid.length === students.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : students.map((s) => s._id));
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" onClick={() => navigate("/classes")}>
            <ArrowLeft strokeWidth={1.5} />
          </Button>

          <h1 className="page-title">{classInfo.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Add students */}
          <Button
            onClick={() =>
              openModal("addStudentsToClass", {
                classId,
                existingIds: students.map((s) => s._id),
              })
            }
          >
            <UserPlus strokeWidth={1.5} />
            <span className="max-xs:hidden">O'quvchi qo'shish</span>
          </Button>

          {/* Export */}
          {students?.length > 0 && (
            <Button variant="secondary" onClick={handleExport}>
              <Download strokeWidth={1.5} />
              <span className="max-xs:hidden">Yuklash</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selection toolbar */}
      {selectedValid.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium text-gray-700">
            {selectedValid.length} ta tanlandi
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                openModal("moveClassStudents", {
                  classId,
                  studentIds: selectedValid,
                })
              }
            >
              <ArrowRightLeft strokeWidth={1.5} />
              <span className="max-xs:hidden">Boshqa sinfga ko'chirish</span>
            </Button>

            <Button
              variant="danger"
              onClick={() =>
                openModal("removeClassStudents", {
                  classId,
                  studentIds: selectedValid,
                  all: false,
                })
              }
            >
              <LogOut strokeWidth={1.5} />
              <span className="max-xs:hidden">Sinfdan chiqarish</span>
            </Button>

            <Button variant="ghost" onClick={() => setSelected([])}>
              <X strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      )}

      {/* Students Section */}
      <div>
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
            <p className="text-gray-500 mb-4">Bu sinfda o'quvchilar yo'q</p>
            <Button
              onClick={() =>
                openModal("addStudentsToClass", {
                  classId,
                  existingIds: [],
                })
              }
            >
              <UserPlus strokeWidth={1.5} />
              O'quvchi qo'shish
            </Button>
          </div>
        )}

        {/* Students Table */}
        {!isLoadingStudents && students?.length > 0 && (
          <div className="rounded-lg overflow-x-auto">
            <table>
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6">
                    <input
                      type="checkbox"
                      className="size-4 rounded cursor-pointer"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>#</th>
                  <th>Ism</th>
                  <th>Familiya</th>
                  <th>Username</th>
                </tr>
              </thead>

              {/* Tbody */}
              <tbody>
                {students.map((student, index) => {
                  const isSelected = selected.includes(student._id);

                  return (
                    <tr
                      key={student._id}
                      className={isSelected ? "bg-primary/5" : ""}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="size-4 rounded cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleStudent(student._id)}
                        />
                      </td>

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
                  );
                })}
              </tbody>
            </table>

            {/* Remove all */}
            <div className="flex justify-end pt-4">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() =>
                  openModal("removeClassStudents", {
                    classId,
                    all: true,
                    studentIds: [],
                  })
                }
              >
                <LogOut strokeWidth={1.5} />
                Barchasini sinfdan chiqarish
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
