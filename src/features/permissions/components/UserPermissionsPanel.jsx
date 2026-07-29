// React
import { useEffect, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import PermissionsMatrix from "@/features/permissions/components/PermissionsMatrix";

// Hooks
import { useUpdateUserPermissions } from "@/features/permissions/queries/permissions.mutations";

// Utils, helpers & data
import { cn } from "@/shared/utils/cn";
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { toPermissionSet } from "@/features/permissions/data/permissions.data";

/**
 * Ruxsatlar sahifasining 2-paneli: tanlangan foydalanuvchining ruxsatlarini
 * shu yerda ko'rsatadi va tahrirlaydi. O'zgarishlar "Saqlash" bosilgunicha
 * faqat mahalliy holatda turadi.
 *
 * @param {object} props
 * @param {object} props.user - Tanlangan xodim (ruxsatlari bilan)
 * @param {Array} props.roles - Rollar (label uchun)
 * @param {(dirty: boolean) => void} [props.onDirtyChange] - Saqlanmagan o'zgarish holati
 * @param {string} [props.className]
 */
const UserPermissionsPanel = ({
  user,
  roles = [],
  onDirtyChange,
  className = "",
}) => {
  const { mutate: updatePermissions, isPending } = useUpdateUserPermissions();

  const [selected, setSelected] = useState(() => toPermissionSet(user.permissions));

  // Serverdagi va ekrandagi holat — solishtirish uchun (ikkalasi ham katalog tartibida)
  const savedKeys = useMemo(
    () => [...toPermissionSet(user.permissions)].join(","),
    [user.permissions],
  );
  const isDirty = [...selected].join(",") !== savedKeys;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = () =>
    updatePermissions(
      { id: user.id, permissions: [...selected] },
      {
        onSuccess: () => toast.success("Ruxsatlar yangilandi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

  const name = user.fullName || user.firstName;

  return (
    <Card className={cn("flex flex-col p-0 xs:p-0", className)}>
      {/* Foydalanuvchi + saqlash */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 xs:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold uppercase text-white">
            {name?.[0]}
          </span>

          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{name}</p>
            <p className="truncate text-sm text-gray-500">
              {user.username} · {getRoleLabel(user.role, roles)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <span className="text-xs font-medium text-amber-600">Saqlanmagan</span>
          )}

          <Button
            variant="secondary"
            disabled={!isDirty || isPending}
            onClick={() => setSelected(toPermissionSet(user.permissions))}
          >
            Bekor qilish
          </Button>

          <Button disabled={!isDirty || isPending} onClick={handleSave}>
            Saqlash
            {isPending && "..."}
          </Button>
        </div>
      </div>

      <PermissionsMatrix value={selected} onChange={setSelected} />
    </Card>
  );
};

export default UserPermissionsPanel;
