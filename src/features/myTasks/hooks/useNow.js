// React
import { useEffect, useState } from "react";

/**
 * JONLI "HOZIR" — topshiriqning vaqt holati (hozir vaqti / bajarilmadi)
 * soat o'tishi bilan o'zgaradi.
 *
 * ⚠️ Shu hook bo'lmasa, ekran ochiq turganda 15:00 da tugaydigan topshiriq
 * 15:30 da ham "hozir bajarilish vaqti" bo'lib qizarib turardi — ya'ni
 * ekrandagi holat yolg'on bo'lib qolardi.
 *
 * @param {number} [intervalMs=30000] - daqiqalik aniqlik yetarli
 * @returns {number}
 */
const useNow = (intervalMs = 30_000) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
};

export default useNow;
