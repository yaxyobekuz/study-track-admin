// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { permissionsAPI } from "../api/permissions.api";

// Keys
import { permissionsKeys } from "./permissions.queries";
import { usersKeys } from "@/features/users/queries/users.queries";

/**
 * Foydalanuvchining ruxsatlar to'plamini yangilash (grant/revoke).
 * @example
 * const { mutate } = useUpdateUserPermissions();
 * mutate({ id, permissions: ["grades", "penalties"] });
 */
export const useUpdateUserPermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    // `branchId` ixtiyoriy: berilmasa server joriy filialga yozadi.
    mutationFn: ({ id, permissions, branchId }) =>
      permissionsAPI.updateUser(id, permissions, branchId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionsKeys.all });
      // Xodim kartasidagi "Filiallar" ro'yxati ham ruxsatlarni ko'rsatadi
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};
