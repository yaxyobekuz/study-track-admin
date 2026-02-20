/**
 * Format a date to Uzbek text like "10-noyabr, 2025".
 *
 * @param {Date|string|number} value - Date instance or parseable input.
 * @returns {string} Formatted date or empty string if invalid.
 */
export const formatUzDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentyabr",
    "oktyabr",
    "noyabr",
    "dekabr",
  ];

  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${monthName}, ${year}`;
};
