// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { certificatesAPI } from "../api/certificates.api";

// Keys
import { certificatesKeys } from "./certificates.queries";

/**
 * Reja o'zgarganda nimani yangilash kerak.
 *
 * ⚠️ `stats` ham bekor qilinadi: kartalardagi "sertifikat topshirmoqchi
 * o'quvchilar soni" ro'yxat bilan AYNI manbadan chiqadi va bitta reja bekor
 * qilinganda ikki raqam bir-biridan ajralib qolmasligi kerak.
 */
const invalidatePlans = (qc) => {
  qc.invalidateQueries({ queryKey: certificatesKeys.lists() });
  qc.invalidateQueries({ queryKey: [...certificatesKeys.all, "stats"] });
  qc.invalidateQueries({ queryKey: certificatesKeys.details() });
};

export const useCreateCertificatePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      certificatesAPI.createPlan(payload).then((r) => r.data),
    onSuccess: () => invalidatePlans(qc),
  });
};

export const useUpdateCertificatePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      certificatesAPI.updatePlan(id, payload).then((r) => r.data),
    onSuccess: () => invalidatePlans(qc),
  });
};

export const useCancelCertificatePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) =>
      certificatesAPI.cancelPlan(id, { reason }).then((r) => r.data),
    onSuccess: () => invalidatePlans(qc),
  });
};

export const useMarkCertificatePassed = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => certificatesAPI.markPassed(id).then((r) => r.data),
    onSuccess: () => invalidatePlans(qc),
  });
};

/**
 * Yo'nalish katalogi.
 *
 * ⚠️ Rejalar ro'yxati ham bekor qilinadi: yo'nalish nomi qatorlarda
 * ko'rinadi va fanga bog'lanishi PROGRESSni o'zgartiradi.
 */
const invalidateTracks = (qc) => {
  qc.invalidateQueries({ queryKey: [...certificatesKeys.all, "tracks"] });
  invalidatePlans(qc);
};

export const useCreateCertificateTrack = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      certificatesAPI.createTrack(payload).then((r) => r.data),
    onSuccess: () => invalidateTracks(qc),
  });
};

export const useUpdateCertificateTrack = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      certificatesAPI.updateTrack(id, payload).then((r) => r.data),
    onSuccess: () => invalidateTracks(qc),
  });
};

/**
 * KO'RIB CHIQISH — hech narsa yozmaydi, shuning uchun kesh ham
 * TOZALANMAYDI. Mutation sifatida yozilgani — fayl yuklashi uchun
 * (`useQuery` fayl yubora olmaydi va u qayta-qayta so'rov yuborardi).
 */
export const usePreviewCertificateImport = () =>
  useMutation({
    mutationFn: (file) =>
      certificatesAPI.previewImport(file).then((r) => r.data.data),
  });

/** TASDIQLASH — rejalarni yozadi. */
export const useConfirmCertificateImport = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      certificatesAPI.confirmImport(payload).then((r) => r.data),
    onSuccess: () => invalidateTracks(qc),
  });
};
