// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

// Icons
import { Plus, Edit, Trash2, ChevronRight, Download, History } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { usersQueries } from "@/features/users/queries/users.queries";
import { Link } from "react-router-dom";

const Classes = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const { data: classes = [], isLoading } = useClasses();

  // ASL SINFLAR KESIMI — o'quvchilar ro'yxatining kesimi, shuning uchun
  // `users.view` bilan. Ruxsati yo'qqa so'rov umuman yuborilmaydi (403
  // o'rniga blok ko'rinmaydi).
  const { data: actualGrades } = useQuery({
    ...usersQueries.actualGrades(),
    enabled: can("users.view"),
  });

  // Excel yuklab olish
  const handleExport = async () => {
    try {
      const response = await classesAPI.exportAll();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sinflar_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export xatosi:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button onClick={() => openModal("createClass")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi sinf
        </Button>

        <div className="flex items-center gap-3">
          {/* Ko'chirilganlar / sinfdan chiqarilganlar — sababi bilan */}
          <Can do="classes.history">
            <Button asChild variant="secondary" className="px-3.5">
              <Link to="/classes/changes">
                <History strokeWidth={1.5} />
                <span className="max-xs:hidden">Sinf o'zgarishlari</span>
              </Link>
            </Button>
          </Can>

          <Button onClick={handleExport} className="px-3.5">
            <Download strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* ASL SINFLAR — SINFLARDAN ALOHIDA KESIM.
          Sinf — o'quvchi o'qiydigan GURUH ("IT 1", "Bog'cha"), asl sinf —
          u NECHANCHI SINF o'quvchisi (1 … 11). Ikkisi bir ro'yxatga
          qo'shilsa, "5-sinfda nechta o'quvchi bor" degan savol "IT 1 da
          nechta" bilan aralashib ketardi — shuning uchun ular yonma-yon,
          lekin ALOHIDA turadi. Har bir raqam o'sha darajadagi
          o'quvchilar ro'yxatini ochadi. */}
      {actualGrades && (
        <div className="mb-4 rounded-2xl bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Asl sinflar
              </h2>
              <p className="text-xs text-gray-500">
                O'quvchi nechanchi sinf o'quvchisi — u o'qiyotgan guruhdan
                alohida
              </p>
            </div>

            <span className="text-xs text-gray-500">
              Jami: {actualGrades.total ?? 0} ta o'quvchi
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {actualGrades.grades?.map((row) => (
              <Link
                key={row.grade}
                to={`/users/students?actualGrade=${row.grade}`}
                className="rounded-xl bg-amber-50 px-2 py-2 text-center transition hover:bg-amber-100"
              >
                <p className="text-xs text-gray-500">{row.label}</p>
                <p className="text-base font-semibold text-gray-900">
                  {row.studentCount}
                </p>
              </Link>
            ))}

            {/* "Kimga hali qo'yilmagan" ham javobsiz qolmasin */}
            <Link
              to="/users/students?actualGrade=none"
              className="rounded-xl bg-gray-100 px-2 py-2 text-center transition hover:bg-gray-200"
            >
              <p className="text-xs text-gray-500">Belgilanmagan</p>
              <p className="text-base font-semibold text-gray-900">
                {actualGrades.unset ?? 0}
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id}>
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <h3>
                <Link
                  to={`/classes/${classItem.id}`}
                  className="flex items-center gap-1.5 text-lg font-semibold text-gray-900 transition-colors duration-200 hover:text-blue-600"
                >
                  {classItem.name}
                  <ChevronRight className="size-5" strokeWidth={1.5} />
                </Link>
              </h3>

              {/* Action buttons */}
              <div className="flex gap-3.5">
                {/* Edit */}
                <button
                  onClick={() => openModal("editClass", classItem)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="size-5" strokeWidth={1.5} />
                </button>

                {/* Delete */}
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => openModal("deleteClass", classItem)}
                >
                  <Trash2 className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                {classItem.isActive ? "Faol" : "Faol emas"}
              </span>

              {/* Shu GURUHDA o'qiyotganlar soni. "Asl sinf" sanog'i bu yerda
                  EMAS: daraja (1 … 11) sinflar katalogiga bog'liq emas va
                  o'z kesimida, tepada ko'rsatiladi. */}
              <span className="text-sm text-gray-600">
                <b className="text-gray-900">{classItem.studentCount ?? 0}</b> ta
                o'quvchi
              </span>
            </div>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Hozircha sinflar yo'q</p>
        </div>
      )}
    </div>
  );
};

export default Classes;
