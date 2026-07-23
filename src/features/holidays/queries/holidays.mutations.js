// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { holidaysAPI } from "../api/holidays.api";

// Keys
import { holidaysKeys } from "./holidays.queries";

export const useCreateHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => holidaysAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: holidaysKeys.all }),
  });
};

export const useEditHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => holidaysAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: holidaysKeys.all }),
  });
};

export const useDeleteHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => holidaysAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: holidaysKeys.all }),
  });
};
