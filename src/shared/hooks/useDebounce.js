// React
import { useEffect, useState } from "react";

/**
 * Qiymatni kechiktirib qaytaradi — qidiruv maydonidan har harf uchun
 * server so'rovi ketmasligi uchun.
 *
 * @param {*} value - kuzatiladigan qiymat
 * @param {number} [delay=400] - millisekund
 * @returns {*} oxirgi "tinch" qiymat
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
