import { getRoleLabel } from "@/shared/helpers/role.helpers";

/**
 * Sababning qamrovi (kimga tegishli) uchun badge ma'lumoti.
 * - appliesToAll  -> "Barchasi"
 * - roles bor     -> rol nomlari
 * - hech biri yo'q -> "Belgilanmagan"
 * @param {Object} reason - { appliesToAll, roles }
 * @param {Array} roles - global rollar ro'yxati
 * @returns {{ label: string, className: string }}
 */
export const getReasonScope = (reason = {}, roles = []) => {
  if (reason.appliesToAll) {
    return { label: "Barchasi", className: "bg-green-100 text-green-700" };
  }

  if (Array.isArray(reason.roles) && reason.roles.length > 0) {
    const label = reason.roles
      .map((value) => getRoleLabel(value, roles))
      .join(", ");
    return { label, className: "bg-blue-100 text-blue-700" };
  }

  return { label: "Belgilanmagan", className: "bg-gray-100 text-gray-500" };
};

/**
 * Berilgan rolga tegishli sabablarni filtrlaydi
 * (appliesToAll yoki roles ichida shu rol bor).
 * @param {Array} reasons - aktiv sabablar
 * @param {string} role - foydalanuvchi roli
 */
export const reasonsForRole = (reasons = [], role) =>
  reasons.filter(
    (r) => r.appliesToAll || (Array.isArray(r.roles) && r.roles.includes(role)),
  );
