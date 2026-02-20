/**
 * Displays the date in "3-yanvar, 2026" format
 * @param {string | Date} date - The date to be formatted
 * @returns {string} Formatted date string
 */
export const formatDateUZ = (date) => {
  const dateObj = new Date(date);

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day}-${month}, ${year}`;
};

/**
 * Displays the date in "3 yanvar, 2026" format (without dot)
 * @param {string | Date} date - The date to be formatted
 * @returns {string} Formatted date string
 */
export const formatDateUZAlt = (date) => {
  const dateObj = new Date(date);

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month}, ${year}`;
};

export const getDayOfWeekUZ = (date) => {
  const dateObj = new Date(date);
  const daysUz = [
    "yakshanba",
    "dushanba",
    "seshanba",
    "chorshanba",
    "payshanba",
    "juma",
    "shanba",
  ];
  return daysUz[dateObj.getDay()];
};

// Oylar
export const months = [
  { label: "Yanvar", value: 0 },
  { label: "Fevral", value: 1 },
  { label: "Mart", value: 2 },
  { label: "Aprel", value: 3 },
  { label: "May", value: 4 },
  { label: "Iyun", value: 5 },
  { label: "Iyul", value: 6 },
  { label: "Avgust", value: 7 },
  { label: "Sentabr", value: 8 },
  { label: "Oktabr", value: 9 },
  { label: "Noyabr", value: 10 },
  { label: "Dekabr", value: 11 },
];

/**
 * Formats holiday date based on holiday type
 * @param {Object} holiday - The holiday object
 * @returns {string} Formatted holiday date string
 */
export const formatHolidayDate = (holiday) => {
  if (holiday.type === "single" && holiday.date) {
    return formatDateUZ(holiday.date);
  }

  if (holiday.type === "range" && holiday.startDate && holiday.endDate) {
    return `${formatDateUZ(holiday.startDate)} - ${formatDateUZ(
      holiday.endDate
    )}`;
  }

  if (holiday.type === "recurring") {
    if (holiday.recurringDate?.month !== undefined) {
      return `Har yili ${holiday.recurringDate.day}-${
        months[holiday.recurringDate.month].label
      }`;
    }

    if (
      holiday.recurringStartDate?.month !== undefined &&
      holiday.recurringEndDate?.month !== undefined
    ) {
      return `Har yili ${holiday.recurringStartDate.day}-${
        months[holiday.recurringStartDate.month].label
      } — ${holiday.recurringEndDate.day}-${
        months[holiday.recurringEndDate.month].label
      }`;
    }
  }
  return "-";
};
