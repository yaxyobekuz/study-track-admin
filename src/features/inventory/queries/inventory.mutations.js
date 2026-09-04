// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import {
  catalogAPI,
  stockAPI,
  transfersAPI,
  checksAPI,
  damagesAPI,
  inventoryReportsAPI,
} from "../api/inventory.api";
import { inventoryKeys } from "./inventory.queries";

// Undiruv KASSAGA tegadi, ya'ni to'lov turlari qoldig'i va moliya
// hisobotlari ham eskiradi — xarajat modulidagi bilan bir xil mulohaza.
import { financeKeys } from "@/features/finance/queries/finance.queries";
import { reportKeys } from "@/features/financeReports/queries/financeReports.queries";

/**
 * Butun bo'limni yangilaydi.
 *
 * Nozik kesimlar (faqat "list", faqat "detail") ATAYLAB ishlatilmagan:
 * bu domenda deyarli har bir amal bir nechta ekranga tegadi — bitta
 * zarar qayd etilishi xatlovni ham, kunlik hisobotni ham, umumiy
 * manzarani ham eskirtiradi. Nozik invalidatsiya bu yerda faqat "nega
 * raqam yangilanmadi?" degan xatolar manbai bo'lardi.
 */
const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
};

/** Undiruv/bekor qilish — kassaga ham tegadi. */
const useInvalidateWithCash = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    queryClient.invalidateQueries({ queryKey: financeKeys.all });
    queryClient.invalidateQueries({ queryKey: reportKeys.all });
  };
};

// ─────────────────────────────────────────────
// Katalog
// ─────────────────────────────────────────────

export const useCreateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => catalogAPI.createCategory(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => catalogAPI.updateCategory(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      catalogAPI.archiveCategory(id, isArchived).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useCreateItem = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => catalogAPI.createItem(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateItem = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => catalogAPI.updateItem(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveItem = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      catalogAPI.archiveItem(id, isArchived).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useCreateLocation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => catalogAPI.createLocation(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateLocation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => catalogAPI.updateLocation(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveLocation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      catalogAPI.archiveLocation(id, isArchived).then((r) => r.data),
    onSuccess: invalidate,
  });
};

// ─────────────────────────────────────────────
// Xatlov
// ─────────────────────────────────────────────

export const useAddStock = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => stockAPI.add(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useRepairStock = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => stockAPI.repair(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useWriteOffStock = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => stockAPI.writeOff(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useAdjustStock = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => stockAPI.adjust(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/**
 * O'TKAZMA AKTI — bir aktda bir nechta jihoz, qaysi xonaga va KIMGA.
 *
 * Eski `useTransferStock` shu nomga ko'chirildi: u bitta jihozni
 * ko'chirardi va "kimga topshirildi" degan savolga javob bermasdi.
 */
export const useCreateTransfer = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => transfersAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

// ─────────────────────────────────────────────
// Kunlik monitoring
// ─────────────────────────────────────────────

/** Varaq ochish IDEMPOTENT — mavjud bo'lsa o'sha qaytadi. */
export const useOpenCheck = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => checksAPI.open(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCheckLines = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => checksAPI.updateLines(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useAttachCheckFiles = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, lineId, files }) => {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);
      return checksAPI.attachFiles(id, lineId, formData).then((r) => r.data.data);
    },
    onSuccess: invalidate,
  });
};

/** Yuborish — varaq MUHRLANADI va xatlov o'zgaradi. */
export const useSubmitCheck = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => checksAPI.submit(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useDeleteCheck = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => checksAPI.remove(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};

// ─────────────────────────────────────────────
// Zarar va undiruv
// ─────────────────────────────────────────────

/** Zarar qayd etish — rasm biriktirilishi mumkin, shuning uchun FormData. */
export const useCreateDamage = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ files = [], ...data }) => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      }
      for (const file of files) formData.append("files", file);

      return damagesAPI.create(formData).then((r) => r.data.data);
    },
    onSuccess: invalidate,
  });
};

export const useWaiveDamage = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) => damagesAPI.waive(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUnwaiveDamage = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => damagesAPI.unwaive(id).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCancelDamage = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) => damagesAPI.cancel(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** Aybdorga yozish — summa berilmasa server teng bo'ladi. */
export const useCreateCharges = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ damageId, data }) =>
      damagesAPI.createCharges(damageId, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCharge = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => damagesAPI.updateCharge(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCancelCharge = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) => damagesAPI.cancelCharge(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/**
 * Undiruvni qabul qilish — pul KASSAGA tushadi, shuning uchun moliya
 * bo'limi ham yangilanadi.
 */
export const useCreateDamagePayment = () => {
  const invalidate = useInvalidateWithCash();
  return useMutation({
    mutationFn: (data) => damagesAPI.createPayment(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useVoidDamagePayment = () => {
  const invalidate = useInvalidateWithCash();
  return useMutation({
    mutationFn: ({ id, reason }) => damagesAPI.voidPayment(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

// ─────────────────────────────────────────────
// Sozlamalar
// ─────────────────────────────────────────────

export const useUpdateInventorySettings = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => inventoryReportsAPI.updateSettings(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
