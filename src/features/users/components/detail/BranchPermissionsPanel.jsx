// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Building2, LogOut, TriangleAlert } from "lucide-react";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import { useUpdateUserPermissions } from "@/features/permissions/queries/permissions.mutations";
import { useDetachUserBranch } from "@/features/users/queries/users.mutations";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import PermissionsMatrix from "@/features/permissions/components/PermissionsMatrix";

// Data
import { toPermissionSet } from "@/features/permissions/data/permissions.data";

/**
 * BITTA FILIALDAGI ruxsatlar paneli.
 *
 * Tashqaridan `key={branch.id}` bilan chiziladi — filial almashtirilganda
 * komponent qaytadan quriladi va saqlanmagan o'zgarishlar u bilan birga
 * ketadi. Aks holda bir filialda belgilangan katakchalar boshqasiga
 * ko'chib o'tardi.
 *
 * @param {object} props
 * @param {object} props.user
 * @param {object} props.row - `getUserBranches` qatori
 * @param {string} props.roleLabel
 */
const BranchPermissionsPanel = ({ user, row, roleLabel }) => {
  const { can } = usePermissions();
  const { mutate: updatePermissions, isPending } = useUpdateUserPermissions();
  const { mutate: detach, isPending: isDetaching } = useDetachUserBranch();

  const [selected, setSelected] = useState(() => toPermissionSet(row.permissions));

  // Serverdagi va ekrandagi holat — ikkalasi ham katalog tartibida, shuning
  // uchun oddiy satr taqqoslash yetarli (`UserPermissionsPanel` uslubi).
  const savedKeys = useMemo(
    () => [...toPermissionSet(row.permissions)].join(","),
    [row.permissions],
  );
  const isDirty = [...selected].join(",") !== savedKeys;

  // Ruxsat berish endpointi owner-only (`permission.routes.js`), shuning
  // uchun matritsa boshqalarga faqat O'QISH uchun ochiq.
  const canEdit = can("permissions");

  const handleSave = () =>
    updatePermissions(
      { id: user.id, permissions: [...selected], branchId: row.branch.id },
      {
        onSuccess: () =>
          toast.success(`"${row.branch.name}" uchun ruxsatlar yangilandi`),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

  const handleDetach = () =>
    detach(
      { id: user.id, branchId: row.branch.id },
      {
        onSuccess: () =>
          toast.success(`"${row.branch.name}" filialidan chiqarildi`),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

  return (
    <section className="overflow-hidden rounded-2xl bg-white">
      {/* Sarlavha: qaysi filial, qanday rol, nechta ruxsat */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 xs:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
            <Building2 size={18} strokeWidth={1.5} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-gray-900">
                {row.branch.name}
              </p>

              {row.isHome && (
                <span
                  title="Foydalanuvchi tizimga aynan shu filial orqali kiradi"
                  className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700"
                >
                  Asosiy
                </span>
              )}

              {!row.isActive && (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                  Nofaol
                </span>
              )}
            </div>

            <p className="truncate text-sm text-gray-500">
              {roleLabel} · {selected.size} ta ruxsat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Asosiy filialdan chiqarib bo'lmaydi — login o'sha yerga tushadi */}
          {!row.isHome && (
            <Can do="branches.assign">
              <Button
                variant="secondary"
                disabled={isDetaching}
                onClick={handleDetach}
              >
                <LogOut strokeWidth={1.5} />
                Chiqarish
              </Button>
            </Can>
          )}

          {canEdit && (
            <Button disabled={!isDirty || isPending} onClick={handleSave}>
              Saqlash
              {isPending && "..."}
            </Button>
          )}
        </div>
      </div>

      {/* Biriktirish bor, lekin profil yo'q — jim qolmasligi kerak */}
      {row.profileMissing && (
        <p className="flex items-start gap-1.5 border-b bg-amber-50 px-4 py-3 text-sm text-amber-800 xs:px-5">
          <TriangleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          Bu filialda xodim profili topilmadi. Biriktirishni bekor qilib,
          qaytadan biriktiring.
        </p>
      )}

      {/* Ruxsatlar matritsasi — `/permissions` sahifasidagi bilan bir xil */}
      <div className={canEdit ? "" : "pointer-events-none opacity-60"}>
        <PermissionsMatrix value={selected} onChange={setSelected} />
      </div>

      {!canEdit && (
        <p className="border-t px-4 py-3 text-sm text-gray-500 xs:px-5">
          Ruxsatlarni faqat tizim egasi o'zgartira oladi.
        </p>
      )}
    </section>
  );
};

export default BranchPermissionsPanel;
