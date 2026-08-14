// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Components
import UserRowActions from "../UserRowActions";

// Hooks
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & data
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { getInitials, getRoleBadgeClass } from "../../data/users.data";

/**
 * Detal sahifaning sarlavhasi: kim ekani, qayerdan kelingani va harakatlar.
 *
 * Harakatlar ro'yxatdagi bilan bir xil komponent — parolni ko'rish, tiklash,
 * arxivlash/o'chirish bir joyda ta'riflangan, shuning uchun ikki joyda
 * boshqacha ishlab qolmaydi. "Tahrirlash" bu yerda ko'rsatilmaydi: sahifaning
 * o'zi allaqachon tahrirlash sahifasi.
 */
const UserDetailHeader = ({ user, backTo, backLabel }) => {
  const { data: roles = [] } = useRoles();

  return (
    <div className="space-y-4">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="size-4" />
        {backLabel}
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-600">
            {getInitials(user)}
          </span>

          <div>
            <h1 className="page-title">{user.fullName}</h1>

            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">@{user.username}</span>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}
              >
                {getRoleLabel(user.role, roles)}
              </span>

              {user.isArchived && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  Arxivlangan
                </span>
              )}

              {!user.isArchived && !user.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
                  Nofaol
                </span>
              )}
            </div>
          </div>
        </div>

        <UserRowActions
          user={user}
          showEdit={false}
          isArchived={user.isArchived}
          redirectAfterDelete={backTo}
        />
      </div>
    </div>
  );
};

export default UserDetailHeader;
