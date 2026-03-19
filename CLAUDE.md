# Claude Code — Admin Module Rules

> Global rules in root CLAUDE.md also apply.

## Structure

- Follow the existing feature-based structure in this module.

## Static data

- Do not hardcode reusable static UI data inside pages/components.
- Always move reusable static data into a dedicated adjacent `*.data.js` file and import it.

## Dates

- Always use `formatDateUz(...)` for date formatting in UI.
- Do not use `toLocaleDateString()` / `toLocaleString()` directly in UI rendering.

## Data fetching & caching

- Use TanStack Query for all API calls and caching.
- Reuse the existing query key conventions and invalidation patterns already used in this module.
