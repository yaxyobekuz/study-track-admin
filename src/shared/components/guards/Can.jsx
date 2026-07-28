// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

/**
 * Amal darajasidagi ruxsat bo'lsagina bolalarini chizadi. Tugma/menyu
 * elementlarini yashirish uchun (server baribir har so'rovda tekshiradi —
 * bu faqat UI qatlami).
 *
 * @example
 * <Can do="users.create">
 *   <Button onClick={...}>Qo'shish</Button>
 * </Can>
 *
 * <Can do="users.delete" fallback={<span className="text-gray-400">—</span>}>
 *   <DeleteButton />
 * </Can>
 *
 * @param {object} props
 * @param {string} props.do - ruxsat kaliti ("users.create")
 * @param {React.ReactNode} [props.fallback] - ruxsat bo'lmasa ko'rsatiladigan element
 * @param {React.ReactNode} props.children
 */
const Can = ({ do: permission, fallback = null, children }) => {
  const { can } = usePermissions();

  return can(permission) ? children : fallback;
};

export default Can;
