// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import {
  kiosksAPI,
  faceProfilesAPI,
  faceEventsAPI,
  faceSettingsAPI,
} from "../api/faceId.api";

export const faceIdKeys = createQueryKeys("faceId");

const kiosksKey = [...faceIdKeys.all, "kiosks"];
const peopleKey = [...faceIdKeys.all, "people"];
const profileKey = [...faceIdKeys.all, "profile"];
const eventsKey = [...faceIdKeys.all, "events"];
const overviewKey = [...faceIdKeys.all, "overview"];
const settingsKey = [...faceIdKeys.all, "settings"];

export const faceIdQueries = {
  /**
   * Kiosklar ro'yxati — SAHIFALANGAN.
   *
   * ⚠️ `r.data` (butun javob), `r.data.data` EMAS: filtr va qidiruv
   * server tomonda ishlaydi, shuning uchun `pagination` ham kerak.
   *
   * ⚠️ `refetchInterval` — qurilma holati JONLI ma'lumot. "Aloqa yo'q"
   * bayrog'i `lastSeenAt` dan hisoblanadi va sahifa qayta so'ramasa,
   * admin ekranda "ishlayapti" ko'rib turgan kiosk aslida o'chgan
   * bo'lishi mumkin edi.
   */
  kiosks: (params) =>
    queryOptions({
      queryKey: [...kiosksKey, params],
      queryFn: () => kiosksAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      refetchInterval: 60_000,
    }),

  kiosk: (id) =>
    queryOptions({
      queryKey: [...kiosksKey, "detail", id],
      queryFn: () => kiosksAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /** Odamlar — ro'yxatga olingan va olinmaganlar birga (sahifalangan). */
  people: (params) =>
    queryOptions({
      queryKey: [...peopleKey, params],
      queryFn: () => faceProfilesAPI.getPeople(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Bitta odamning profili — namunalari bilan.
   *
   * ⚠️ `staleTime: 0`: ro'yxatga olish oynasida har kadrdan keyin
   * ro'yxat o'zgaradi (va eng eskisi o'chadi). Eskirgan nusxa
   * ko'rsatilsa, xodim "kadr saqlanmadi" deb o'ylab qaytadan olardi.
   */
  profile: (userId) =>
    queryOptions({
      queryKey: [...profileKey, userId],
      queryFn: () => faceProfilesAPI.getProfile(userId).then((r) => r.data.data),
      enabled: Boolean(userId),
      staleTime: 0,
    }),

  /** Urinishlar jurnali — sahifalangan. */
  events: (params) =>
    queryOptions({
      queryKey: [...eventsKey, params],
      queryFn: () => faceEventsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Manzara — qamrov, bugungi yig'indi va qurilmalar.
   *
   * ⚠️ Kiosklar ro'yxati bilan BIR SO'ROVDA keladi: "nechta odam
   * ro'yxatda" va "qurilmalar ishlayaptimi" bitta ekranda turadi va
   * ularni ikki so'rovga bo'lish kartalarning navbatma-navbat
   * sakrashiga olib kelardi.
   */
  overview: (params) =>
    queryOptions({
      queryKey: [...overviewKey, params],
      queryFn: () => faceEventsAPI.getOverview(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
      refetchInterval: 60_000,
    }),

  /**
   * Sozlama + CHEGARALAR + qamrov.
   *
   * ⚠️ `ranges` javobdan olinadi va frontendda takrorlanmaydi: panel
   * slayderlarining chegarasi va serverning tekshiruvi BIR MANBADAN
   * bo'lishi kerak, aks holda panel ruxsat bergan qiymat serverda
   * rad etilardi.
   */
  settings: () =>
    queryOptions({
      queryKey: settingsKey,
      queryFn: () => faceSettingsAPI.get().then((r) => r.data.data),
    }),
};
