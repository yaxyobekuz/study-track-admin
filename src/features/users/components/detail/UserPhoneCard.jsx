// Components
import InfoCard from "./InfoCard";
import CallButton from "@/shared/components/ui/CallButton";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatPhoneUz, hasPhone } from "@/shared/utils/phone.utils";

// Data
import { getPhoneLabels } from "../../data/users.data";

/**
 * "Telefon raqamlari" kartasi — o'quvchi va xodim detalida bir xil.
 *
 * Raqamlar HAMMAGA ko'rinadi (davomatda qo'ng'iroq qilish uchun kerak),
 * qalam esa faqat `users.phone` ruxsati bilan: raqam identifikatsiya
 * maydoni, `users.update` bilan birga ochilib ketmasligi kerak.
 *
 * @param {object} props
 * @param {object} props.user
 * @param {boolean} props.canEdit - egalik darvozasi (`useCanManageUser`)
 */
const UserPhoneCard = ({ user, canEdit }) => {
  const { openModal } = useModal();
  const labels = getPhoneLabels(user.role);

  const rows = [
    {
      label: labels.phoneShort,
      value: <PhoneValue field="phone" value={user.phone} labels={labels} />,
    },
    {
      label: labels.parentPhoneShort,
      value: (
        <PhoneValue field="parentPhone" value={user.parentPhone} labels={labels} />
      ),
    },
  ];

  return (
    <InfoCard
      rows={rows}
      canEdit={canEdit}
      title="Telefon raqamlari"
      editPermission="users.phone"
      onEdit={() => openModal("editUserPhone", user)}
    />
  );
};

/**
 * Bitta raqam: formatlangan matn + qo'ng'iroq tugmasi. Raqam yo'q bo'lsa
 * faqat `—` — "Raqam kiritilmagan" belgisi bu yerda ortiqcha shovqin.
 *
 * `field` orqali beriladi (`phone` / `parentPhone`), shunda tugmaning
 * tooltip'i ham to'g'ri yorliqni oladi.
 */
const PhoneValue = ({ field, value, labels }) => {
  if (!hasPhone(value)) return "—";

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-gray-900">{formatPhoneUz(value)}</span>
      <CallButton
        compact
        labels={{ phone: labels.phoneShort, parentPhone: labels.parentPhoneShort }}
        {...{ [field]: value }}
      />
    </span>
  );
};

export default UserPhoneCard;
