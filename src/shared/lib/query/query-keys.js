/**
 * @typedef {readonly unknown[]} QueryKey
 */

/**
 * Creates a type-safe, hierarchical query key factory for a given feature.
 *
 * Provides four granularity levels:
 * - `all`    — matches every query in the feature (e.g. invalidate everything)
 * - `lists`  — matches all list-type queries
 * - `list`   — matches a specific list query filtered by params
 * - `details`— matches all detail-type queries
 * - `detail` — matches a single detail query by id
 *
 * @param {string} feature - The feature/entity name (e.g. "users", "classes").
 * @returns {{
 *   all:     readonly [string],
 *   lists:   () => readonly [string, string],
 *   list:    (params?: Record<string, unknown>) => readonly unknown[],
 *   details: () => readonly [string, string],
 *   detail:  (id: string | number) => readonly [string, string, string | number]
 * }} A query key factory object.
 *
 * @example
 * const usersKeys = createQueryKeys("users");
 *
 * usersKeys.all            // ["users"]
 * usersKeys.lists()        // ["users", "list"]
 * usersKeys.list({ page: 1 }) // ["users", "list", { page: 1 }]
 * usersKeys.details()      // ["users", "detail"]
 * usersKeys.detail(5)      // ["users", "detail", 5]
 */
export const createQueryKeys = (feature) => ({
  all: [feature],
  lists: () => [feature, "list"],
  list: (params) => (params ? [feature, "list", params] : [feature, "list"]),
  details: () => [feature, "detail"],
  detail: (id) => [feature, "detail", id],
});

// ─── Example ───────────────────────────────────────────────────────────

export const usersKeys = createQueryKeys("users");
