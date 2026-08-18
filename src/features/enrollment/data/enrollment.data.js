// O'qish davrlari bo'limining statik ma'lumotlari.
//
// Davr — o'quvchining maktabda bo'lgan vaqti, KUN aniqligida. U ikki narsani
// hal qiladi: shu oyga hisob-faktura yoziladimi va oyning qaysi ulushi
// to'lanadi.

/** Davr yopilganda tanlanadigan sabab toifasi (server enumiga mos). */
export const END_REASON_OPTIONS = [
  { label: "O'z ixtiyori bilan ketdi", value: "left" },
  { label: "Chetlatildi", value: "expelled" },
  { label: "Bitirdi", value: "graduated" },
  { label: "Boshqa filialga o'tdi", value: "transferred" },
];

export const END_REASON_LABELS = Object.fromEntries(
  END_REASON_OPTIONS.map((option) => [option.value, option.label]),
);

export const ENROLLMENT_TABLE_COLUMNS = [
  "Boshlanish",
  "Tugash",
  "Sabab",
  "Holat",
  "",
];

/**
 * Davrning hozirgi holati.
 * `getPeriodStatus` (moliya) bilan bir xil g'oya, lekin sana bo'yicha.
 */
export const getEnrollmentStatus = (period, todayIso) => {
  if (period.startDate > todayIso) {
    return { label: "Kelajakda", className: "bg-blue-100 text-blue-700" };
  }
  if (period.endDate != null && period.endDate < todayIso) {
    return { label: "Tugagan", className: "bg-gray-100 text-gray-600" };
  }
  return { label: "Amalda", className: "bg-green-100 text-green-700" };
};

/**
 * Kirish proratsiyasi sababi → foydalanuvchi tilidagi izoh.
 * Server `resolveEnrollmentForMonth().reason` da qaytaradi.
 */
export const ENROLLMENT_REASON_LABELS = {
  no_periods: "Davr kiritilmagan — to'liq oy hisoblanadi",
  covers_month_start: "Oy boshidan o'qiyapti — to'liq oy",
  entered_mid_month: "Oy o'rtasida kelgan — ulush hisoblanadi",
  not_enrolled: "Bu oyda o'qimaydi — hisob-faktura yozilmaydi",
};

/** O'quvchi qancha vaqt o'qiganini "2 yil 4 oy" ko'rinishida beradi. */
export const formatDuration = (fromIso, toIso) => {
  if (!fromIso) return "";

  const from = new Date(`${fromIso}T00:00:00Z`);
  const to = toIso ? new Date(`${toIso}T00:00:00Z`) : new Date();

  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months -= 1;
  if (months < 0) return "";

  const years = Math.floor(months / 12);
  const rest = months % 12;

  if (years === 0 && rest === 0) return "1 oydan kam";
  return [years > 0 ? `${years} yil` : "", rest > 0 ? `${rest} oy` : ""]
    .filter(Boolean)
    .join(" ");
};
