// Components
import Card from "@/shared/components/ui/Card";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import UserForm from "../UserForm";
import UserDetailHeader from "./UserDetailHeader";
import UserInfoCard from "./UserInfoCard";
import UserPenaltiesTab from "./UserPenaltiesTab";
import StudentAttendanceSummary from "@/features/attendance/components/StudentAttendanceSummary";
import StudentFinanceSection from "@/features/finance/components/StudentFinanceSection";

// Hooks
import useDetailTab from "../../hooks/useDetailTab";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { STUDENT_DETAIL_TABS } from "../../data/usersTabs.data";
import { getGenderLabel } from "../../data/users.data";

/**
 * O'quvchining detal sahifasi.
 *
 * Xodimnikidan alohida komponent: bu yerda Moliya tabi bor (tarif, holat,
 * oylik majburiyatlar) va sinf biriktirmasi ko'rsatiladi, ish jadvali esa
 * umuman yo'q. Har bir tab o'z ma'lumotini o'zi yuklaydi — sahifa ochilganda
 * faqat kerakli so'rov ketadi.
 */
const StudentDetail = ({ user }) => {
  const [tab, setTab] = useDetailTab(STUDENT_DETAIL_TABS);

  const infoRows = [
    {
      label: "Sinflar",
      value: user.classes?.length
        ? user.classes.map((cls) => cls.name).join(", ")
        : "Biriktirilmagan",
    },
    { label: "Jins", value: getGenderLabel(user.gender) },
    { label: "Tangalar", value: user.coinBalance ?? 0 },
    { label: "Jarima ballari", value: user.penaltyPoints ?? 0 },
    {
      label: "Holat",
      value: user.isArchived ? "Arxivlangan" : "Faol",
    },
    { label: "Ro'yxatdan o'tgan", value: formatDateUZ(user.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <UserDetailHeader
        user={user}
        backTo="/users/students"
        backLabel="O'quvchilar"
      />

      {/* TabsList o'zi gorizontal scroll qiladi — tor ekranda ham sig'adi */}
      <TabsButtons
        value={tab}
        onChange={setTab}
        items={STUDENT_DETAIL_TABS}
        listClassName="hidden-scrollbar"
      />

      {tab === "main" && (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Card title="Ma'lumotlarni tahrirlash" className="lg:col-span-2">
            <div className="mt-4">
              <UserForm mode="edit" initialData={user} />
            </div>
          </Card>

          <UserInfoCard title="Qisqacha" rows={infoRows} />
        </div>
      )}

      {tab === "attendance" && (
        <Card>
          <StudentAttendanceSummary studentId={user.id} />
        </Card>
      )}

      {tab === "finance" && (
        <Card>
          <StudentFinanceSection studentId={user.id} />
        </Card>
      )}

      {tab === "penalties" && (
        <UserPenaltiesTab userId={user.id} penaltyPoints={user.penaltyPoints} />
      )}
    </div>
  );
};

export default StudentDetail;
