// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { messagesAPI } from "../api/messages.api";

// Keys
import { messagesKeys } from "./messages.queries";

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => messagesAPI.send(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagesKeys.lists() }),
  });
};

export const useCancelMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => messagesAPI.cancel(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagesKeys.lists() }),
  });
};
