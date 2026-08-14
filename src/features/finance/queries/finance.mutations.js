// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tariffsAPI, studentTariffsAPI } from "../api/finance.api";
import {
  invoicesAPI,
  invoicePaymentsAPI,
  financeStatusAPI,
  financeSettingsAPI,
} from "../api/invoices.api";

// Keys
import { financeKeys } from "./finance.queries";

/**
 * Narx yoki biriktirish o'zgarsa, hisoblangan summalar ham eskiradi
 * (ro'yxat, detal, oylik varaqa) — shuning uchun invalidatsiya butun
 * moliya bo'limi bo'yicha.
 */
const invalidateFinance = (qc) =>
  qc.invalidateQueries({ queryKey: financeKeys.all });

// ── Tariflar katalogi ────────────────────────

export const useCreateTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tariffsAPI.create(data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useUpdateTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      tariffsAPI.update(id, data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useArchiveTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      tariffsAPI.archive(id, isArchived).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useDeleteTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tariffsAPI.delete(id).then((r) => r.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

// ── Narx versiyalari ─────────────────────────

export const useAddTariffVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      tariffsAPI.addVersion(id, data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useUpdateTariffVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    // `force` — faqat haqiqiy kiritish xatosini to'g'rilash uchun
    // (`tariffs.adjust` ruxsati talab qilinadi, server logga yozadi).
    mutationFn: ({ id, versionId, data, force }) =>
      tariffsAPI
        .updateVersion(id, versionId, data, force ? { force: true } : undefined)
        .then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useDeleteTariffVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versionId }) =>
      tariffsAPI.deleteVersion(id, versionId).then((r) => r.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

// ── O'quvchi tariflari ───────────────────────

export const useAssignTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => studentTariffsAPI.create(data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useBulkAssignTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      studentTariffsAPI.bulkAssign(data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      studentTariffsAPI.update(id, data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useCloseAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, endMonth }) =>
      studentTariffsAPI.close(id, endMonth).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useChangeAssignmentTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      studentTariffsAPI.changeTariff(id, data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => studentTariffsAPI.delete(id).then((r) => r.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

// ── Hisob-fakturalar ─────────────────────────

/** Majburiyat shakllantirish. `dryRun` bilan chaqirilsa hech narsa yozilmaydi. */
export const useGenerateInvoices = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => invoicesAPI.generate(data).then((r) => r.data.data),
    onSuccess: (summary) => {
      // dryRun hech narsa o'zgartirmagan — keshni bekorga tashlamaymiz
      if (!summary?.dryRun) invalidateFinance(qc);
    },
  });
};

export const useUpdateInvoiceNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) =>
      invoicesAPI.updateNote(id, note).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useCancelInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      invoicesAPI.cancel(id, reason).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useRestoreInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => invoicesAPI.restore(id).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

// ── To'lovlar ────────────────────────────────

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      invoicesAPI.createPayment(id, data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

/** Soft void — moliyaviy yozuv bazadan chiqmaydi, `finance.adjust` talab qiladi. */
export const useVoidPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      invoicePaymentsAPI.void(id, reason).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

// ── Moliyaviy holat ──────────────────────────

export const useCreateFinanceStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => financeStatusAPI.create(data).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useCloseFinanceStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, endMonth }) =>
      financeStatusAPI.close(id, endMonth).then((r) => r.data.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

export const useDeleteFinanceStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => financeStatusAPI.delete(id).then((r) => r.data),
    onSuccess: () => invalidateFinance(qc),
  });
};

// ── Sozlamalar ───────────────────────────────

export const useUpdateFinanceSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    // Serverdan `warnings` ham keladi — akademik davr o'zgarsa ko'rsatiladi
    mutationFn: (data) => financeSettingsAPI.update(data).then((r) => r.data),
    onSuccess: () => invalidateFinance(qc),
  });
};
