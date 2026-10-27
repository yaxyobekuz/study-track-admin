// Router
import { Link } from "react-router-dom";

// Components
import InfoCard from "./InfoCard";
import UserAccountCard from "./UserAccountCard";
import UserBasicInfoCard from "./UserBasicInfoCard";
import UserPhoneCard from "./UserPhoneCard";
import StudentClassHistory from "./StudentClassHistory";
import EditUserBasicModal from "../EditUserBasicModal";
import EditUserPhoneModal from "../EditUserPhoneModal";
import EditStudentClassesModal from "../EditStudentClassesModal";
import EditStudentActualGradeModal from "../EditStudentActualGradeModal";
import StudentActualGradeCell from "../StudentActualGradeCell";
import UserTransfersCard from "@/features/branchTransfers/components/UserTransfersCard";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useCanManageUser from "../../hooks/useCanManageUser";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { getGenderLabel } from "../../data/users.data";

/**
 * O'quvchining "Asosiy" tabi.
 *
 * Xodimnikidan farqi: ish jadvali o'rnida sinflar kartasi turadi. Moliya va
 * davomat bu yerda takrorlanmaydi — ular o'z tablariga ega.
 *
 * "Asl sinfi" AYNI KARTADA turadi: o'quvchi nechanchi sinf o'quvchisi ekani
 * u o'qiyotgan guruhdan farq qilishi mumkin va savol ("nega IT 1 da
 * o'qiyapti") aynan shu ikki qator yonma-yon turganda javob topadi.
 * Alohida karta bo'lsa, farqni ko'rish uchun ekranni qidirish kerak bo'lardi.
 */
const StudentMainTab = ({ user }) => {
  const { openModal } = useModal();
  // Egalik darvozasi — o'qituvchi faqat o'zi qo'shgan o'quvchini tahrirlaydi
  const canManage = useCanManageUser(user);

  const classes = user.classes ?? [];

  const basicRows = [
    { label: "Jins", value: getGenderLabel(user.gender) },
    {
      label: "Holat",
      value: user.isArchived ? "Arxivlangan" : user.isActive ? "Faol" : "Nofaol",
    },
    { label: "Tangalar", value: user.coinBalance ?? 0 },
    { label: "Jarima ballari", value: user.penaltyPoints ?? 0 },
    { label: "Ro'yxatdan o'tgan", value: formatDateUZ(user.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <UserBasicInfoCard user={user} rows={basicRows} roleLabel="O'quvchi" />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <InfoCard
          title="Sinflar"
          canEdit={canManage}
          onEdit={() => openModal("editStudentClasses", user)}
        >
          {classes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  {cls.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {user.isArchived
                ? "Arxivlanganda barcha sinflardan chiqarilgan."
                : "Sinf biriktirilmagan."}
            </p>
          )}

          {/* ASL SINF — o'quvchining maktab darajasi (1-sinf … 11-sinf).
              A'zolik EMAS: bu yerda daraja almashtirilsa o'quvchi hech
              qaysi guruhga qo'shilmaydi va "Sinf o'zgarishlari" jurnaliga
              ham yozilmaydi. */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">Asl sinfi:</span>
            <StudentActualGradeCell user={user} />
          </div>

          {/* Ko'chirish / chiqarish tarixi, sababi bilan (`classes.history`) */}
          <StudentClassHistory user={user} />
        </InfoCard>

        <UserAccountCard user={user} />

        {/* O'quvchi va ota-ona raqamlari — davomatdan qo'ng'iroq qilish
            uchun. Ko'rish hammaga, tahrirlash `users.phone` bilan. */}
        <UserPhoneCard user={user} canEdit={canManage} />
      </div>

      {/* Filiallararo ko'chirish: tarix va tugma. Ko'chirilgan o'quvchining
          eski filialdagi profilida — "hozir qayerda" ogohlantirishi */}
      <UserTransfersCard user={user} />

      {/* Modallar shu tab ichida — ro'yxat sahifalariga tegishli emas */}
      <EditUserBasicModal />
      <EditStudentClassesModal />
      <EditStudentActualGradeModal />
      <EditUserPhoneModal />
    </div>
  );
};

export default StudentMainTab;
