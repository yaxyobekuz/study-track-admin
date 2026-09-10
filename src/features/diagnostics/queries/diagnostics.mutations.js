// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import {
  diagnosticQuestionsAPI,
  diagnosticTestsAPI,
  diagnosticAttemptsAPI,
  diagnosticSettingsAPI,
} from "../api/diagnostics.api";

// Keys
import {
  questionKeys,
  testKeys,
  attemptKeys,
  analyticsKeys,
  settingsKeys,
} from "./diagnostics.queries";

// ── SAVOLLAR BANKI ───────────────────────────

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      diagnosticQuestionsAPI.create(formData).then((r) => r.data),
    // ⚠️ `questionKeys.all` — statistika va qamrov ham yangilanishi kerak,
    // faqat ro'yxat emas: yangi savol ikkalasidagi raqamni o'zgartiradi.
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
};

export const useUpdateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) =>
      diagnosticQuestionsAPI.update(id, formData).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
};

export const useUpdateQuestionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      diagnosticQuestionsAPI.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
};

export const useBulkQuestionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }) =>
      diagnosticQuestionsAPI.bulkStatus(ids, status).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
};

export const useDeleteQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => diagnosticQuestionsAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
};

export const useImportQuestions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      diagnosticQuestionsAPI.import(formData).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
};

// ── TESTLAR ──────────────────────────────────

export const useCreateTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => diagnosticTestsAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: testKeys.all }),
  });
};

export const useUpdateTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      diagnosticTestsAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: testKeys.all }),
  });
};

export const useUpdateTestStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      diagnosticTestsAPI.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: testKeys.all }),
  });
};

export const useDeleteTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => diagnosticTestsAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: testKeys.all }),
  });
};

// ── URINISHLAR ───────────────────────────────

export const useDeleteAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => diagnosticAttemptsAPI.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attemptKeys.all });
      // Urinish o'chirilsa tahlil raqamlari ham o'zgaradi.
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

/** AI tahlilini qayta so'rash. */
export const useAnalyzeAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, kinds }) =>
      diagnosticAttemptsAPI.analyze(id, kinds).then((r) => r.data),
    // Javob "so'raldi" degani — natijani polling olib keladi.
    onSuccess: (_data, { id }) =>
      qc.invalidateQueries({ queryKey: attemptKeys.insights(id) }),
  });
};

/** "Nega xato?" — bitta savolni tushuntirish (natija keshlanadi). */
export const useExplainAnswer = () =>
  useMutation({
    mutationFn: ({ attemptId, questionId }) =>
      diagnosticAttemptsAPI.explain(attemptId, questionId).then((r) => r.data.data),
  });

// ── TEST TOPSHIRISH ──────────────────────────

export const useStartAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => diagnosticAttemptsAPI.start(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attemptKeys.mine() });
      qc.invalidateQueries({ queryKey: testKeys.mine() });
    },
  });
};

export const useSaveAnswer = () =>
  useMutation({
    mutationFn: ({ attemptId, questionId, data }) =>
      diagnosticAttemptsAPI
        .saveAnswer(attemptId, questionId, data)
        .then((r) => r.data.data),
  });

export const useSubmitAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, data }) =>
      diagnosticAttemptsAPI.submit(attemptId, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attemptKeys.all });
      qc.invalidateQueries({ queryKey: testKeys.mine() });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

// ── SOZLAMALAR ───────────────────────────────

export const useUpdateDiagnosticSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => diagnosticSettingsAPI.update(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.all });
      // Chegaralar o'zgardi — tahlil kesimlari qayta hisoblanadi.
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};
