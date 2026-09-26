// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { gradeAnalysisAPI } from "../api/gradeAnalysis.api";

// Keys
import { gradeAnalysisKeys } from "./gradeAnalysis.queries";

/**
 * ⚠️ HAR BIR MUTATSIYA BUTUN FEATURE'NI INVALIDATSIYA QILADI: tahlil
 * holati bir vaqtda uch joyda turadi (tarix ro'yxati, ochiq tahlil,
 * oynadagi "faol tahlil") — bittasini unutish ekranni yolg'on qoldirardi.
 */
const useFeatureMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gradeAnalysisKeys.all }),
  });
};

export const useCreateGradeAnalysis = () =>
  useFeatureMutation((data) => gradeAnalysisAPI.createRun(data).then((r) => r.data.data));

export const useCancelGradeAnalysis = () =>
  useFeatureMutation((id) => gradeAnalysisAPI.cancelRun(id).then((r) => r.data));

export const usePublishGradeAnalysis = () =>
  useFeatureMutation((id) => gradeAnalysisAPI.publishRun(id).then((r) => r.data));

export const useUnpublishGradeAnalysis = () =>
  useFeatureMutation((id) => gradeAnalysisAPI.unpublishRun(id).then((r) => r.data));

export const useDeleteGradeAnalysis = () =>
  useFeatureMutation((id) => gradeAnalysisAPI.deleteRun(id).then((r) => r.data));

export const useUpdateGradeAnalysisSettings = () =>
  useFeatureMutation((data) => gradeAnalysisAPI.updateSettings(data).then((r) => r.data));
