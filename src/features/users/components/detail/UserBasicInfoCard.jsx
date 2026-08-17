// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import InfoCard, { InfoRows } from "./InfoCard";

// Data
import { getInitials, getRoleBadgeClass } from "../../data/users.data";

/**
 * Detal sahifasining birinchi kartasi: chapda kim ekani, o'ngda maydonlar.
 *
 * Chap tomon ikkala rolda ham bir xil (rasm, ism, username, rol), o'ng tomon
 * esa `rows` orqali keladi — xodim va o'quvchida ko'rsatiladigan maydonlar
 * boshqacha.
 *
 * @param {object} props
 * @param {object} props.user
 * @param {string} props.roleLabel
 * @param {{label: string, value: React.ReactNode}[]} props.rows
 */
const UserBasicInfoCard = ({ user, roleLabel, rows }) => {
  const { openModal } = useModal();

  return (
    <InfoCard
      title="Asosiy ma'lumot"
      onEdit={() => openModal("editUserBasic", user)}
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 lg:divide-x lg:divide-gray-100">
        <div className="flex items-center gap-5">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-500">
            {getInitials(user)}
          </span>

          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900">
              {user.fullName}
            </p>
            <p className="mt-0.5 text-sm text-gray-500">@{user.username}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(user.role)}`}
              >
                {roleLabel}
              </span>

              {user.isArchived && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Arxivlangan
                </span>
              )}

              {!user.isArchived && !user.isActive && (
                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Nofaol
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-lg:border-t max-lg:border-gray-100 max-lg:pt-5 lg:pl-10">
          <InfoRows rows={rows} />
        </div>
      </div>
    </InfoCard>
  );
};

export default UserBasicInfoCard;
