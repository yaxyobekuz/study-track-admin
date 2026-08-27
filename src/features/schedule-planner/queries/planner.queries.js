// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { plannerAPI } from "../api/planner.api";

export const plannerKeys = createQueryKeys("planner");

// Quyi resurslar `all` dan kengaytiriladi — bitta `invalidateQueries` bilan
// butun bo'limni yangilash uchun (soat o'zgarsa tayyorgarlik ham o'zgaradi).
export const plannerLoadsKey = () => [...plannerKeys.all, "loads"];
export const plannerAvailabilityKey = () => [...plannerKeys.all, "availability"];
export const plannerPreflightKey = () => [...plannerKeys.all, "preflight"];
export const plannerSettingsKey = () => [...plannerKeys.all, "settings"];

export const plannerQueries = {
  loads: () =>
    queryOptions({
      queryKey: plannerLoadsKey(),
      queryFn: () => plannerAPI.getLoads().then((r) => r.data.data),
    }),

  availability: () =>
    queryOptions({
      queryKey: plannerAvailabilityKey(),
      queryFn: () => plannerAPI.getAvailability().then((r) => r.data.data),
    }),

  preflight: () =>
    queryOptions({
      queryKey: plannerPreflightKey(),
      queryFn: () => plannerAPI.getPreflight().then((r) => r.data.data),
    }),

  settings: () =>
    queryOptions({
      queryKey: plannerSettingsKey(),
      queryFn: () => plannerAPI.getSettings().then((r) => r.data.data),
    }),

  runs: () =>
    queryOptions({
      queryKey: plannerKeys.lists(),
      queryFn: () => plannerAPI.getRuns().then((r) => r.data.data),
    }),

  run: (id) =>
    queryOptions({
      queryKey: plannerKeys.detail(id),
      queryFn: () => plannerAPI.getRun(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),
};

export const usePlannerLoads = () => useQuery(plannerQueries.loads());
export const usePlannerAvailability = () => useQuery(plannerQueries.availability());
export const usePlannerPreflight = () => useQuery(plannerQueries.preflight());
export const usePlannerSettings = () => useQuery(plannerQueries.settings());
export const usePlannerRuns = () => useQuery(plannerQueries.runs());
export const usePlannerRun = (id) => useQuery(plannerQueries.run(id));
