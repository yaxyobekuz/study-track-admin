// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";
import { teacherAssignmentsAPI } from "../api/teacherAssignments.api";

export const testSeasonsKeys = createQueryKeys("test-seasons");

/**
 * Teacher-assignments are a distinct resource (own endpoint), so they get their
 * own key factory. Lists are always scoped to a season.
 */
export const seasonAssignmentsKeys = createQueryKeys("season-assignments");

export const testSeasonsQueries = {
  /** Test seasons list → the seasons array. */
  list: (params) =>
    queryOptions({
      queryKey: testSeasonsKeys.list(params),
      queryFn: () => testSeasonsAPI.getAll(params).then((r) => r.data.data),
    }),
};

export const seasonAssignmentsQueries = {
  /** Teacher-assignments for one season → the assignments array. */
  list: (seasonId, params) =>
    queryOptions({
      queryKey: seasonAssignmentsKeys.list({ season: seasonId, ...params }),
      queryFn: () =>
        teacherAssignmentsAPI
          .getAll({ season: seasonId, ...params })
          .then((r) => r.data.data),
      enabled: Boolean(seasonId),
    }),
};
