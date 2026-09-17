// Router
import { Link, useLocation, useNavigate } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Components
import UserRowActions from "../UserRowActions";

// Hooks
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & data
import { formatDateTimeUz } from "@/shared/utils/date.utils";
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
  const location = useLocation();
  const navigate = useNavigate();

  // ⚠️ "ORQAGA" — KELGAN JOYGA, qat'iy ro'yxatga emas. Profilga davomat
  // hisoboti, qarzdorlar, sinf moliyasi va boshqa ekranlardan kiriladi;
  // qat'iy `backTo` foydalanuvchini butunlay boshqa bo'limga otib yuborardi.
  // `default` kalit — sahifa to'g'ridan-to'g'ri ochilgan (havola, yangilash):
  // ilova ichida qaytadigan joy yo'q, shuning uchun o'shanda ro'yxatga.
  const hasHistory = location.key !== "default";
  const backClassName =
    "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700";

  return (
    <div className="space-y-4">
      {hasHistory ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={backClassName}
        >
          <ChevronLeft className="size-4" />
          Orqaga
        </button>
      ) : (
        <Link to={backTo} className={backClassName}>
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      )}

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

      {/* Qachon va nega arxivlangani — izoh arxivlash oynasida yoziladi */}
      {user.isArchived && (
        <p className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
          Arxivlangan: {formatDateTimeUz(user.archivedAt)}
          {user.archiveNote && (
            <>
              {" — "}
              <span className="text-gray-800">{user.archiveNote}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default UserDetailHeader;
