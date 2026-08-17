// Router
import { Link } from "react-router-dom";

// Components
import InfoCard from "./InfoCard";
import UserAccountCard from "./UserAccountCard";
import UserBasicInfoCard from "./UserBasicInfoCard";
import EditUserBasicModal from "../EditUserBasicModal";
import EditStudentClassesModal from "../EditStudentClassesModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { getGenderLabel } from "../../data/users.data";

/**
 * O'quvchining "Asosiy" tabi.
 *
 * Xodimnikidan farqi: ish jadvali o'rnida sinflar kartasi turadi. Moliya va
 * davomat bu yerda takrorlanmaydi — ular o'z tablariga ega.
 */
const StudentMainTab = ({ user }) => {
  const { openModal } = useModal();

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
        </InfoCard>

        <UserAccountCard user={user} />
      </div>

      {/* Modallar shu tab ichida — ro'yxat sahifalariga tegishli emas */}
      <EditUserBasicModal />
      <EditStudentClassesModal />
    </div>
  );
};

export default StudentMainTab;
