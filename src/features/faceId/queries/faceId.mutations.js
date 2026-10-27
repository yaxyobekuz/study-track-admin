// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import {
  kiosksAPI,
  faceProfilesAPI,
  faceSettingsAPI,
} from "../api/faceId.api";

// Keys
import { faceIdKeys } from "./faceId.queries";

/**
 * FACE ID — yozish amallari.
 *
 * ⚠️ INVALIDATSIYA KENG (`faceIdKeys.all`) va bu ataylab. Bo'limdagi
 * deyarli har bir yozuv bir nechta ekranga ta'sir qiladi: bitta kadr
 * qo'shish profil ro'yxatini ham, manzaradagi qamrovni ham, sozlamadagi
 * galereya versiyasini ham o'zgartiradi. Nuqtali invalidatsiya qilinsa,
 * xodim yangi kadrni saqlab, ro'yxatda eski sonni ko'rib turardi va
 * "saqlanmadi" deb o'ylab qaytadan olardi (`devices.mutations.js`
 * bilan bir xil qaror).
 */
const useFaceIdMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: faceIdKeys.all }),
  });
};

/* ─────────────────────── KIOSKLAR ─────────────────────── */

/**
 * Yangi kiosk.
 *
 * ⚠️ Javobda BIRIKTIRISH KODI keladi va u ekranda ko'rsatiladi —
 * keshga yozilmaydi: kod bir martalik va 30 daqiqa yashaydi.
 */
export const useCreateKiosk = () =>
  useFaceIdMutation((data) => kiosksAPI.create(data).then((r) => r.data.data));

export const useUpdateKiosk = () =>
  useFaceIdMutation(({ id, data }) => kiosksAPI.update(id, data).then((r) => r.data.data));

export const useUpdateKioskPin = () =>
  useFaceIdMutation(({ id, setupPin }) =>
    kiosksAPI.updatePin(id, { setupPin }).then((r) => r.data.data),
  );

/** Yangi kod — eski token TIRIK qoladi (service izohiga qarang). */
export const useIssuePairingCode = () =>
  useFaceIdMutation((id) => kiosksAPI.issueCode(id).then((r) => r.data.data));

export const useCancelPairingCode = () =>
  useFaceIdMutation((id) => kiosksAPI.cancelCode(id).then((r) => r.data.data));

/**
 * TOKENNI BEKOR QILISH — o'g'irlangan yoki chiqarib qo'yilgan kompyuter.
 * ⚠️ Qurilma darhol uziladi va qayta biriktirish kerak bo'ladi.
 */
export const useRevokeKiosk = () =>
  useFaceIdMutation(({ id, reason }) => kiosksAPI.revoke(id, { reason }).then((r) => r.data.data));

export const useSuspendKiosk = () =>
  useFaceIdMutation(({ id, reason }) => kiosksAPI.suspend(id, { reason }).then((r) => r.data.data));

export const useResumeKiosk = () =>
  useFaceIdMutation((id) => kiosksAPI.resume(id).then((r) => r.data.data));

export const useDeleteKiosk = () =>
  useFaceIdMutation((id) => kiosksAPI.remove(id).then((r) => r.data));

/* ─────────────────────── YUZ NAMUNALARI ─────────────────────── */

/**
 * YUZ NAMUNASINI SAQLASH.
 *
 * ⚠️ XATO JAVOBI MA'NOLI: server dublikatni 409 bilan rad etadi va
 * `details.name` da kimga o'xshaganini aytadi. Chaqiruvchi shu matnni
 * ko'rsatishi kerak — "saqlanmadi" deb o'tib ketilsa, xodim qaytadan
 * urinib yurardi va sabab hech qachon ko'rinmasdi.
 */
export const useAddFaceSample = () =>
  useFaceIdMutation(({ userId, data }) =>
    faceProfilesAPI.addSample(userId, data).then((r) => r.data.data),
  );

export const useRemoveFaceSample = () =>
  useFaceIdMutation((id) => faceProfilesAPI.removeSample(id).then((r) => r.data.data));

export const useRemoveFaceProfile = () =>
  useFaceIdMutation((userId) => faceProfilesAPI.removeProfile(userId).then((r) => r.data.data));

/** Vaqtincha o'chirish — namunalar QOLADI, taqqoslashga kirmaydi. */
export const useSetFaceProfileActive = () =>
  useFaceIdMutation(({ userId, isActive, note }) =>
    faceProfilesAPI.setActive(userId, { isActive, note }).then((r) => r.data.data),
  );

/* ─────────────────────── SOZLAMA ─────────────────────── */

/**
 * ⚠️ Javobda `warnings` keladi (tiriklik o'chirilgan, oflayn o'chirilgan
 * va h.k.) va ularni KO'RSATISH SHART: server saqlaydi, lekin xavf
 * haqida ogohlantiradi. Jim o'tib ketilsa, tiriklik tekshiruvi
 * o'chirilgani hech kimga ma'lum bo'lmasdi.
 */
export const useUpdateFaceSettings = () =>
  useFaceIdMutation((data) => faceSettingsAPI.update(data).then((r) => r.data));

/** ⚠️ MIGRATSIYA — `confirm: true` bilan chaqiriladi. */
export const useSwitchFaceModel = () =>
  useFaceIdMutation((data) => faceSettingsAPI.switchModel(data).then((r) => r.data.data));
