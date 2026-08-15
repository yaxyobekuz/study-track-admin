// "Kirim" (income) bo'limining qayta ishlatiladigan statik ma'lumotlari.
// Sahifa/komponent ichida hardcode qilinmaydi.
//
// Kirim = qabul qilingan to'lovlar (kassa). Manba backend'da alohida "income"
// jadvali emas — mavjud invoice/payment ma'lumotidan yig'iladi.

/** So'nggi kirimlar (kassa registri) jadvali sarlavhalari. */
export const RECENT_INCOME_COLUMNS = ["O'quvchi", "Summa", "Usul", "Sana"];

/** To'lov usuli qiymatini yorliqqa o'giradi (registr jadvalida). */
export const PAYMENT_METHOD_LABELS = {
  cash: "Naqd",
  card: "Plastik",
  transfer: "O'tkazma",
  other: "Boshqa",
};

/** Kirim trendi grafigida ko'rsatiladigan oylar soni. */
export const TREND_MONTHS_BACK = 6;
