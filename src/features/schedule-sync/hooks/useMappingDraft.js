// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Queries
import { useSaveMappings } from "../queries/scheduleSync.mutations";

// Helpers & data
import {
  baseTargetOf,
  mappingRowId,
  notifySyncError,
} from "../helpers/scheduleSync.helpers";
import { MAPPING_BATCH_LIMIT } from "../data/scheduleSync.data";

/**
 * Moslash tahrirlari — LOKAL to'planadi va BITTA so'rov bilan saqlanadi.
 *
 * Har bir tanlov darhol serverga ketsa, farq har bosishda qayta
 * hisoblanib, odam hali tugatmagan ish ustida "Qo'llash" ko'rinishi
 * sakrab turardi.
 *
 * ⚠️ Serverga nom EMAS, server bergan `key` yuboriladi (nomdagi belgilar
 * so'rov tanasida o'zgartirilishi mumkin), `label` — faqat ko'rsatish uchun.
 */
const useMappingDraft = () => {
  const [edits, setEdits] = useState(() => new Map());
  const { mutate, isPending } = useSaveMappings();

  const setTarget = (row, targetId) =>
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(mappingRowId(row), {
        kind: row.kind,
        key: row.key,
        label: row.label,
        targetId,
      });
      return next;
    });

  const reset = (row) =>
    setEdits((prev) => {
      const id = mappingRowId(row);
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

  const resetAll = () => setEdits(new Map());

  /** Qatorning saqlanmagan tahriri (`undefined` — tahrir yo'q). */
  const editOf = (row) => edits.get(mappingRowId(row));

  /**
   * Tanlagichdagi o'zgarish.
   * - Saqlangan qiymatga qaytildi → tahrir bekor.
   * - Tanlov tozalandi → saqlangan moslash bo'lsa, u o'chiriladi.
   */
  const change = (row, value) => {
    if (!value) {
      if (row.stored) setTarget(row, null);
      else reset(row);
      return;
    }
    if (value === baseTargetOf(row)) {
      reset(row);
      return;
    }
    setTarget(row, value);
  };

  const save = () => {
    const items = [...edits.values()];
    if (items.length === 0) return;

    if (items.length > MAPPING_BATCH_LIMIT) {
      toast.error(
        `Bir martada ${MAPPING_BATCH_LIMIT} tadan ko'p o'zgarish saqlab bo'lmaydi`,
      );
      return;
    }

    mutate(items, {
      onSuccess: () => {
        resetAll();
        toast.success("Moslash saqlandi");
      },
      onError: (err) => notifySyncError(err),
    });
  };

  return {
    count: edits.size,
    editOf,
    change,
    setTarget,
    reset,
    resetAll,
    save,
    isSaving: isPending,
  };
};

export default useMappingDraft;
