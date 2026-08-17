// Icons
import { Eye, Key } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import InfoCard from "./InfoCard";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Tizimga kirish ma'lumotlari.
 *
 * Parol bu yerda ko'rsatilmaydi — u alohida ruxsatli endpointdan olinadi,
 * shuning uchun karta faqat uni ochadigan tugmani beradi.
 */
const UserAccountCard = ({ user }) => {
  const { openModal } = useModal();

  const hasTelegram = (user.telegramIds ?? []).length > 0;

  const rows = [
    { label: "Username", value: user.username },
    {
      label: "Parol",
      value: (
        <Can
          do="users.password"
          fallback={<span className="text-gray-400">Yashirin</span>}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openModal("viewUserPassword", user)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <Eye className="size-3.5" />
              Ko'rish
            </button>

            <button
              type="button"
              onClick={() => openModal("resetUserPassword", user)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <Key className="size-3.5" />
              Tiklash
            </button>
          </div>
        </Can>
      ),
    },
    { label: "Telegram", value: hasTelegram ? "Ulangan" : "Ulanmagan" },
  ];

  // Premium faqat o'quvchida ma'noga ega
  if (user.role === "student") {
    rows.push({
      label: "Premium",
      value: user.premiumIsActive
        ? user.premiumExpiresAt
          ? `Faol — ${formatDateUZ(user.premiumExpiresAt)} gacha`
          : "Faol"
        : "Yo'q",
    });
  }

  return <InfoCard title="Hisob" rows={rows} />;
};

export default UserAccountCard;
