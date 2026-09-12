// TanStack Query
import { queryOptions, keepPreviousData, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { scheduleSyncAPI } from "../api/scheduleSync.api";

const baseKeys = createQueryKeys("schedule-sync");

/**
 * Kalitlar. Hammasi `all` ostida — qo'llash / almashtirishdan keyin butun
 * bo'lim bitta `all` bilan yangilanadi.
 */
export const scheduleSyncKeys = {
  ...baseKeys,
  mode: () => [...baseKeys.all, "mode"],
  status: () => [...baseKeys.all, "status"],
  revisions: (params) =>
    params
      ? [...baseKeys.all, "revisions", params]
      : [...baseKeys.all, "revisions"],
  revision: (id) =>
    id ? [...baseKeys.all, "revision", id] : [...baseKeys.all, "revision"],
  mappings: () => [...baseKeys.all, "mappings"],
  snapshots: (params) =>
    params
      ? [...baseKeys.all, "snapshots", params]
      : [...baseKeys.all, "snapshots"],
  snapshot: (id) =>
    id ? [...baseKeys.all, "snapshot", id] : [...baseKeys.all, "snapshot"],
};

// Holat va ko'rinishlar tez eskiradi (sheet'ni boshqa odam ham tekshiradi),
// lekin har tab almashganda og'ir farqni qayta hisoblatish shart emas.
const VIEW_STALE_TIME = 30 * 1000;

export const scheduleSyncQueries = {
  /**
   * Jadval manbai → `{ mode }`.
   *
   * ⚠️ `staleTime: 0` + oynaga qaytganda qayta o'qish: manbani boshqa odam
   * almashtirishi mumkin va tahrir sahifasi buni darhol bilishi kerak.
   */
  mode: () =>
    queryOptions({
      queryKey: scheduleSyncKeys.mode(),
      queryFn: () => scheduleSyncAPI.getMode().then((r) => r.data.data),
      staleTime: 0,
      refetchOnWindowFocus: true,
    }),

  /** Bo'lim holati → `Status`. */
  status: () =>
    queryOptions({
      queryKey: scheduleSyncKeys.status(),
      queryFn: () => scheduleSyncAPI.getStatus().then((r) => r.data.data),
      staleTime: VIEW_STALE_TIME,
    }),

  /** O'qilgan holatlar tarixi → `{ data, pagination }`. */
  revisions: (params) =>
    queryOptions({
      queryKey: scheduleSyncKeys.revisions(params),
      queryFn: () => scheduleSyncAPI.getRevisions(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta o'qilgan holatning ko'rinishi → `Review`. */
  revision: (id) =>
    queryOptions({
      queryKey: scheduleSyncKeys.revision(id),
      queryFn: () => scheduleSyncAPI.getRevision(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: VIEW_STALE_TIME,
    }),

  /** `{ items, options: { classes, subjects, teachers } }` */
  mappings: () =>
    queryOptions({
      queryKey: scheduleSyncKeys.mappings(),
      queryFn: () => scheduleSyncAPI.getMappings().then((r) => r.data.data),
      staleTime: VIEW_STALE_TIME,
    }),

  /** Versiyalar ro'yxati → `{ data, pagination }`. */
  snapshots: (params) =>
    queryOptions({
      queryKey: scheduleSyncKeys.snapshots(params),
      queryFn: () => scheduleSyncAPI.getSnapshots(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta versiya va uni tiklash ko'rinishi → `SnapshotReview`. */
  snapshot: (id) =>
    queryOptions({
      queryKey: scheduleSyncKeys.snapshot(id),
      queryFn: () => scheduleSyncAPI.getSnapshot(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: VIEW_STALE_TIME,
    }),
};

/**
 * Jadval manbai (platforma yoki Google Sheets).
 *
 * @param {object} [options] - qo'shimcha `useQuery` sozlamalari
 * @example
 * const { data } = useScheduleSourceMode();
 * const isSheetMode = data?.mode === "sheet";
 */
export const useScheduleSourceMode = (options = {}) =>
  useQuery({ ...scheduleSyncQueries.mode(), ...options });
