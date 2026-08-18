// Components
import Card from "@/shared/components/ui/Card";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import StudentMainTab from "./StudentMainTab";
import UserDetailHeader from "./UserDetailHeader";
import UserPenaltiesTab from "./UserPenaltiesTab";
import UserAttendancePanel from "@/features/attendance/components/UserAttendancePanel";
import StudentFinanceSection from "@/features/finance/components/StudentFinanceSection";
import StudentEnrollmentSection from "@/features/enrollment/components/StudentEnrollmentSection";

// Hooks
import useDetailTab from "../../hooks/useDetailTab";

// Data
import { STUDENT_DETAIL_TABS } from "../../data/usersTabs.data";

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

      {tab === "main" && <StudentMainTab user={user} />}

      {tab === "enrollment" && (
        <Card>
          <StudentEnrollmentSection studentId={user.id} />
        </Card>
      )}

      {tab === "attendance" && (
        <UserAttendancePanel variant="student" user={user} />
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
