import useAuth from "@/shared/hooks/useAuth";
import {
  hasPermission,
  hasSection,
} from "@/features/permissions/data/permissions.data";

/**
 * Amal darajasidagi ruxsatlarni tekshirish (server bilan bir xil mantiq).
 *
 * Owner doim hammaga ega. Grant qilinmaydigan kalitlar (masalan "roles",
 * "permissions") hech qachon saqlanmaydi — shuning uchun ular faqat owner
 * uchun `true` bo'ladi (owner-only sahifalar tabiiy ravishda himoyalanadi).
 *
 * @example
 * const { can, canSection, isOwner } = usePermissions();
 * if (can("users.create")) { ... }   // tugmani ko'rsatish
 * if (canSection("users")) { ... }   // bo'limda umuman biror amali bormi
 */
const usePermissions = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const permissions = user?.permissions || [];

  /**
   * @param {string|null} key - ruxsat kaliti ("users.create"); `null` → doim ochiq
   * @returns {boolean}
   */
  const can = (key) => {
    if (!key) return true;
    if (isOwner) return true;
    return hasPermission(permissions, key);
  };

  /**
   * @param {string|null} section - bo'lim kaliti ("users")
   * @returns {boolean}
   */
  const canSection = (section) => {
    if (!section) return true;
    if (isOwner) return true;
    return hasSection(permissions, section);
  };

  return { can, canSection, isOwner, permissions };
};

export default usePermissions;
