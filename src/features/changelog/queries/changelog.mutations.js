// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { changelogAPI, changelogSettingsAPI } from "../api/changelog.api";

// Keys
import {
  changelogKeys,
  changelogNotificationsKey,
  changelogSettingsKey,
} from "./changelog.queries";

// DIQQAT: bu yerda `lists()` emas, `all` invalidate qilinadi.
// `lists()` = ["changelog", "list"], versiyalar kaliti esa
// ["changelog", "versions"] — prefiks bo'yicha mos KELMAYDI. Ya'ni `lists()`
// bilan yangi yozuv qo'shilganda sahifa tepasidagi versiya eski bo'lib qolardi.
// `all` = ["changelog"] ikkalasini ham qamrab oladi.
const invalidateAll = (qc) => qc.invalidateQueries({ queryKey: changelogKeys.all });

export const useCreateChangelog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => changelogAPI.create(data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateChangelog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => changelogAPI.update(id, data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteChangelog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => changelogAPI.delete(id).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
};

// Sozlama saqlanganda butun sahifalangan ro'yxatni va versiyalarni qayta
// yuklashning hojati yo'q — faqat sozlama kalitini yangilaymiz.
const invalidateSettings = (qc) =>
  qc.invalidateQueries({ queryKey: changelogSettingsKey });

export const useUpdateChangelogSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => changelogSettingsAPI.update(data).then((r) => r.data),
    onSuccess: () => invalidateSettings(qc),
  });
};

export const useSendChangelogNow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => changelogSettingsAPI.sendNow(data).then((r) => r.data),
    onSuccess: () => {
      // Yuborish ham sozlamani (lastDailySentDate) ham jurnalni o'zgartiradi
      invalidateSettings(qc);
      qc.invalidateQueries({ queryKey: changelogNotificationsKey });
    },
  });
};
