export const marketOrderStatusOptions = [
  { label: "Barcha holatlar", value: "all" },
  { label: "Kutilmoqda", value: "pending" },
  { label: "Yetkazilmoqda", value: "delivering" },
  { label: "Yetkazib berildi", value: "approved" },
  { label: "Rad etilgan", value: "rejected" },
  { label: "Bekor qilingan", value: "cancelled" },
];

export const marketOrderStatusLabels = {
  pending: "Kutilmoqda",
  delivering: "Yetkazilmoqda",
  approved: "Yetkazib berildi",
  rejected: "Rad etilgan",
  cancelled: "Bekor qilingan",
};

export const marketOrderStatusClasses = {
  pending: "bg-yellow-100 text-yellow-700",
  delivering: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export const marketOrderUpdateStatusOptions = [
  { label: "Yetkazilmoqda", value: "delivering" },
  { label: "Rad etish", value: "rejected" },
];

export const marketOrderDeliverStatusOptions = [
  { label: "Yetkazib berildi", value: "approved" },
];
