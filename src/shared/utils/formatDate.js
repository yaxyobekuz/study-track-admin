/**
 * @deprecated Bu fayl faqat eski importlar uchun qoldirilgan.
 *
 * Ilgari bu yerda `date.utils.js` dagidan MUSTAQIL ikkinchi formatlovchi
 * turardi va uning oy nomlari boshqacha edi ("sentyabr"/"oktyabr", u yerda
 * esa "sentabr"/"oktabr") — shu sababli bitta ekranda ikki xil sana
 * ko'rinardi. Endi ikkalasi ham bitta funksiyaga ishora qiladi.
 *
 * Yangi kodda to'g'ridan-to'g'ri `@/shared/utils/date.utils` dan
 * `formatDateUz` ni import qiling.
 */
export { formatDateUz, formatDateUz as formatUzDate } from "./date.utils";
