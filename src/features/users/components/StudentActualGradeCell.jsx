// Icons
import { Pencil } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useCanManageUser from "../hooks/useCanManageUser";

// Data
import { formatGrade } from "../data/users.data";

/**
 * "Asl sinfi" katagi — o'quvchining maktab darajasi (1-sinf … 11-sinf).
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
const StudentActualGradeCell = ({ user }) => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const canManage = useCanManageUser(user);

  const label = formatGrade(user?.actualGrade);
  const canEdit = canManage && can("users.update");

  if (!canEdit) {
    return <span className="text-gray-500">{label ?? "—"}</span>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openModal("editStudentActualGrade", user);
      }}
      className={`group inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition hover:bg-gray-100 ${
        label
          ? "font-medium text-gray-900"
          : "border border-dashed border-gray-300 text-gray-400"
      }`}
    >
      <span className="line-clamp-1">{label ?? "Belgilash"}</span>
      <Pencil
        strokeWidth={1.5}
        className="size-3.5 shrink-0 text-gray-400 opacity-40 transition group-hover:opacity-100"
      />
    </button>
  );
};

export default StudentActualGradeCell;
