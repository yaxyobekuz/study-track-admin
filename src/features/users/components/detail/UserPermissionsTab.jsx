// Icons
import { Plus, Building2 } from "lucide-react";

// React
import { useEffect, useState } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useUserBranches } from "@/features/users/queries/users.queries";

// Helpers
import { cn } from "@/shared/utils/cn";
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import BranchPermissionsPanel from "./BranchPermissionsPanel";
import AttachUserBranchModal from "../AttachUserBranchModal";

/**
 * Xodimning "Ruxsatlar" tabi.
 *
 * ⚠️ RUXSATLAR HAR FILIALDA ALOHIDA: `permissions` xodimning o'sha filialdagi
 * profilida yotadi, ya'ni bir odam Chilonzorda kassir, Yunusobodda o'qituvchi
 * bo'la oladi. Shuning uchun tab bitta ro'yxat emas — avval FILIAL tanlanadi,
 * keyin o'sha filialning ruxsatlari tahrirlanadi.
 *
 * Filialga biriktirish ham shu yerda: "qayerda ishlaydi" va "u yerda nima
 * qila oladi" bir-biridan ajralmaydi.
 */
const UserPermissionsTab = ({ user }) => {
  const { openModal } = useModal();
  const { data: roles = [] } = useRoles();
  const { data: rows = [], isLoading } = useUserBranches(user.id);

  const [activeId, setActiveId] = useState(null);

  // Tanlangan filial ro'yxatdan chiqib ketsa (chiqarildi) — asosiysiga qaytamiz
  useEffect(() => {
    if (rows.length === 0) return;
    if (!rows.some((row) => row.branch.id === activeId)) {
      setActiveId((rows.find((row) => row.isHome) ?? rows[0]).branch.id);
    }
  }, [rows, activeId]);

  const active = rows.find((row) => row.branch.id === activeId) ?? rows[0];

  if (isLoading) return <LoaderCard />;

  return (
    <div className="space-y-4">
      {/* Filial tanlash */}
      <div className="rounded-2xl bg-white p-4 xs:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Filiallar</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Ruxsatlar har filialda alohida — avval filialni tanlang
            </p>
          </div>

          <Can do="branches.assign">
            <Button
              variant="secondary"
              onClick={() => openModal("attachUserBranch", { user, rows })}
            >
              <Plus strokeWidth={1.5} />
              Biriktirish
            </Button>
          </Can>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {rows.map((row) => {
              const isActive = row.branch.id === active?.branch.id;

              return (
                <button
                  key={row.branch.id}
                  type="button"
                  onClick={() => setActiveId(row.branch.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <Building2
                    size={16}
                    strokeWidth={1.5}
                    className={cn(
                      "shrink-0",
                      isActive ? "text-primary" : "text-gray-400",
                    )}
                  />

                  <span className="min-w-0">
                    <span className="block truncate font-medium text-gray-900">
                      {row.branch.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {getRoleLabel(row.role, roles)} · {row.permissions.length} ta
                    </span>
                  </span>

                  {row.isHome && (
                    <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      Asosiy
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tanlangan filialning ruxsatlari.
          `key` — filial almashtirilganda panel qaytadan quriladi va
          saqlanmagan o'zgarishlar boshqa filialga ko'chib o'tmaydi. */}
      {active ? (
        <BranchPermissionsPanel
          key={active.branch.id}
          user={user}
          row={active}
          roleLabel={getRoleLabel(active.role, roles)}
        />
      ) : (
        <EmptyState
          icon={Building2}
          title="Filialga biriktirilmagan"
          description="Xodim hech bir filialda ishlamayapti. Bu odatiy holat emas — uni filialga biriktiring."
        />
      )}

      <AttachUserBranchModal />
    </div>
  );
};

export default UserPermissionsTab;
