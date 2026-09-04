// Components
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import StaffMainTab from "./StaffMainTab";
import StaffPayrollTab from "./StaffPayrollTab";
import StaffWorkloadTab from "./StaffWorkloadTab";
import UserDetailHeader from "./UserDetailHeader";
import UserPenaltiesTab from "./UserPenaltiesTab";
import UserPermissionsTab from "./UserPermissionsTab";
import UserAttendancePanel from "@/features/attendance/components/UserAttendancePanel";

// Hooks
import useDetailTab from "../../hooks/useDetailTab";
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import { STAFF_DETAIL_TABS } from "../../data/usersTabs.data";

/**
 * Xodimning detal sahifasi.
 *
 * O'quvchinikidan alohida komponent: xodimda hisob-faktura emas OYLIK bor,
 * ish jadvali bor va davomati kelish/ketish vaqti bilan hisoblanadi.
 * Ikkalasini bitta komponentda `role` shartlari bilan aralashtirish o'rniga
 * har biri o'z tablarini o'zi e'lon qiladi.
 */
const StaffDetail = ({ user }) => {
  const { can } = usePermissions();

  // Ruxsati bo'lmagan yoki bu rolga ma'nosiz tab umuman ko'rinmaydi — bo'sh
  // sahifa ochilishidan ko'ra tabning o'zi bo'lmagani tushunarliroq. Ro'yxat
  // kichik, shuning uchun memo shart emas (`can` har render'da yangidan
  // hosil bo'ladi).
  const tabs = STAFF_DETAIL_TABS.filter(
    (tab) =>
      can(tab.permission) && (!tab.roles || tab.roles.includes(user.role)),
  );

  const [tab, setTab] = useDetailTab(tabs);

  return (
    <div className="space-y-4">
      <UserDetailHeader user={user} backTo="/users/staff" backLabel="Xodimlar" />

      {/* TabsList o'zi gorizontal scroll qiladi — tor ekranda ham sig'adi */}
      <TabsButtons
        value={tab}
        onChange={setTab}
        items={tabs}
        listClassName="hidden-scrollbar"
      />

      {tab === "main" && <StaffMainTab user={user} />}

      {tab === "workload" && <StaffWorkloadTab user={user} />}

      {tab === "payroll" && <StaffPayrollTab user={user} />}

      {tab === "permissions" && <UserPermissionsTab user={user} />}

      {tab === "attendance" && (
        <UserAttendancePanel variant="staff" user={user} />
      )}

      {tab === "penalties" && (
        <UserPenaltiesTab userId={user.id} penaltyPoints={user.penaltyPoints} />
      )}
    </div>
  );
};

export default StaffDetail;
