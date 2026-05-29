// Test mavsumi holatlari uchun yorliq, rang va variantlar

export const SEASON_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
};

export const SEASON_STATUS_LABELS = {
  draft: "Tayyorlanmoqda",
  active: "Faol",
  closed: "Yopilgan",
};

export const SEASON_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};

export const SEASON_STATUS_OPTIONS = [
  { label: "Tayyorlanmoqda", value: "draft" },
  { label: "Faol", value: "active" },
  { label: "Yopilgan", value: "closed" },
];

export const SEASON_STATUS_FILTER_OPTIONS = [
  { label: "Hammasi", value: "all" },
  ...SEASON_STATUS_OPTIONS,
];

export const getSeasonStatusLabel = (status) =>
  SEASON_STATUS_LABELS[status] || status;
