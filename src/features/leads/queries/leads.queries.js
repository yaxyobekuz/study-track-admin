// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { leadsAPI } from "../api/leads.api";

export const leadsKeys = createQueryKeys("leads");

const listKey = [...leadsKeys.all, "list"];
const detailKey = [...leadsKeys.all, "detail"];
const analyticsKey = [...leadsKeys.all, "analytics"];
const catalogKey = [...leadsKeys.all, "catalog"];

export const leadsQueries = {
  /** Lidlar ro'yxati (sahifalangan, filtrlangan). */
  list: (params) =>
    queryOptions({
      queryKey: [...listKey, params],
      queryFn: () => leadsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta lid + yozuvlar + ZINAPOYA TARIXI (`stageTimeline`). */
  detail: (id) =>
    queryOptions({
      queryKey: [...detailKey, id],
      queryFn: () => leadsAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * QABUL ZINAPOYASI — pog'onalar, yorliqlar va chiqish holatlari.
   * ⚠️ SERVERDAN: zinapoya serverda yagona joyda
   * (`helpers/leadStage.helpers.js`), panel uni o'zi yozmaydi.
   */
  stages: () =>
    queryOptions({
      queryKey: [...leadsKeys.all, "stages"],
      queryFn: () => leadsAPI.getStages().then((r) => r.data.data),
      staleTime: 60 * 60 * 1000,
    }),

  /** Funnel: qaysi pog'onagacha YETGANLAR va qaysi qadamda yo'qotilgani. */
  conversion: (params) =>
    queryOptions({
      queryKey: [...analyticsKey, "conversion", params],
      queryFn: () => leadsAPI.getConversion(params).then((r) => r.data.data),
    }),

  /** Xodimlar kesimi: olib kelganlar va mas'ullar bo'yicha konversiya. */
  staffConversion: (params) =>
    queryOptions({
      queryKey: [...analyticsKey, "staff", params],
      queryFn: () => leadsAPI.getStaffConversion(params).then((r) => r.data.data),
    }),

  /** Manbalar katalogi (filtr va formadagi tanlagich uchun). */
  sources: () =>
    queryOptions({
      queryKey: [...catalogKey, "sources"],
      queryFn: () => leadsAPI.getSources().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),

  /** Yo'nalishlar katalogi. */
  directions: () =>
    queryOptions({
      queryKey: [...catalogKey, "directions"],
      queryFn: () => leadsAPI.getDirections().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),

  /** Toifalar katalogi. */
  categories: () =>
    queryOptions({
      queryKey: [...catalogKey, "categories"],
      queryFn: () => leadsAPI.getCategories().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),
};
