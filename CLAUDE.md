# Claude Code - Admin Module Rules

> Global rules in root CLAUDE.md also apply.

## Structure

- Follow the existing feature-based structure in this module.

## Static data

- Do not hardcode reusable static UI data inside pages/components.
- Always move reusable static data into a dedicated adjacent `*.data.js` file and import it.

## Dates

Tizimda sana YAGONA formatda: `21-may, 2025` / `21-may, 2025 14:30` / `Yanvar, 2026`.

- Barcha formatlovchilar `src/shared/utils/date.utils.js` da: `formatDateUz`,
  `formatDateTimeUz`, `formatTimeUz`, `formatMonthUz`, `formatDateRangeUz`.
  Feature ichida lokal `formatDate` yozilmaydi, oy nomlari nusxalanmaydi.
- `toLocaleDateString()` / `toLocaleString()` / `Intl.DateTimeFormat` va qo'lda
  yig'ilgan `` `${day}.${month}.${year}` `` shablonlari TAQIQLANGAN.
- `toISOString().split("T")[0]` faqat `<input type="date">` va API parametri
  uchun — ekranga chiqmaydi. Oy kalitini inputga berish — `monthKeyToInputValue`,
  ko'rsatish — `formatMonthKey` (`shared/helpers/month.helpers.js`).
- Eski nomlar (`formatDateUZ`, `formatUzDate`, `formatTimeUZ`, ...) alias
  sifatida qolgan, yangi kodda ishlatilmaydi.

Batafsil: `.claude/rules/dates.md`.

## Data fetching & caching

- Use TanStack Query for all API calls and caching.
- Reuse the existing query key conventions and invalidation patterns already used in this module.
