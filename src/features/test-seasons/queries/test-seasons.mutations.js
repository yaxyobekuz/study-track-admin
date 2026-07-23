// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";
import { teacherAssignmentsAPI } from "../api/teacherAssignments.api";

// Keys
import { testSeasonsKeys, seasonAssignmentsKeys } from "./test-seasons.queries";

/* ─── Seasons ──────────────────────────────────────────────────────────────── */

export const useCreateSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => testSeasonsAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: testSeasonsKeys.lists() }),
  });
};

export const useEditSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      testSeasonsAPI.update(id, data).then((r) => r.data),
    // Refresh both the list and the edited season's detail.
    onSuccess: () => qc.invalidateQueries({ queryKey: testSeasonsKeys.all }),
  });
};

export const useDeleteSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => testSeasonsAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: testSeasonsKeys.lists() }),
  });
};

export const useAnnounceSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      testSeasonsAPI.announce(id, data).then((r) => r.data),
    // Announce is queued via the bot and doesn't change season fields, but keep
    // the list fresh (status can advance) — no detail to touch.
    onSuccess: () => qc.invalidateQueries({ queryKey: testSeasonsKeys.lists() }),
  });
};

export const useFinalizeSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => testSeasonsAPI.finalize(id).then((r) => r.data),
    // Finalize flips status + finalizedAt → refresh list and detail.
    onSuccess: () => qc.invalidateQueries({ queryKey: testSeasonsKeys.all }),
  });
};

/* ─── Teacher assignments ────────────────────────────────────────────────────── */

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      teacherAssignmentsAPI.create(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: seasonAssignmentsKeys.lists() }),
  });
};

export const useBulkCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      teacherAssignmentsAPI.bulkCreate(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: seasonAssignmentsKeys.lists() }),
  });
};

export const useEditAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      teacherAssignmentsAPI.update(id, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: seasonAssignmentsKeys.lists() }),
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => teacherAssignmentsAPI.delete(id).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: seasonAssignmentsKeys.lists() }),
  });
};
