// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { myAttendanceAPI } from "../api/myAttendance.api";

/**
 * ⚠️ ILDIZ KALIT `attendance` DAN ALOHIDA (`myAttendance`).
 *
 * Boshqa xodimning davomatini belgilash `attendanceKeys.all` ni eskirtiradi;
 * agar o'z davomatim ham shu ildizda tursa, kassir birovni belgilaganda
 * mening check-in kartam ham qayta yuklanardi — va aksincha, o'zimni qayd
 * etganda butun ma'muriy bo'lim eskirardi.
 */
export const myAttendanceKeys = createQueryKeys("myAttendance");

/**
 * Kunni yopish tayyorligi — ALOHIDA kalit (`myAttendanceKeys.all` ostida).
 *
 * Mutatsiyalar (ruxsat so'rash / bekor qilish) va `check-out` ning 409
 * javobi aynan shu kalitni yangilaydi, shuning uchun u eksport qilinadi:
 * oynaning ro'yxati server qarori bilan BIR MANBADAN bo'lishi kerak.
 */
export const checkoutReadinessKey = [...myAttendanceKeys.all, "checkout-readiness"];

export const myAttendanceQueries = {
  /** Bugungi yozuvim → `{ checkIn, checkOut, status, ... }` yoki `null`. */
  today: () =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "today"],
      queryFn: () => myAttendanceAPI.getToday().then((r) => r.data.data),
      // Kartada "keldi/ketdi" turadi — boshqa qurilmadan qayd etilgan
      // bo'lsa ham bir daqiqada o'zi yangilanadi.
      refetchInterval: 60_000,
    }),

  /** Bugungi effektiv ish jadvalim → `{ workStartTime, workEndTime, ... }`. */
  schedule: () =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "schedule"],
      queryFn: () => myAttendanceAPI.getMySchedule().then((r) => r.data.data),
    }),

  /**
   * Oylik tarixim → `{ records, summary }`.
   * Oy almashganda eski ma'lumot ekranda qoladi — ‹ › tugmalari bosilganda
   * kalendar "sakramaydi" (`UserAttendancePanel` bilan bir xil xulq).
   */
  month: (month, year) =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "month", month, year],
      queryFn: () => myAttendanceAPI.getMyHistory(month, year).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * "Men ketdim" oynasidagi bugungi ishlar → `{ applies, ready, canCheckOut,
   * closed, grades, tasks, blockers, request }`.
   *
   * ⚠️ `applies: false` — darvoza bu xodimga tegishli emas (o'qituvchi roli
   * yo'q yoki sozlama o'chirilgan): oyna oddiy tasdiqqa aylanadi.
   *
   * Baho boshqa panelda qo'yiladi, rahbar qarori boshqa odamdan keladi —
   * shuning uchun har ochilganda qayta so'raladi, so'rov javob kutayotganda
   * esa tez-tez (oyna ochiq turganda ruxsat o'zi ko'rinsin).
   */
  checkoutReadiness: () =>
    queryOptions({
      queryKey: checkoutReadinessKey,
      queryFn: () =>
        myAttendanceAPI.getCheckoutReadiness().then((r) => r.data.data),
      refetchOnMount: "always",
      refetchInterval: (query) =>
        query.state.data?.request?.status === "pending" ? 15_000 : 60_000,
    }),

  /** Mening uzrli so'rovlarim → massiv. */
  excuses: (params) =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "excuses", params],
      queryFn: () => myAttendanceAPI.getMyExcuses(params).then((r) => r.data.data),
    }),

  /** O'z rolimga tegishli kelmaslik sabablari → massiv. */
  absenceReasons: () =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "absence-reasons"],
      queryFn: () => myAttendanceAPI.getAbsenceReasons().then((r) => r.data.data),
    }),
};
