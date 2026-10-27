/**
 * Dars holati — kechki "baho qo'ymaslik" jarimasi bilan AYNI qoida: jarima
 * faqat bitta ham baho qo'yilmagan darsga yoziladi (server `lesson.ungraded`).
 */
export const LESSON_GRADE_STATE = {
  ungraded: {
    label: "Bitta ham baho yo'q — jarima",
    className: "bg-red-100 text-red-800",
  },
  partial: {
    label: "Qisman baholangan — jarima yo'q",
    className: "bg-amber-100 text-amber-800",
  },
};
