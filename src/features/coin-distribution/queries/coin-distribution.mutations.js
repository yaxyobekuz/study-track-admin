// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { coinDistributionAPI } from "../api/coin-distribution.api";

// Keys
import { usersKeys } from "@/features/users/queries/users.queries";

/**
 * Give or take coins from a set of users (by role/class/gender/individual).
 * Coin balances live on the user records, so refresh the users lists on success.
 */
export const useDistributeCoins = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => coinDistributionAPI.distribute(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
};
