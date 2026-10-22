// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useModal from "@/shared/hooks/useModal";
import {
  classesQueries,
  useClassStudents,
  useClassActualStudents,
} from "@/features/classes/queries/classes.queries";

// Router
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Icons
import {
  Users,
  ArrowLeft,
  Download,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  History,
  X,
} from "lucide-react";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// Haqiqiy sinf — o'quvchilar bo'limidagi AYNI katak va AYNI oyna
// (ikkinchi nusxa bo'lsa, ruxsat sharti bir joyda tushib qolardi)
import StudentActualClassCell from "@/features/users/components/StudentActualClassCell";
import EditStudentActualClassModal from "@/features/users/components/EditStudentActualClassModal";

/**
 * SINF SAHIFASI — IKKI RO'YXAT, ARALASHMAYDI.
 *
 *   · "O'quvchilar"   — shu sinfda O'QIYOTGANLAR (`UserClass`): qo'shish,
 *     ko'chirish, chiqarish — hammasi shu ro'yxat ustida;
 *   · "Haqiqiy sinfi" — ASLIDA shu sinfniki bo'lganlar (`actualClassId`),
 *     ular boshqa guruhda o'qiyotgan bo'lishi mumkin.
 *
 * ⚠️ Ikkisi BITTA ro'yxatga qo'shilmaydi va sanoqlari ham alohida: kuchli
 * o'quvchi IT 2 niki bo'lib IT 1 da o'qisa, u ikkala sinfda ham sanalib,
 * "sinfda nechta o'quvchi bor" degan savol javobsiz qolardi.
 *
 * Amallar (ko'chirish, chiqarish, qo'shish) faqat BIRINCHI tabda: ular sinf
 * A'ZOLIGINI o'zgartiradi, haqiqiy sinf esa belgi — u qatordagi katakdan
 * tahrirlanadi.
 */
const ACTUAL_TAB = "actual";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab URL'da: "orqaga" qaytganda va havola ulashilganda yo'qolmasin
  const isActualTab = searchParams.get("tab") === ACTUAL_TAB;
  const handleTabChange = (value) =>
    setSearchParams((prev) => {
      if (value === ACTUAL_TAB) prev.set("tab", ACTUAL_TAB);
      else prev.delete("tab");
      return prev;
    });

  const [selected, setSelected] = useState([]);

  // Class info
  const {
    data: classInfo,
    isLoading: loadingClass,
    isError: classError,
  } = useQuery(classesQueries.detail(classId));

  // Students roster
  const { data: students = [], isLoading: isLoadingStudents } =
    useClassStudents(classId);

  // Haqiqiy sinfi shu sinf bo'lganlar — ALOHIDA so'rov, alohida ro'yxat
  const { data: actualStudents = [], isLoading: isLoadingActual } =
    useClassActualStudents(classId);

  // Ro'yxatda hozir mavjud bo'lgan tanlangan o'quvchilar (eskirgan ID larsiz)
  const visibleIds = new Set(students.map((s) => s.id));
  const selectedValid = selected.filter((id) => visibleIds.has(id));

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const allSelected =
    students.length > 0 && selectedValid.length === students.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : students.map((s) => s.id));
  };

  // Yuklash FAOL TABNI beradi: fayl ekranda ko'rilgan ro'yxatning nusxasi
  // bo'lishi kerak, aks holda "boshqa ro'yxat tushdi" holati bo'lardi.
  const handleExport = async () => {
    try {
      const response = await classesAPI.exportStudents(classId, {
        by: isActualTab ? ACTUAL_TAB : "class",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const today = new Date().toISOString().split("T")[0];
      link.download = isActualTab
        ? `${classInfo.name}_haqiqiy_sinf_${today}.xlsx`
        : `${classInfo.name}_oquvchilar_${today}.xlsx`;

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

  if (classError || !classInfo) {
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
          {/* Add students — faqat A'ZOLIK tabida: bu tugma o'quvchini
              SINFGA qo'shadi, haqiqiy sinf esa qatordagi katakdan
              belgilanadi (ikkisi boshqa-boshqa amal) */}
          {!isActualTab && (
            <Button
              onClick={() =>
                openModal("addStudentsToClass", {
                  classId,
                  existingIds: students.map((s) => s.id),
                })
              }
            >
              <UserPlus strokeWidth={1.5} />
              <span className="max-xs:hidden">O'quvchi qo'shish</span>
            </Button>
          )}

          {/* Shu sinf bo'yicha ko'chirish / chiqarish tarixi */}
          <Can do="classes.history">
            <Button asChild variant="secondary">
              <Link to={`/classes/changes?class=${classId}`}>
                <History strokeWidth={1.5} />
                <span className="max-xs:hidden">Tarix</span>
              </Link>
            </Button>
          </Can>

          {/* Export — FAOL TABNING ro'yxatini beradi */}
          {(isActualTab ? actualStudents.length : students.length) > 0 && (
            <Button variant="secondary" onClick={handleExport}>
              <Download strokeWidth={1.5} />
              <span className="max-xs:hidden">Yuklash</span>
            </Button>
          )}
        </div>
      </div>

      {/* IKKI RO'YXAT — sanoqlari ham alohida (yorliqdagi raqam) */}
      <TabsButtons
        value={isActualTab ? ACTUAL_TAB : "class"}
        onChange={handleTabChange}
        items={[
          {
            value: "class",
            label: `O'quvchilar${isLoadingStudents ? "" : ` (${students.length})`}`,
          },
          {
            value: ACTUAL_TAB,
            label: `Haqiqiy sinfi${isLoadingActual ? "" : ` (${actualStudents.length})`}`,
          },
        ]}
      />

      {/* Selection toolbar — faqat A'ZOLIK tabida (amallar sinf a'zoligini
          o'zgartiradi, haqiqiy sinf esa belgi) */}
      {!isActualTab && selectedValid.length > 0 && (
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

      {/* Students Section — shu sinfda O'QIYOTGANLAR */}
      {!isActualTab && (
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
                    {/* O'quvchining O'Z sinfi — shu guruhdan farq qilishi
                      mumkin (kuchli o'quvchi katta guruhda o'qiydi) */}
                    <th>Haqiqiy sinfi</th>
                  </tr>
                </thead>

                {/* Tbody */}
                <tbody>
                  {students.map((student, index) => {
                    const isSelected = selected.includes(student.id);

                    return (
                      <tr
                        key={student.id}
                        className={isSelected ? "bg-primary/5" : ""}
                      >
                        {/* Checkbox */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="size-4 rounded cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleStudent(student.id)}
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

                        {/* Haqiqiy sinfi — shu yerdan tahrirlanadi */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StudentActualClassCell user={student} />
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
      )}

      {/* HAQIQIY SINFI shu sinf bo'lganlar — ALOHIDA ro'yxat.
          Bu yerda sinfdan chiqarish / ko'chirish YO'Q: ular a'zolik amallari,
          bu ro'yxat esa belgi bo'yicha yig'ilgan. Belgini qatordagi
          "Haqiqiy sinfi" katagidan o'zgartirish mumkin. */}
      {isActualTab && (
        <div>
          {isLoadingActual && (
            <div className="text-center py-8">
              <p className="text-gray-500">Yuklanmoqda...</p>
            </div>
          )}

          {!isLoadingActual && actualStudents.length === 0 && (
            <div className="text-center py-8">
              <Users
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-gray-500">
                Haqiqiy sinfi shu sinf bo'lgan o'quvchi yo'q
              </p>
            </div>
          )}

          {!isLoadingActual && actualStudents.length > 0 && (
            <div className="rounded-lg overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="px-6">#</th>
                    <th>Ism</th>
                    <th>Familiya</th>
                    <th>Username</th>
                    {/* Shu o'quvchi HOZIR qaysi guruhda o'qiyapti */}
                    <th>Hozirgi guruhi</th>
                    <th>Haqiqiy sinfi</th>
                  </tr>
                </thead>

                <tbody>
                  {actualStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {student.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {student.classes?.length > 0
                            ? student.classes.map((cls) => cls.name).join(", ")
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StudentActualClassCell user={student} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Jadvaldagi "Haqiqiy sinfi" katagining tahrirlash oynasi */}
      <EditStudentActualClassModal />
    </div>
  );
};

export default ClassDetail;
