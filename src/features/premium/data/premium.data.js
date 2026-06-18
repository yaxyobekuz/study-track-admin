// Obuna holati filtri uchun variantlar
export const subscriptionStatusOptions = [
  { value: "all", label: "Barchasi" },
  { value: "active", label: "Faol" },
  { value: "expired", label: "Tugagan" },
  { value: "revoked", label: "Bekor qilingan" },
];

// Obuna manbasi filtri uchun variantlar
export const subscriptionSourceOptions = [
  { value: "all", label: "Barchasi" },
  { value: "purchase", label: "Sotib olgan" },
  { value: "admin_grant", label: "Admin bergan" },
];

export const statusLabels = {
  active: "Faol",
  expired: "Tugagan",
  revoked: "Bekor qilingan",
};

export const statusColors = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-500",
  revoked: "bg-red-100 text-red-700",
};

export const sourceLabels = {
  purchase: "Sotib olgan",
  admin_grant: "Admin bergan",
};

// Yangi rang qo'shishda default qiymat
export const DEFAULT_NEW_COLOR = {
  key: "",
  label: "",
  hex: "#3b82f6",
  isActive: true,
};
