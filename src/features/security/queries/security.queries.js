// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { securityAPI } from "../api/security.api";

export const securityKeys = createQueryKeys("security");

/**
 * ⚠️ `staleTime` QISQA (45 soniya). Xavfsizlik ekrani "hozir kim
 * tizimda" degan savolga javob beradi — bu yerda eskirgan raqam
 * shunchaki noqulaylik emas, YOLG'ON: allaqachon tugatilgan seans
 * "ochiq" bo'lib turishi mumkin edi.
 */
const STALE = 45 * 1000;

export const securityQueries = {
  /** Butun manzara. */
  overview: (params) =>
    queryOptions({
      queryKey: [...securityKeys.all, "overview", params],
      queryFn: () => securityAPI.getOverview(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  /** Seanslar ro'yxati — sahifalangan. */
  sessions: (params) =>
    queryOptions({
      queryKey: [...securityKeys.all, "sessions", params],
      queryFn: () => securityAPI.getSessions(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: STALE,
    }),

  /** Ogohlantirishlar ro'yxati. */
  alerts: (params) =>
    queryOptions({
      queryKey: [...securityKeys.all, "alerts", params],
      queryFn: () => securityAPI.getAlerts(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: STALE,
    }),

  /** Kirish urinishlari lentasi. */
  attempts: (params) =>
    queryOptions({
      queryKey: [...securityKeys.all, "attempts", params],
      queryFn: () => securityAPI.getAttempts(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: STALE,
    }),

  /** Bitta foydalanuvchining kartasi — modal ochilganda yuklanadi. */
  user: (userId, params) =>
    queryOptions({
      queryKey: [...securityKeys.detail(userId), params],
      queryFn: () => securityAPI.getUser(userId, params).then((r) => r.data.data),
      enabled: Boolean(userId),
      staleTime: STALE,
    }),
};

export default securityQueries;
