/**
 * Creates a hierarchical query-key factory for a feature/entity.
 *
 * Every feature owns its own factory (in `<feature>/queries/<feature>.queries.js`),
 * so keys stay colocated with the queries that use them and invalidation is
 * predictable. Levels go from broad to narrow — invalidate at the level you need:
 *
 * - `all`      → matches EVERY query in the feature      → invalidate everything
 * - `lists()`  → matches all list queries               → invalidate after create/delete
 * - `list(p)`  → one list filtered by params            → the actual list query key
 * - `details()`→ matches all detail queries
 * - `detail(id)` → one entity by id                     → invalidate after edit
 *
 * Need a sub-resource the factory doesn't cover? Extend from `all`, e.g.
 * `[...usersKeys.all, "stats"]` or `[...usersKeys.all, "export", role]`.
 *
 * @param {string} feature - The feature/entity name (e.g. "users", "classes").
 * @returns {{
 *   all: readonly [string],
 *   lists: () => readonly [string, "list"],
 *   list: (params?: unknown) => readonly unknown[],
 *   details: () => readonly [string, "detail"],
 *   detail: (id: string | number) => readonly [string, "detail", string | number],
 * }}
 *
 * @example
 * export const usersKeys = createQueryKeys("users");
 * usersKeys.all            // ["users"]
 * usersKeys.lists()        // ["users", "list"]
 * usersKeys.list({ page }) // ["users", "list", { page }]
 * usersKeys.detail(5)      // ["users", "detail", 5]
 */
export const createQueryKeys = (feature) => ({
  all: [feature],
  lists: () => [feature, "list"],
  list: (params) => (params ? [feature, "list", params] : [feature, "list"]),
  details: () => [feature, "detail"],
  detail: (id) => [feature, "detail", id],
});
