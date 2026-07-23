// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { socialNetworksAPI } from "../api/social-networks.api";

// Keys
import { socialNetworksKeys } from "./social-networks.queries";

export const useCreateSocialNetwork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => socialNetworksAPI.create(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: socialNetworksKeys.lists() }),
  });
};

export const useUpdateSocialNetwork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      socialNetworksAPI.update(id, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: socialNetworksKeys.all }),
  });
};

export const useDeleteSocialNetwork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => socialNetworksAPI.delete(id).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: socialNetworksKeys.lists() }),
  });
};
