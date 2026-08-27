// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { scheduleSettingsAPI } from "../api/scheduleSettings.api";

// Queries
import { scheduleSettingsKeys } from "./scheduleSettings.queries";

// Planner ham shu gridga tayanadi
import { plannerKeys } from "@/features/schedule-planner/queries/planner.queries";

/**
 * Dars soatlarini saqlaydi (to'liq almashtirish).
 *
 * Grid o'zgargani uchun rejalashtirish bo'limining hamma ekrani ham
 * yangilanadi: bandlik matritsasining ustunlari va tayyorgarlik tekshiruvi
 * bevosita shu ro'yxatdan chiqadi.
 */
export const useUpdateScheduleSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      scheduleSettingsAPI.updateSettings(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleSettingsKeys.all });
      qc.invalidateQueries({ queryKey: plannerKeys.all });
    },
  });
};
