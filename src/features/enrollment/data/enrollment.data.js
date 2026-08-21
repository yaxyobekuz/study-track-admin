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
  no_periods: "Davr kiritilmagan — hisob-faktura yozilmaydi",
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

/** O'quvchining hozirgi holati — bitta qatorda ko'rsatiladi. */
export const getStudentState = (data) => {
  if (!data?.hasPeriods) {
    return {
      label: "Davr kiritilmagan",
      dotClassName: "bg-amber-500",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (data.isFrozen) {
    return {
      label: "Muzlatilgan",
      dotClassName: "bg-blue-500",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }
  if (data.isStudying) {
    return {
      label: "Hozir o'qiyapti",
      dotClassName: "bg-green-500",
      className: "border-green-200 bg-green-50 text-green-700",
    };
  }
  return {
    label: "O'qimayapti",
    dotClassName: "bg-gray-400",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  };
};

const DAY_MS = 86400000;
const toUtc = (iso) => new Date(`${iso}T00:00:00Z`);

/** Ikki sana orasidagi kunlar — tugash sanasi INKLYUZIV (oxirgi o'qigan kun). */
const daysBetween = (fromIso, toIso) =>
  Math.floor((toUtc(toIso) - toUtc(fromIso)) / DAY_MS) + 1;

/** Kunni "1 yil 4 oy" / "23 kun" ko'rinishida beradi. */
export const formatDayCount = (days) => {
  if (days <= 0) return "—";
  if (days < 31) return `${days} kun`;

  const months = Math.floor(days / 30.44);
  const years = Math.floor(months / 12);
  const rest = months % 12;

  if (years === 0) return `${months} oy`;
  return rest > 0 ? `${years} yil ${rest} oy` : `${years} yil`;
};

/**
 * Davrlar ro'yxatidan kartalar uchun raqamlar.
 *
 * `attendedPercent` — birinchi kelgan kundan HOZIRGACHA (o'qimayotgan bo'lsa
 * oxirgi ketgan kunigacha) bo'lgan vaqtning qanchasi maktabda o'tgani.
 * Ketib qaytib kelgan o'quvchida tanaffus shu yerda ko'rinadi; uzluksiz
 * o'qiyotgan o'quvchida esa 100% bo'ladi.
 *
 * Kelajakdagi davr hali boshlanmagani uchun hisobga olinmaydi.
 *
 * @param {Array<{startDate: string, endDate: string|null}>} items
 * @param {string} todayIso
 */
export const buildEnrollmentStats = (items = [], todayIso) => {
  const started = items.filter((item) => item.startDate <= todayIso);

  if (started.length === 0) {
    return {
      hasData: false,
      attendedDays: 0,
      spanDays: 0,
      gapDays: 0,
      attendedPercent: 0,
      periodCount: items.length,
      openCount: items.filter((item) => item.endDate == null).length,
      firstStart: items[0]?.startDate ?? null,
      lastEnd: null,
    };
  }

  const sorted = [...started].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const firstStart = sorted[0].startDate;

  // Kesishgan davrlar ikki marta sanalmasligi uchun oraliqlar birlashtiriladi
  const merged = [];
  for (const item of sorted) {
    const end = item.endDate && item.endDate < todayIso ? item.endDate : todayIso;
    const last = merged[merged.length - 1];

    if (last && item.startDate <= last.end) {
      if (end > last.end) last.end = end;
    } else {
      merged.push({ start: item.startDate, end });
    }
  }

  const attendedDays = merged.reduce(
    (sum, range) => sum + daysBetween(range.start, range.end),
    0,
  );

  const lastEnd = merged[merged.length - 1].end;
  const spanDays = daysBetween(firstStart, lastEnd);
  const gapDays = Math.max(0, spanDays - attendedDays);

  return {
    hasData: true,
    attendedDays,
    spanDays,
    gapDays,
    attendedPercent: spanDays > 0 ? Math.round((attendedDays / spanDays) * 100) : 0,
    periodCount: items.length,
    openCount: items.filter((item) => item.endDate == null).length,
    firstStart,
    lastEnd,
  };
};
