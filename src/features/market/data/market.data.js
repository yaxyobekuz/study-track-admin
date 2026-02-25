export const marketOrderStatusOptions = [
  { label: "Barchasi", value: "all" },
  { label: "Kutilmoqda", value: "pending" },
  { label: "Tasdiqlangan", value: "approved" },
  { label: "Rad etilgan", value: "rejected" },
  { label: "Bekor qilingan", value: "cancelled" },
];

export const marketOrderStatusLabels = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
  cancelled: "Bekor qilingan",
};

export const marketOrderStatusClasses = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export const marketOrderUpdateStatusOptions = [
  { label: "Tasdiqlash", value: "approved" },
  { label: "Rad etish", value: "rejected" },
];
