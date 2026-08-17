// Components
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import StaffMainTab from "./StaffMainTab";
import UserDetailHeader from "./UserDetailHeader";
import UserPenaltiesTab from "./UserPenaltiesTab";
import UserAttendancePanel from "@/features/attendance/components/UserAttendancePanel";

// Hooks
import useDetailTab from "../../hooks/useDetailTab";

// Data
import { STAFF_DETAIL_TABS } from "../../data/usersTabs.data";

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

      {tab === "main" && <StaffMainTab user={user} />}

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
