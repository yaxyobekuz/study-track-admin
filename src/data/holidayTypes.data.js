export const holidayTypes = [
  { label: "Bir kunlik", value: "single" },
  { label: "Vaqt oralig'i", value: "range" },
  { label: "Har yili takrorlanuvchi", value: "recurring" },
];

export const getHolidayTypeLabel = (type) => {
  return holidayTypes.find((t) => t.value === type)?.label || type;
};
