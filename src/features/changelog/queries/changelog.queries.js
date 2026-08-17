// TanStack Query
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { changelogAPI, changelogSettingsAPI } from "../api/changelog.api";

export const changelogKeys = createQueryKeys("changelog");

export const changelogSettingsKey = [...changelogKeys.all, "settings"];
export const changelogNotificationsKey = [...changelogKeys.all, "notifications"];

export const changelogQueries = {
  /** Sahifalangan ro'yxat → { data, pagination }. */
  list: (params) =>
    queryOptions({
      queryKey: changelogKeys.list(params),
      queryFn: () => changelogAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Har bir panelning joriy versiyasi + keyingi versiya maslahati. */
  versions: () =>
    queryOptions({
      queryKey: [...changelogKeys.all, "versions"],
      queryFn: () => changelogAPI.getVersions().then((r) => r.data.data),
    }),

  detail: (id) =>
    queryOptions({
      queryKey: changelogKeys.detail(id),
      queryFn: () => changelogAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /** Xabarnoma sozlamalari (singleton). */
  settings: () =>
    queryOptions({
      queryKey: changelogSettingsKey,
      queryFn: () => changelogSettingsAPI.get().then((r) => r.data.data),
    }),

  /** Yuborish jurnali. */
  notifications: (params) =>
    queryOptions({
      queryKey: [...changelogNotificationsKey, params],
      queryFn: () => changelogSettingsAPI.getNotifications(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};

/**
 * O'zgarishlar ro'yxati.
 *
 * @example
 * const { data, isLoading } = useChangelogs({ page, panel });
 */
export const useChangelogs = (params) => useQuery(changelogQueries.list(params));

/**
 * Panellarning joriy versiyalari.
 *
 * @example
 * const { data: versions = [] } = usePanelVersions();
 */
export const usePanelVersions = () => useQuery(changelogQueries.versions());

/**
 * Xabarnoma sozlamalari.
 *
 * @example
 * const { data: settings, isLoading } = useChangelogSettings();
 */
export const useChangelogSettings = () => useQuery(changelogQueries.settings());

/**
 * Yuborish jurnali.
 *
 * @example
 * const { data } = useChangelogNotifications({ page, limit: 10 });
 */
export const useChangelogNotifications = (params) =>
  useQuery(changelogQueries.notifications(params));
