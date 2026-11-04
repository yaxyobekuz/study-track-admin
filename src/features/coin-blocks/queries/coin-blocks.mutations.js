// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { coinBlocksAPI } from "../api/coin-blocks.api";
import { coinBlocksKeys } from "./coin-blocks.queries";

// Cheklov o'quvchining tanga oqimini to'xtatadi va o'quvchi PROFILIDA ham
// ko'rinadi (`user.coinBlock`) — shuning uchun ro'yxat ham, kartochka ham
// eskiradi: `usersKeys.all` ikkalasini qamraydi.
import { usersKeys } from "@/features/users/queries/users.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: coinBlocksKeys.all });
    queryClient.invalidateQueries({ queryKey: usersKeys.all });
  };
};

/** BIR NECHTA o'quvchini bir amalda cheklash. */
export const useBlockCoins = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => coinBlocksAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** Cheklovni olib tashlash (sabab majburiy). */
export const useUnblockCoins = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => coinBlocksAPI.unblock(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
