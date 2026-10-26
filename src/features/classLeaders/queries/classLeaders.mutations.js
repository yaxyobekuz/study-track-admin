// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { classLeadersAPI } from "../api/classLeaders.api";
import { classLeadersKeys } from "./classLeaders.queries";

/**
 * ⚠️ OYLIK KESHI BU YERDA BEKOR QILINMAYDI (tyutor mutatsiyalaridan farqi):
 * sinf rahbarligi uchun pul hisoblanmaydi, ya'ni vedomost, oylik registri va
 * moliya dashboardi o'zgarmaydi. Keraksiz bekor qilish butun moliya bo'limini
 * bekordan-bekor qayta yuklardi.
 */
const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: classLeadersKeys.all });
};

export const useAssignClassLeader = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => classLeadersAPI.assign(data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useUpdateClassLeader = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) =>
      classLeadersAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useRemoveClassLeader = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => classLeadersAPI.remove(id).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
