// HTTP
import http from "@/shared/api/http";

/**
 * INVENTAR DASHBOARDI — BITTA o'qish endpointi.
 *
 * ⚠️ Yozadigan amal YO'Q va bo'lmaydi ham: dashboard mavjud
 * jadvallarning kesimi, ma'lumot esa o'z ekranlarida kiritiladi (xatlov,
 * kunlik hisobot, zarar, undiruv). Bu yerga "tez qo'shish" tugmasi
 * qo'yilsa, u ikkinchi kirish nuqtasi bo'lib, tekshiruvlarni chetlab
 * o'tish yo'liga aylanardi.
 */
export const inventoryDashboardAPI = {
  /** Butun manzara. Params: { month, compareMonth, trendMonths } */
  getOverview: (params) => http.get("/inventory/dashboard/overview", { params }),
};

export default inventoryDashboardAPI;
