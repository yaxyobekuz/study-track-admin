// Components
import Card from "@/shared/components/ui/Card";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import UserForm from "../UserForm";
import UserDetailHeader from "./UserDetailHeader";
import UserInfoCard from "./UserInfoCard";
import UserPenaltiesTab from "./UserPenaltiesTab";
import StaffAttendanceSummary from "@/features/attendance/components/StaffAttendanceSummary";

// Hooks
import useDetailTab from "../../hooks/useDetailTab";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & utils
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { STAFF_DETAIL_TABS } from "../../data/usersTabs.data";
import { getGenderLabel } from "../../data/users.data";
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

/**
 * Xodimning detal sahifasi.
 *
 * O'quvchinikidan alohida komponent: xodimda moliya yo'q, lekin ish jadvali
 * bor va davomati kelish/ketish vaqti bilan hisoblanadi. Ikkalasini bitta
 * komponentda `role` shartlari bilan aralashtirish o'rniga har biri o'z
 * tablarini o'zi e'lon qiladi.
 */
const StaffDetail = ({ user }) => {
  const [tab, setTab] = useDetailTab(STAFF_DETAIL_TABS);
  const { data: roles = [] } = useRoles();

  const workDays = (user.workDays ?? [])
    .map((day) => WORK_DAYS_OPTIONS.find((option) => option.value === day)?.label)
    .filter(Boolean)
    .join(", ");

  const infoRows = [
    { label: "Rol", value: getRoleLabel(user.role, roles) },
    { label: "Jins", value: getGenderLabel(user.gender) },
    {
      label: "Ish vaqti",
      value:
        user.workStartTime && user.workEndTime
          ? `${user.workStartTime}–${user.workEndTime}`
          : "Rol bo'yicha",
    },
    { label: "Ish kunlari", value: workDays || "Rol bo'yicha" },
    { label: "Jarima ballari", value: user.penaltyPoints ?? 0 },
    { label: "Ro'yxatdan o'tgan", value: formatDateUZ(user.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <UserDetailHeader user={user} backTo="/users/staff" backLabel="Xodimlar" />

      {/* TabsList o'zi gorizontal scroll qiladi — tor ekranda ham sig'adi */}
      <TabsButtons
        value={tab}
        onChange={setTab}
        items={STAFF_DETAIL_TABS}
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
          <StaffAttendanceSummary userId={user.id} />
        </Card>
      )}

      {tab === "penalties" && (
        <UserPenaltiesTab userId={user.id} penaltyPoints={user.penaltyPoints} />
      )}
    </div>
  );
};

export default StaffDetail;
