// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { branchTransfersAPI } from "../api/branchTransfers.api";

// Turi → ko'rib chiqish / tasdiqlash yo'llari
const ENDPOINTS = {
  student: { preview: "previewStudents", execute: "transferStudents" },
  staff: { preview: "previewStaff", execute: "transferStaff" },
  class: { preview: "previewClasses", execute: "transferClasses" },
};

/**
 * Ko'rib chiqish — hech narsa yozmaydi, shuning uchun hech narsani bekor
 * qilmaydi. Mutatsiya (so'rov emas): har bosishda YANGI reja kerak, kesh emas.
 */
export const usePreviewTransfer = () =>
  useMutation({
    mutationFn: ({ kind, payload }) =>
      branchTransfersAPI[ENDPOINTS[kind].preview](payload).then((r) => r.data.data),
  });

/**
 * Tasdiqlash. Ko'chirish odamni, uning sinfini, moliyasini va oylik egasini
 * o'zgartiradi — keshning deyarli hammasi eskiradi, shuning uchun auth'dan
 * tashqari hammasi bekor qilinadi (`invalidateArchiveAffected` naqshi).
 */
export const useExecuteTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, payload }) =>
      branchTransfersAPI[ENDPOINTS[kind].execute](payload).then((r) => r.data.data),
    onSettled: () =>
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "auth" }),
  });
};
