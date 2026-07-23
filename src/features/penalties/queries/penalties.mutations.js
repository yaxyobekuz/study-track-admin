// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "../api/penalties.api";

// Keys
import {
  penaltiesKeys,
  penaltyCategoriesKeys,
  reductionPackagesKeys,
} from "./penalties.queries";

/* ─── Penalties ──────────────────────────────────────────────────── */

export const useCreatePenalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => penaltiesAPI.create(formData).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: penaltiesKeys.lists() }),
  });
};

export const useReviewPenalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      penaltiesAPI.review(id, data).then((r) => r.data),
    // Refresh the list and the reviewed penalty's detail.
    onSuccess: () => qc.invalidateQueries({ queryKey: penaltiesKeys.all }),
  });
};

export const useReducePenalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => penaltiesAPI.reduce(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: penaltiesKeys.lists() }),
  });
};

export const useDeletePenalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => penaltiesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: penaltiesKeys.lists() }),
  });
};

/* ─── Penalty categories ─────────────────────────────────────────── */

export const useCreatePenaltyCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      penaltiesAPI.createPenaltyCategory(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: penaltyCategoriesKeys.lists() }),
  });
};

export const useEditPenaltyCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      penaltiesAPI.updateCategory(id, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: penaltyCategoriesKeys.lists() }),
  });
};

export const useDeletePenaltyCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => penaltiesAPI.deleteCategory(id).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: penaltyCategoriesKeys.lists() }),
  });
};

/* ─── Reduction packages ─────────────────────────────────────────── */

export const useCreateReductionPackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      penaltiesAPI.createReductionPackage(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: reductionPackagesKeys.lists() }),
  });
};

export const useEditReductionPackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      penaltiesAPI.updateReductionPackage(id, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: reductionPackagesKeys.lists() }),
  });
};

export const useDeleteReductionPackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      penaltiesAPI.deleteReductionPackage(id).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: reductionPackagesKeys.lists() }),
  });
};

/* ─── Settings ───────────────────────────────────────────────────── */

export const useUpdatePenaltySettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      penaltiesAPI.updateSettings(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [...penaltiesKeys.all, "settings"] }),
  });
};

export const useUpdateGradePenaltySettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      penaltiesAPI.updateGradePenaltySettings(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...penaltiesKeys.all, "grade-settings"],
      }),
  });
};
