// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { issuesAPI } from "../api/issues.api";

// Keys
import { issuesKeys, issueCategoriesKeys } from "./issues.queries";

/**
 * KO'RIB CHIQISH — holat va javob.
 *
 * ⚠️ RO'YXAT HAM, SANOQLAR HAM YANGILANADI (`issuesKeys.all` butun
 * feature'ni qamraydi): holat o'zgarishi bilan muammo boshqa tabga
 * o'tadi va tablardagi raqamlar ham siljiydi.
 */
export const useReviewIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      issuesAPI.review(id, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: issuesKeys.all }),
  });
};

/**
 * TOPSHIRIQ BIRIKTIRISH.
 *
 * ⚠️ TOPSHIRIQLAR KESHINI HAM YANGILAYDI: yangi topshiriqlar
 * topshiriqlar bo'limida ham paydo bo'ladi va u yerdagi ro'yxat eski
 * holicha qolib ketardi. Kalit qo'lda yoziladi (`["tasks"]`) — boshqa
 * feature'ning kalit fabrikasini import qilish ikki modulni bir-biriga
 * bog'lab qo'yardi.
 */
export const useAssignIssueTasks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) =>
      issuesAPI.assignTasks(id, formData).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: issuesKeys.all });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => issuesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: issuesKeys.all }),
  });
};

/**
 * ⚠️ KATEGORIYA MUTATSIYALARI MUAMMOLAR RO'YXATINI HAM YANGILAYDI:
 * ro'yxatdagi kategoriya nomi va filtr ro'yxati shu ma'lumotdan chiziladi,
 * nomini tahrirlagandan keyin esa eski nom ekranda qolib ketardi.
 */
const invalidateCategories = (qc) => {
  qc.invalidateQueries({ queryKey: issueCategoriesKeys.all });
  qc.invalidateQueries({ queryKey: issuesKeys.all });
};

export const useCreateIssueCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => issuesAPI.createCategory(data).then((r) => r.data),
    onSuccess: () => invalidateCategories(qc),
  });
};

export const useEditIssueCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      issuesAPI.updateCategory(id, data).then((r) => r.data),
    onSuccess: () => invalidateCategories(qc),
  });
};

export const useDeleteIssueCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => issuesAPI.deleteCategory(id).then((r) => r.data),
    onSuccess: () => invalidateCategories(qc),
  });
};
