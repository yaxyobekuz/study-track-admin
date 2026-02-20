// React
import { useState, useEffect } from "react";

/**
 * Hook that returns whether a CSS media query currently matches.
 * @param {string} query - Media query string.
 * @returns {boolean} True when the media query matches.
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    /**
     * Sync state with the current media query match value.
     */
    const handleChange = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
