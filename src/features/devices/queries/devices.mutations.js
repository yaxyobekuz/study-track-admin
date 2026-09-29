// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import {
  devicesAPI,
  devicePoliciesAPI,
  deviceAppsAPI,
  deviceUnlocksAPI,
} from "../api/devices.api";

// Keys
import { devicesKeys } from "./devices.queries";

/**
 * QURILMA NAZORATI — yozish amallari.
 *
 * ⚠️ INVALIDATSIYA KENG (`devicesKeys.all`) va bu ataylab. Bo'limdagi
 * deyarli har bir yozuv bir nechta ekranga ta'sir qiladi: siyosatni
 * tahrirlash qurilmalar ro'yxatidagi "eskirgan" belgisini ham,
 * dashboarddagi qamrovni ham o'zgartiradi. Nuqtali invalidatsiya
 * qilinsa, admin yangi qoidani saqlab, ro'yxatda eskisini ko'rib
 * turardi va "saqlanmadi" deb o'ylardi.
 */
const useDeviceMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: devicesKeys.all }),
  });
};

/* ─────────────────────── QURILMALAR ─────────────────────── */

export const usePauseDevice = () =>
  useDeviceMutation(({ id, reason }) => devicesAPI.pause(id, { reason }).then((r) => r.data));

export const useResumeDevice = () =>
  useDeviceMutation((id) => devicesAPI.resume(id).then((r) => r.data));

export const useRemoveDevice = () =>
  useDeviceMutation(({ id, reason }) => devicesAPI.remove(id, { reason }).then((r) => r.data));

/**
 * Biriktirish kodi.
 *
 * ⚠️ Kod JAVOBDA qaytadi va ekranda ko'rsatiladi — keshga yozilmaydi:
 * u bir martalik va qisqa muddatli (`devicesQueries.studentCode` izohi).
 */
export const useIssueEnrollmentCode = () =>
  useDeviceMutation((studentId) => devicesAPI.issueCode({ studentId }).then((r) => r.data.data));

/* ─────────────────────── SIYOSATLAR ─────────────────────── */

export const useCreatePolicy = () =>
  useDeviceMutation((data) => devicePoliciesAPI.create(data).then((r) => r.data.data));

export const useUpdatePolicy = () =>
  useDeviceMutation(({ id, data }) => devicePoliciesAPI.update(id, data).then((r) => r.data.data));

export const useArchivePolicy = () =>
  useDeviceMutation((id) => devicePoliciesAPI.archive(id).then((r) => r.data));

export const useRestorePolicy = () =>
  useDeviceMutation((id) => devicePoliciesAPI.restore(id).then((r) => r.data));

/* ─────────────────────── BIRIKTIRISH ─────────────────────── */

/**
 * ⚠️ "Butun maktab" uchun `confirmAll: true` MAJBURIY — uni chaqiruvchi
 * yuboradi va server ham alohida tekshiradi. Ikki qavat ataylab: oynadagi
 * belgini chetlab o'tib bo'lmasin.
 */
export const useSetAssignment = () =>
  useDeviceMutation((data) => devicePoliciesAPI.setAssignment(data).then((r) => r.data.data));

export const useClearAssignment = () =>
  useDeviceMutation(({ id, reason }) =>
    devicePoliciesAPI.clearAssignment(id, { reason }).then((r) => r.data),
  );

/* ─────────────────────── ILOVALAR KATALOGI ─────────────────────── */

export const useCreateApp = () =>
  useDeviceMutation((data) => deviceAppsAPI.create(data).then((r) => r.data.data));

export const useUpdateApp = () =>
  useDeviceMutation(({ id, data }) => deviceAppsAPI.update(id, data).then((r) => r.data.data));

export const useArchiveApp = () =>
  useDeviceMutation((id) => deviceAppsAPI.archive(id).then((r) => r.data));

export const useBulkArchiveApps = () =>
  useDeviceMutation((ids) => deviceAppsAPI.bulkArchive(ids).then((r) => r.data));

export const useRestoreApp = () =>
  useDeviceMutation((id) => deviceAppsAPI.restore(id).then((r) => r.data));

/* ─────────────────────── VAQTINCHALIK OCHISH ─────────────────────── */

export const useCreateUnlock = () =>
  useDeviceMutation((data) => deviceUnlocksAPI.create(data).then((r) => r.data));

export const useCancelUnlock = () =>
  useDeviceMutation(({ id, reason }) =>
    deviceUnlocksAPI.cancel(id, { reason }).then((r) => r.data),
  );

/* ─────────────────────── SOZLAMALAR ─────────────────────── */

export const useUpdateDeviceSettings = () =>
  useDeviceMutation((data) => devicesAPI.updateSettings(data).then((r) => r.data.data));
