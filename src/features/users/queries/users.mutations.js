// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { usersAPI } from "../api/users.api";

// Keys
import { usersKeys } from "./users.queries";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

export const useRestoreUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersAPI.restore(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }) =>
      usersAPI.resetPassword(id, { newPassword }).then((r) => r.data),
  });
};
