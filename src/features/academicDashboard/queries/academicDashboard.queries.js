// TanStack Query
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { academicDashboardAPI } from "../api/academicDashboard.api";

export const academicKeys = createQueryKeys("academic-dashboard");

/**
 * Dashboard raqamlari sekin o'zgaradi (oy kesimidagi yig'ma), shuning uchun
 * `staleTime` uzun: rahbar oylar orasida u yoqdan-bu yoqqa o'tganda har
 * safar og'ir yig'ma so'rovni qayta yuborishning ma'nosi yo'q.
 */
const STALE = 5 * 60 * 1000;

export const academicQueries = {
  overview: (params) =>
    queryOptions({
      queryKey: [...academicKeys.all, "overview", params],
      queryFn: () => academicDashboardAPI.getOverview(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  targets: (params) =>
    queryOptions({
      queryKey: [...academicKeys.all, "targets", params],
      queryFn: () => academicDashboardAPI.getTargets(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  achievements: (params) =>
    queryOptions({
      queryKey: [...academicKeys.all, "achievements", params],
      queryFn: () => academicDashboardAPI.getAchievements(params).then((r) => r.data),
      staleTime: STALE,
    }),

  achievementOptions: () =>
    queryOptions({
      queryKey: [...academicKeys.all, "achievement-options"],
      queryFn: () => academicDashboardAPI.getAchievementOptions().then((r) => r.data.data),
      // Toifalar katalogi — kodda yozilgan ro'yxat, o'zgarmaydi
      staleTime: Infinity,
    }),

  clubs: (params) =>
    queryOptions({
      queryKey: [...academicKeys.all, "clubs", params],
      queryFn: () => academicDashboardAPI.getClubs(params).then((r) => r.data),
      staleTime: STALE,
    }),

  club: (id) =>
    queryOptions({
      queryKey: [...academicKeys.all, "club", id],
      queryFn: () => academicDashboardAPI.getClub(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: STALE,
    }),
};

/**
 * ⚠️ HAR BIR MUTATSIYA BUTUN FEATURE'NI INVALIDATSIYA QILADI.
 *
 * Yutuq qo'shilishi bilan u KPI kartasida ham, "Olimpiada" blokida ham,
 * so'nggi yutuqlar ro'yxatida ham o'zgaradi; to'garakka a'zo qo'shilishi
 * esa qamrov foizini ham siljitadi. Faqat bitta ro'yxatni yangilab
 * qolganini eskirgan holda qoldirish bir ekranda ikki xil raqam
 * ko'rsatardi.
 */
const useAcademicMutation = (mutationFn) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
};

export const useSaveTargets = () =>
  useAcademicMutation((data) => academicDashboardAPI.saveTargets(data).then((r) => r.data.data));

export const useCreateAchievement = () =>
  useAcademicMutation((data) =>
    academicDashboardAPI.createAchievement(data).then((r) => r.data.data),
  );

export const useUpdateAchievement = () =>
  useAcademicMutation((data) =>
    academicDashboardAPI.updateAchievement(data).then((r) => r.data.data),
  );

export const useDeleteAchievement = () =>
  useAcademicMutation((id) => academicDashboardAPI.deleteAchievement(id).then((r) => r.data.data));

export const useCreateClub = () =>
  useAcademicMutation((data) => academicDashboardAPI.createClub(data).then((r) => r.data.data));

export const useUpdateClub = () =>
  useAcademicMutation((data) => academicDashboardAPI.updateClub(data).then((r) => r.data.data));

export const useDeleteClub = () =>
  useAcademicMutation((id) => academicDashboardAPI.deleteClub(id).then((r) => r.data.data));

export const useAddClubMembers = () =>
  useAcademicMutation((data) =>
    academicDashboardAPI.addClubMembers(data).then((r) => r.data.data),
  );

export const useCloseClubMember = () =>
  useAcademicMutation((data) =>
    academicDashboardAPI.closeClubMember(data).then((r) => r.data.data),
  );

export const useRemoveClubMember = () =>
  useAcademicMutation((data) =>
    academicDashboardAPI.removeClubMember(data).then((r) => r.data.data),
  );
