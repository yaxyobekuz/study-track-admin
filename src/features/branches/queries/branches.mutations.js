// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { branchesAPI } from "../api/branches.api";

// Keys
import { branchesKeys } from "./branches.queries";

export const useCreateBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => branchesAPI.create(data).then((r) => r.data),
    // Ro'yxat darhol yangilanadi va `refetchInterval` "tayyorlanmoqda"
    // holatini o'zi kuzatib boradi (branches.queries.js).
    onSuccess: () => qc.invalidateQueries({ queryKey: branchesKeys.lists() }),
  });
};

export const useUpdateBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => branchesAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchesKeys.all }),
  });
};

export const useArchiveBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      branchesAPI.archive(id, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchesKeys.all }),
  });
};

export const useRestoreBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => branchesAPI.restore(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchesKeys.all }),
  });
};

/** Baza tayyorlanishi xato bilan tugagan filialni qayta urinish. */
export const useRetryBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => branchesAPI.retry(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchesKeys.lists() }),
  });
};
