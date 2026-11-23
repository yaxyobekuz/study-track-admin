/**
 * XODIM O'Z OYLIGINI KO'RMAYDI (biznes qarori, 2026-11-23).
 *
 * Xodimning O'ZIGA ko'rsatiladigan oylik ekranlari — hisoblangan summa,
 * stavka, ustamalar, ushlab qolish, to'xtatish, kelmagan kun ayirmasi va
 * tyutor guruhining qo'shimcha oyligi — VAQTINCHA yopiq.
 *
 * OCHIQ QOLADI: jarimalar (alohida modul), dars soati fakti (o'tildi /
 * o'tilmadi / qoldi, o'rinbosarlik), davomat, topshiriqlar va toifa
 * zayavkasi — ulardan faqat PUL maydonlari olib tashlangan.
 *
 * ⚠️ ASOSIY DARVOZA SERVERDA (`helpers/selfPayroll.helpers.js`): `/payroll/my*`,
 * `/payroll/salaries/my`, `/payroll/deductions/my`, `/payroll/suspensions/my`
 * 403 qaytaradi, qolgan yo'llardan summa olib tashlanadi. Bu bayroq faqat
 * EKRANNI yopadi — usiz panel bo'sh karta va "yuklab bo'lmadi" ko'rsatardi.
 *
 * ⚠️ QAYTA OCHISH IKKI SATR: shu bayroq `true` va serverdagi
 * `SELF_PAYROLL_VISIBLE = true`. Shuning uchun ekranlar o'chirilmadi,
 * faqat yopildi: qaror "hozircha" deb qabul qilingan.
 */
export const SELF_PAYROLL_VISIBLE = false;
