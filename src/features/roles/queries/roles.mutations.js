// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { rolesAPI } from "../api/roles.api";

// Keys
import { rolesKeys } from "./roles.queries";

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => rolesAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKeys.lists() }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => rolesAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKeys.lists() }),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rolesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKeys.lists() }),
  });
};
