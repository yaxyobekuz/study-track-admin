// TanStack Query
import { queryOptions, useQuery, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { messagesAPI } from "../api/messages.api";
import { usersAPI } from "@/features/users/api/users.api";

export const messagesKeys = createQueryKeys("messages");

export const messagesQueries = {
  /** Paginated, filterable messages list → `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: messagesKeys.list(params),
      queryFn: () => messagesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Single message with delivery details → the message object. */
  detail: (id) =>
    queryOptions({
      queryKey: messagesKeys.detail(id),
      queryFn: () => messagesAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Students used by the "send message" recipient picker, optionally scoped to
   * a class. Served by the users endpoint → the student array. Keyed off
   * `messagesKeys.all` so it lives with the rest of the feature. Pass
   * `enabled: false` to skip the fetch until the picker is actually shown.
   */
  students: (classId, enabled = true) =>
    queryOptions({
      queryKey: [...messagesKeys.all, "students", classId ?? null],
      queryFn: () =>
        usersAPI
          .getAll({ role: "student", limit: 200, ...(classId && { class: classId }) })
          .then((r) => r.data.data ?? []),
      enabled,
    }),
};

/**
 * Single message detail (delivery status, stats). Fetched lazily by the
 * details modal from the row id.
 *
 * @example
 * const { data: message, isLoading } = useMessage(id);
 */
export const useMessage = (id) => useQuery(messagesQueries.detail(id));

/**
 * Students for the send-message picker, optionally filtered by class. Pass
 * `enabled` to defer the fetch until the picker is shown.
 *
 * @example
 * const { data: students = [] } = useMessageStudents(classId, isStudentPicker);
 */
export const useMessageStudents = (classId, enabled = true) =>
  useQuery(messagesQueries.students(classId, enabled));
