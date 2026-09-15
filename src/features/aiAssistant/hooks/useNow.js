// React
import { useEffect, useState } from "react";

/**
 * Joriy vaqt (ms), `intervalMs` da bir yangilanadi.
 *
 * ⚠️ `Date.now()` RENDER ICHIDA CHAQIRILMAYDI (sof bo'lmagan render): vaqtga
 * bog'liq matn ("13 daqiqa qoldi", "Bugun/Kecha") shu holatdan hisoblanadi
 * va o'z-o'zidan yangilanib turadi.
 *
 * @param {number} intervalMs
 * @returns {number}
 */
const useNow = (intervalMs) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};

export default useNow;
