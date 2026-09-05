// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import {
  catalogAPI,
  stockAPI,
  transfersAPI,
  checksAPI,
  damagesAPI,
  inventoryReportsAPI,
} from "../api/inventory.api";

export const inventoryKeys = createQueryKeys("inventory");

// Sub-resurslar `all` dan kengaytiriladi — bitta amal butun bo'limni
// yangilashi kerak bo'lganda (zarar qayd etilishi xatlovni ham,
// hisobotni ham eskirtiradi) yagona kalit yetarli bo'lsin.
const catalogKey = [...inventoryKeys.all, "catalog"];
const stockKey = [...inventoryKeys.all, "stock"];
const checksKey = [...inventoryKeys.all, "checks"];
const damagesKey = [...inventoryKeys.all, "damages"];
const reportsKey = [...inventoryKeys.all, "reports"];

export const inventoryQueries = {
  // ── Katalog ────────────────────────────────
  categories: (params) =>
    queryOptions({
      queryKey: [...catalogKey, "categories", params],
      queryFn: () => catalogAPI.getCategories(params).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    }),

  items: (params) =>
    queryOptions({
      queryKey: [...catalogKey, "items", params],
      queryFn: () => catalogAPI.getItems(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Faol jihozlar — tanlagichlar uchun (kamdan-kam o'zgaradi). */
  activeItems: (params) =>
    queryOptions({
      queryKey: [...catalogKey, "items", "active", params],
      queryFn: () => catalogAPI.getActiveItems(params).then((r) => r.data.items ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  locations: (params) =>
    queryOptions({
      queryKey: [...catalogKey, "locations", params],
      queryFn: () => catalogAPI.getLocations(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  activeLocations: () =>
    queryOptions({
      queryKey: [...catalogKey, "locations", "active"],
      queryFn: () => catalogAPI.getActiveLocations().then((r) => r.data.items ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  location: (id) =>
    queryOptions({
      queryKey: [...catalogKey, "locations", "detail", id],
      queryFn: () => catalogAPI.getLocationById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * JIHOZNI O'CHIRISHDAN OLDINGI TEKSHIRUV — "nima yo'qoladi va nima
   * to'sib turibdi".
   *
   * Oyna tugmani bosishdan OLDIN o'qiydi: to'siqni serverning xato
   * xabari sifatida ko'rsatish kech bo'lardi — foydalanuvchi sababni
   * o'chirishga urinib ko'rgandan keyin bilib olardi.
   */
  itemUsage: (id) =>
    queryOptions({
      queryKey: [...catalogKey, "items", "usage", id],
      queryFn: () => catalogAPI.getItemUsage(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  // ── Xatlov ─────────────────────────────────
  stocks: (params) =>
    queryOptions({
      queryKey: [...stockKey, "list", params],
      queryFn: () => stockAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta xonaning to'liq xatlovi — sahifalanmaydi. */
  stockByLocation: (locationId, params) =>
    queryOptions({
      queryKey: [...stockKey, "location", locationId, params],
      queryFn: () => stockAPI.getByLocation(locationId, params).then((r) => r.data.data),
      enabled: Boolean(locationId),
    }),

  /** Xatlov qatorini o'chirishdan oldingi tekshiruv (`itemUsage` bilan bir xil). */
  stockUsage: (id) =>
    queryOptions({
      queryKey: [...stockKey, "usage", id],
      queryFn: () => stockAPI.getUsage(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  movements: (params) =>
    queryOptions({
      queryKey: [...stockKey, "movements", params],
      queryFn: () => stockAPI.getMovements(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  // ── O'tkazmalar (topshirish-qabul qilish aktlari) ──
  transfers: (params) =>
    queryOptions({
      queryKey: [...stockKey, "transfers", params],
      queryFn: () => transfersAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  transfer: (id) =>
    queryOptions({
      queryKey: [...stockKey, "transfer", id],
      queryFn: () => transfersAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  // ── Kunlik monitoring ──────────────────────
  checks: (params) =>
    queryOptions({
      queryKey: [...checksKey, "list", params],
      queryFn: () => checksAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  check: (id) =>
    queryOptions({
      queryKey: [...checksKey, "detail", id],
      queryFn: () => checksAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Hisobot bermagan xonalar. `staleTime` qisqa: bu ekran kun davomida
   * o'zgarib turadigan yagona blok.
   */
  pendingChecks: (params) =>
    queryOptions({
      queryKey: [...checksKey, "pending", params],
      queryFn: () => checksAPI.getPending(params).then((r) => r.data.data),
      staleTime: 60 * 1000,
    }),

  // ── Zarar va undiruv ───────────────────────
  damages: (params) =>
    queryOptions({
      queryKey: [...damagesKey, "list", params],
      queryFn: () => damagesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  damage: (id) =>
    queryOptions({
      queryKey: [...damagesKey, "detail", id],
      queryFn: () => damagesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  charges: (params) =>
    queryOptions({
      queryKey: [...damagesKey, "charges", params],
      queryFn: () => damagesAPI.getCharges(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * BITTA ODAMNING QARZI — o'quvchi/xodim profilidagi blok.
   * Qoldiq nolga tushmaguncha `hasDebt` rost bo'lib turadi.
   */
  personDebt: (personId) =>
    queryOptions({
      queryKey: [...damagesKey, "person", personId],
      queryFn: () => damagesAPI.getPersonSummary(personId).then((r) => r.data.data),
      enabled: Boolean(personId),
    }),

  payments: (params) =>
    queryOptions({
      queryKey: [...damagesKey, "payments", params],
      queryFn: () => damagesAPI.getPayments(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  // ── Hisobotlar va sozlamalar ───────────────
  summary: (params) =>
    queryOptions({
      queryKey: [...reportsKey, "summary", params],
      queryFn: () => inventoryReportsAPI.getSummary(params).then((r) => r.data.data),
    }),

  byLocation: (params) =>
    queryOptions({
      queryKey: [...reportsKey, "locations", params],
      queryFn: () => inventoryReportsAPI.getByLocation(params).then((r) => r.data.items ?? []),
    }),

  byItem: (params) =>
    queryOptions({
      queryKey: [...reportsKey, "items", params],
      queryFn: () => inventoryReportsAPI.getByItem(params).then((r) => r.data.items ?? []),
    }),

  byReason: (params) =>
    queryOptions({
      queryKey: [...reportsKey, "reasons", params],
      queryFn: () => inventoryReportsAPI.getByReason(params).then((r) => r.data.items ?? []),
    }),

  monitoringReport: (params) =>
    queryOptions({
      queryKey: [...reportsKey, "monitoring", params],
      queryFn: () => inventoryReportsAPI.getMonitoring(params).then((r) => r.data.items ?? []),
    }),

  debtors: (params) =>
    queryOptions({
      queryKey: [...reportsKey, "debtors", params],
      queryFn: () => inventoryReportsAPI.getDebtors(params).then((r) => r.data),
    }),

  settings: () =>
    queryOptions({
      queryKey: [...inventoryKeys.all, "settings"],
      queryFn: () => inventoryReportsAPI.getSettings().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),

  /**
   * To'lov turlari tanlagichi — `{ id, name }` ro'yxati.
   *
   * Moliya bo'limidagi `financeQueries.activeAccounts()` EMAS: u `finance.view`
   * talab qiladi va qoldiqni ham qaytaradi. Undiruvni qabul qiladigan
   * xodimga kassa qoldig'i ko'rsatilmaydi — shuning uchun inventarning o'z
   * qisqa ro'yxati.
   */
  paymentAccounts: () =>
    queryOptions({
      queryKey: [...inventoryKeys.all, "payment-accounts"],
      queryFn: () =>
        inventoryReportsAPI.getPaymentAccounts().then((r) => r.data.items ?? []),
      staleTime: 10 * 60 * 1000,
    }),
};
