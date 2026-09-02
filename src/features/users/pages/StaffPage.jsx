// Router
import { useSearchParams } from "react-router-dom";

// Components
import Select from "@/shared/components/ui/select/Select";
import UsersListView from "../components/UsersListView";
import UserRowActions from "../components/UserRowActions";
import StaffReportPanel from "../components/reports/StaffReportPanel";

// Hooks
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & data
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import {
  STAFF_TABLE_COLUMNS,
  getInitials,
  getRoleBadgeClass,
} from "../data/users.data";
import { STAFF_LIST_TABS } from "../data/usersTabs.data";

/**
 * Xodimlar sahifasi — o'quvchilardan boshqa barcha rollar.
 *
 * Xodim uchun muhim ustunlar: roli va ish vaqti (davomat shu asosda
 * hisoblanadi). Tanga va sinf ustunlari bu yerda ma'nosiz, shuning uchun yo'q.
 *
 * Ro'yxatdan tashqari "Hisobotlar" tabi ham bor — u qatorlarni emas, butun
 * shtat manzarasini ko'rsatadi (`users.reports` ruxsati bilan).
 */
const StaffPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: roles = [] } = useRoles();

  const roleFilter = searchParams.get("role") || "all";

  // Owner ham xodim, lekin u bitta — filtrda o'rin egallashi shart emas
  const roleOptions = [
    { value: "all", label: "Barcha xodimlar" },
    ...roles
      .filter((role) => role.value !== "owner" && role.value !== "student")
      .map((role) => ({ value: role.value, label: role.name })),
  ];

  const handleRoleChange = (value) =>
    setSearchParams((prev) => {
      if (value && value !== "all") prev.set("role", value);
      else prev.delete("role");
      prev.delete("page");
      return prev;
    });

  return (
    <UsersListView
      variant="staff"
      title="Xodimlar"
      description="O'qituvchilar, adminlar va boshqa xodimlar"
      columns={STAFF_TABLE_COLUMNS}
      tabs={STAFF_LIST_TABS}
      tabPanels={{ reports: <StaffReportPanel /> }}
      emptyText="Xodimlar topilmadi"
      emptyArchivedText="Arxivlangan xodimlar yo'q"
      filters={
        <Select
          value={roleFilter}
          options={roleOptions}
          placeholder="Rol tanlang"
          onChange={handleRoleChange}
          triggerClassName="w-full sm:w-48 sm:shrink-0"
        />
      }
      renderRow={(user, { isArchived }) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {getInitials(user)}
              </span>
              <div>
                <p className="font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
          </td>

          <td className="px-4 py-3 whitespace-nowrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}
            >
              {getRoleLabel(user.role, roles)}
            </span>
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
            {user.effectiveSchedule?.workStartTime &&
            user.effectiveSchedule?.workEndTime
              ? `${user.effectiveSchedule.workStartTime}–${user.effectiveSchedule.workEndTime}`
              : "—"}
          </td>

          <td className="px-4 py-3 text-gray-500">{user.penaltyPoints ?? 0}</td>

          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <UserRowActions user={user} isArchived={isArchived} />
          </td>
        </>
      )}
    />
  );
};

export default StaffPage;
