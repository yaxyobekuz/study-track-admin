// Router
import { Link, useLocation } from "react-router-dom";

// Icons
import { Building2, ShieldCheck, TriangleAlert } from "lucide-react";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useUserBranches } from "@/features/users/queries/users.queries";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

/**
 * "Filiallar" kartasi — xodim qayerda ishlaydi. FAQAT O'QISH uchun.
 *
 * Biriktirish va ruxsatlarni sozlash "Ruxsatlar" tabida: ular bir-biridan
 * ajralmaydi (filialga kirish huquqining o'zi — grant) va ikki joyda
 * takrorlanishi kerak emas. Bu karta shunchaki "qayerda ishlaydi" degan
 * savolga asosiy sahifada javob beradi va tabga yo'naltiradi.
 */
const UserBranchesCard = ({ user }) => {
  const { can } = usePermissions();
  const { pathname } = useLocation();
  const { data: roles = [] } = useRoles();
  const { data: rows = [], isLoading } = useUserBranches(user.id);

  // O'quvchi bitta filialda o'qiydi — unga bu karta ko'rsatilmaydi.
  if (user.role === "student") return null;

  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Filiallar</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Har filialda alohida rol va ruxsatlar
          </p>
        </div>

        {can("branches.assign") && (
          <Link
            to={`${pathname}?tab=permissions`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-primary hover:bg-primary/5"
          >
            <ShieldCheck size={16} strokeWidth={1.5} />
            Sozlash
          </Link>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-gray-500">Yuklanmoqda...</p>}

        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            Filialga biriktirilmagan. Bu odatiy holat emas — administratorga
            murojaat qiling.
          </p>
        )}

        {rows.map((row) => (
          <div
            key={row.branch.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-3.5 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Building2
                size={16}
                strokeWidth={1.5}
                className="shrink-0 text-gray-400"
              />
              <span className="truncate font-medium text-gray-900">
                {row.branch.name}
              </span>

              {row.isHome && (
                <span
                  title="Foydalanuvchi tizimga aynan shu filial orqali kiradi"
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700"
                >
                  Asosiy
                </span>
              )}

              {row.profileMissing && (
                <span
                  title="Bu filialda xodim profili topilmadi"
                  className="shrink-0 text-amber-600"
                >
                  <TriangleAlert size={14} strokeWidth={1.75} />
                </span>
              )}
            </div>

            <p className="shrink-0 text-sm text-gray-500">
              {getRoleLabel(row.role, roles)} ·{" "}
              {row.permissions.length > 0
                ? `${row.permissions.length} ta ruxsat`
                : "ruxsat berilmagan"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserBranchesCard;
