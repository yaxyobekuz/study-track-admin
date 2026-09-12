// Router
import { useSearchParams } from "react-router-dom";

// Data
import { DEFAULT_TAB, SYNC_TABS } from "../data/scheduleSync.data";

/**
 * Sahifa holati URL da: `?tab=versions&page=2&snapshot=<id>`.
 *
 * Shu tufayli "Dars jadvali" sahifasidagi "yangi o'zgarish bor" havolasi
 * to'g'ridan-to'g'ri kerakli tabni ochadi, sahifa yangilansa ham joy
 * saqlanadi.
 */
const useSyncParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get("tab");
  const tab = SYNC_TABS.some((item) => item.value === rawTab) ? rawTab : DEFAULT_TAB;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const snapshotId = searchParams.get("snapshot");

  /** Faqat berilgan parametrlarni o'zgartiradi; `null` — olib tashlaydi. */
  const update = (patch, options = { replace: true }) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      return next;
    }, options);

  return {
    tab,
    page,
    snapshotId,
    // Tab almashganda sahifa va tanlangan versiya tashlanadi
    setTab: (value) =>
      setSearchParams(value === DEFAULT_TAB ? {} : { tab: value }, { replace: true }),
    setPage: (value) => update({ page: value > 1 ? value : null }),
    // Tafsilot tarixga yoziladi — brauzerning "orqaga" tugmasi ro'yxatga qaytaradi
    openSnapshot: (id) => update({ snapshot: id }, { replace: false }),
    closeSnapshot: () => update({ snapshot: null }),
  };
};

export default useSyncParams;
