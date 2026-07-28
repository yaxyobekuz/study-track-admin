// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { permissionsAPI } from "../api/permissions.api";

// Keys
import { permissionsKeys } from "./permissions.queries";

/**
 * Foydalanuvchining ruxsatlar to'plamini yangilash (grant/revoke).
 * @example
 * const { mutate } = useUpdateUserPermissions();
 * mutate({ id, permissions: ["grades", "penalties"] });
 */
export const useUpdateUserPermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }) =>
      permissionsAPI.updateUser(id, permissions).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionsKeys.all }),
  });
};
