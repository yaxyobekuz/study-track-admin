import useAuth from "@/shared/hooks/useAuth";

/**
 * Bo'lim darajasidagi ruxsatlarni tekshirish (server bilan bir xil mantiq).
 *
 * Owner doim hammaga ega. Grant qilinmaydigan kalitlar (masalan "roles",
 * "permissions") hech qachon saqlanmaydi — shuning uchun ular faqat owner
 * uchun `true` bo'ladi (owner-only sahifalar tabiiy ravishda himoyalanadi).
 *
 * @example
 * const { can, isOwner } = usePermissions();
 * if (can("grades")) { ... }
 */
const usePermissions = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const permissions = user?.permissions || [];

  /**
   * @param {string|null} key - ruxsat kaliti; `null`/`undefined` → doim ochiq
   * @returns {boolean}
   */
  const can = (key) => {
    if (!key) return true;
    if (isOwner) return true;
    return permissions.includes(key);
  };

  return { can, isOwner, permissions };
};

export default usePermissions;
