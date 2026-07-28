// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useStaff } from "@/features/permissions/queries/permissions.queries";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & data
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { permissionLabel } from "@/features/permissions/data/permissions.data";

// Icons
import { ShieldCheck, SlidersHorizontal } from "lucide-react";

const PermissionsPage = () => {
  const { openModal } = useModal();
  const { data: staff = [], isLoading } = useStaff();
  const { data: roles = [] } = useRoles();

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="page-title">Ruxsatlar</h1>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Xodimlarga admin paneldagi bo'limlar bo'yicha ruxsat bering yoki olib
        qo'ying. Owner har doim barcha bo'limlarga ega.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((user) => {
          const perms = user.permissions || [];

          return (
            <Card key={user.id}>
              {/* Top */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.fullName || user.firstName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.username} · {getRoleLabel(user.role, roles)}
                  </p>
                </div>

                <button
                  onClick={() => openModal("manageUserPermissions", user)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Ruxsatlarni boshqarish"
                >
                  <SlidersHorizontal className="size-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Granted permissions */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-1.5 mb-2 text-sm text-gray-600">
                  <ShieldCheck className="size-4" strokeWidth={1.5} />
                  {perms.length} ta ruxsat
                </div>

                {perms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((key) => (
                      <span
                        key={key}
                        className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {permissionLabel(key)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Ruxsatlar berilmagan</p>
                )}
              </div>

              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => openModal("manageUserPermissions", user)}
              >
                Boshqarish
              </Button>
            </Card>
          );
        })}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Ruxsat berish mumkin bo'lgan xodimlar yo'q</p>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
