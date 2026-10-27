// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { usersAPI } from "../api/users.api";

// Keys
import { usersKeys } from "./users.queries";
import { classesKeys } from "@/features/classes/queries/classes.queries";

/**
 * Arxivlash/qaytarishdan keyin keshni eskirtiradi.
 *
 * ⚠️ Faqat `usersKeys` yetmaydi: arxivlangan o'quvchi sinflardan chiqariladi,
 * o'qish davri yopiladi, qarzi 0 ga tushirilishi mumkin va u davomat
 * hisobotlari, reytinglar, tanga/jarima statistikasi, to'garaklardan ham
 * DARHOL yo'qolishi kerak — aks holda boshqa sahifa keshdagi eski ro'yxatni
 * ko'rsatib turardi. Ro'yxatni qo'lda sanash yangi sahifa qo'shilganda
 * eskirardi, shuning uchun hammasi eskiradi (faol bo'lmaganlari faqat
 * belgilanadi, ochilganda yangilanadi).
 *
 * `auth` tegilmaydi: joriy foydalanuvchi o'zgarmagan, uni qayta so'rash esa
 * `AuthGuard` ning xato holatiga bog'liq xavf tug'dirardi.
 *
 * Natija KUTILMAYDI: sahifada so'rov ko'p bo'lsa, oyna hammasi qayta
 * yuklanguncha "Arxivlash..." bo'lib qotib turardi.
 */
const invalidateArchiveAffected = (qc) =>
  qc.invalidateQueries({ predicate: (query) => query.queryKey[0] !== "auth" });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data).then((r) => r.data),
    // Refresh both the list and the edited user's detail.
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

/**
 * O'quvchi sinflarini almashtirish (`PUT /users/:id` → `classes`).
 *
 * `classes` — to'liq YANGI ro'yxat (bo'sh = barcha sinflardan chiqarish).
 * O'quvchi biror sinfini yo'qotsa `reason` majburiy — server
 * `classChangeReason` siz so'rovni rad etadi va o'zgarishni jurnalga yozadi.
 *
 * `useUpdateUser` dan farqi — sinflar keshi ham eskiradi: sinfdagi
 * o'quvchilar ro'yxati va "Sinf o'zgarishlari" jurnali (`classesKeys.all`).
 */
export const useUpdateStudentClasses = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, classes, reason }) =>
      usersAPI
        .update(id, { classes, ...(reason ? { classChangeReason: reason } : {}) })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
      qc.invalidateQueries({ queryKey: classesKeys.all });
    },
  });
};

/**
 * ASL SINF — o'quvchining maktab darajasi (`PUT /users/:id` → `actualGrade`).
 *
 * Bo'sh yuborilsa belgi olib tashlanadi. Sinf A'ZOLIGIGA TEGMAYDI va sabab
 * talab qilmaydi: bu guruh almashtirish emas, o'quvchi nechanchi sinf
 * o'quvchisi ekanini aytadigan belgi.
 *
 * `classesKeys.all` ham eskiradi — sinf sahifasidagi o'quvchilar ro'yxatida
 * ham shu ustun bor; `usersKeys.all` esa daraja kesimidagi sanoqni ham
 * yangilaydi (u ham `users` kaliti ostida).
 */
export const useUpdateStudentActualGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actualGrade }) =>
      usersAPI
        .update(id, { actualGrade: actualGrade === "" ? null : actualGrade })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
      qc.invalidateQueries({ queryKey: classesKeys.all });
    },
  });
};

/**
 * Telefon raqamlarini yangilash (`users.phone` ruxsati).
 *
 * `usersKeys.all` eskiradi: raqam ro'yxat ustunida ham, detal kartasida ham
 * ko'rinadi — biri yangilanib, ikkinchisi eski qolmasin.
 */
export const useUpdateUserPhone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      usersAPI.updatePhone(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
};

// Arxivlash/qaytarish detal sahifasidan ham chaqiriladi — u yerdagi holat
// badge'i yangilanishi uchun detal so'rovi ham eskiradi.
export const useArchiveUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersAPI.archive(id, data).then((r) => r.data),
    onSuccess: () => {
      invalidateArchiveAffected(qc);
    },
  });
};

export const useRestoreUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersAPI.restore(id).then((r) => r.data),
    onSuccess: () => {
      invalidateArchiveAffected(qc);
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }) =>
      usersAPI.resetPassword(id, { newPassword }).then((r) => r.data),
  });
};

/**
 * Xodimni boshqa filialga biriktirish.
 *
 * Yangi filialda ruxsatlar ROLNING standart to'plamidan boshlanadi —
 * boshqa filialdagi ruxsatlar ko'chirilmaydi.
 */
export const useAttachUserBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, branchId, role }) =>
      usersAPI.attachBranch(id, { branchId, role }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

/**
 * ASOSIY (UY) FILIALNI ALMASHTIRISH — login shu filialga tushadi.
 *
 * `usersKeys.all` yangilanadi: "Asosiy" yorlig'i filiallar kartasida ham,
 * ruxsatlar tabida ham turadi va ikkisi bir xil javobdan chiziladi.
 */
export const useSetUserHomeBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, branchId }) =>
      usersAPI.setHomeBranch(id, branchId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

/**
 * Xodimni filialdan chiqarish — ISTALGAN filialdan.
 *
 * Asosiy filialdan chiqarilganda login boshqa filialga ko'chadi:
 * `nextHomeBranchId` shuni aytadi. Bitta filial qolsa server o'zi tanlaydi,
 * bir nechta bo'lsa 400 qaytaradi (`details.reason = "next_home_required"`)
 * — chaqiruvchi avval so'rab olishi kerak.
 */
export const useDetachUserBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, branchId, nextHomeBranchId }) =>
      usersAPI.detachBranch(id, branchId, nextHomeBranchId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

/**
 * QO'SHIMCHA ROLLARNI ALMASHTIRISH — faqat owner.
 *
 * ⚠️ `usersKeys.all` yangilanadi: rol o'zgarishi ro'yxatdagi yorliqni
 * ham, detal sahifadagi kartani ham, ruxsatlar tabini ham
 * o'zgartiradi (yangi rolning boshlang'ich ruxsatlari QO'SHILADI).
 * Nozik invalidatsiya bu yerda ikkita ekranda ikki xil holat
 * ko'rsatardi.
 */
export const useSetUserRoles = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, extraRoles }) =>
      usersAPI.setRoles(id, extraRoles).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};
