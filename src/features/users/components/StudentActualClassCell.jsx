// Icons
import { Pencil } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useCanManageUser from "../hooks/useCanManageUser";

/**
 * "Haqiqiy sinfi" katagi — o'quvchining O'Z sinfi.
 *
 * Bitta komponent, chunki u IKKI JADVALDA bor (O'quvchilar ro'yxati va
 * sinf sahifasidagi o'quvchilar ro'yxati): ikki nusxa bo'lsa, biriga
 * qo'shilgan shart (ruxsat, egalik darvozasi) ikkinchisida tushib qolardi.
 *
 * ⚠️ Tahrirlash `users.update` bilan va O'QITUVCHI uchun egalik darvozasi
 * bilan (`useCanManageUser`) — serverdagi `restrictUserScope` ning ko'zgusi.
 * Ruxsati yo'qqa oddiy matn ko'rinadi: bosilganda 403 beradigan tugma
 * ko'rsatilmaydi.
 *
 * ⚠️ Qator bosilishiga TARQALMAYDI — aks holda tahrirlash oynasi o'rniga
 * o'quvchi sahifasi ochilib ketardi.
 */
const StudentActualClassCell = ({ user }) => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const canManage = useCanManageUser(user);

  const name = user?.actualClass?.name ?? null;
  const canEdit = canManage && can("users.update");

  if (!canEdit) {
    return <span className="text-gray-500">{name ?? "—"}</span>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openModal("editStudentActualClass", user);
      }}
      className={`group inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition hover:bg-gray-100 ${
        name
          ? "font-medium text-gray-900"
          : "border border-dashed border-gray-300 text-gray-400"
      }`}
    >
      <span className="line-clamp-1">{name ?? "Belgilash"}</span>
      <Pencil
        strokeWidth={1.5}
        className="size-3.5 shrink-0 text-gray-400 opacity-40 transition group-hover:opacity-100"
      />
    </button>
  );
};

export default StudentActualClassCell;
