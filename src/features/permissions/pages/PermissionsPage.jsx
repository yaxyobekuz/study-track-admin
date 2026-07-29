// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Card from "@/shared/components/ui/Card";
import StaffPermissionsList from "@/features/permissions/components/StaffPermissionsList";
import UserPermissionsPanel from "@/features/permissions/components/UserPermissionsPanel";

// Hooks
import { useStaff } from "@/features/permissions/queries/permissions.queries";
import { useRoles } from "@/features/roles/queries/roles.queries";

const PermissionsPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const { data: staff = [], isLoading } = useStaff();
  const { data: roles = [] } = useRoles();

  // Tanlanmagan bo'lsa (yoki tanlangan xodim ro'yxatdan chiqib ketsa) — birinchisi
  const selected = staff.find((user) => user.id === selectedId) || staff[0];

  // Saqlanmagan o'zgarish bo'lsa — boshqa xodimga o'tishni tasdiqlatamiz
  const handleSelect = (id) => {
    if (id === selected?.id) return;

    if (isDirty) {
      return toast.warning("Saqlanmagan o'zgarishlar bor", {
        description: "Boshqa xodimga o'tsangiz, ular bekor qilinadi.",
        action: {
          label: "O'tish",
          onClick: () => {
            setIsDirty(false);
            setSelectedId(id);
          },
        },
      });
    }

    setSelectedId(id);
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="page-title">Ruxsatlar</h1>
      </div>

      {!selected ? (
        <Card className="py-12 text-center">
          <p className="text-gray-500">Ruxsat berish mumkin bo'lgan xodimlar yo'q</p>
        </Card>
      ) : (
        /* 1-panel — 1/3, 2-panel — 2/3 */
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <StaffPermissionsList
            staff={staff}
            roles={roles}
            selectedId={selected.id}
            onSelect={handleSelect}
            className="lg:col-span-1"
          />

          <UserPermissionsPanel
            key={selected.id}
            user={selected}
            roles={roles}
            onDirtyChange={setIsDirty}
            className="lg:col-span-2"
          />
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
