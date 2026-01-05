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
    "dushanba",
    "seshanba",
    "chorshanba",
    "payshanba",
    "juma",
    "shanba",
    "yakshanba",
  ];
  return daysUz[dateObj.getDay()];
};
