export const getRoleLabel = (role) => {
  const labels = {
    owner: "Ega",
    teacher: "O'qituvchi",
    student: "O'quvchi",
  };

  return labels[role] || role;
};

export const isRoleAllowed = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

export const getAllRoles = () => [
  { value: "owner", label: "Ega" },
  { value: "teacher", label: "O'qituvchi" },
  { value: "student", label: "O'quvchi" },
];
