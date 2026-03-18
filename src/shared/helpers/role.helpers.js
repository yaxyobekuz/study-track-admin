/**
 * Returns the display label for a role value.
 * @param {string} roleValue - The role's system value (e.g. "teacher")
 * @param {Array} roles - Array of role objects from the store
 * @returns {string} The display name
 */
export const getRoleLabel = (roleValue, roles = []) => {
  if (roleValue === "owner") return "Ega";
  const found = roles.find((r) => r.value === roleValue);
  return found ? found.name : roleValue;
};

/**
 * Checks if the user role is in the allowed roles list.
 * @param {string} userRole - The user's role value
 * @param {Array<string>} allowedRoles - Array of allowed role values
 * @returns {boolean}
 */
export const isRoleAllowed = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Returns all roles as select options, excluding owner.
 * @param {Array} roles - Array of role objects from the store
 * @returns {Array<{value: string, label: string}>}
 */
export const getAllRoles = (roles = []) =>
  roles
    .filter((r) => r.value !== "owner")
    .map((r) => ({ value: r.value, label: r.name }));
