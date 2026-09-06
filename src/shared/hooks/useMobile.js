import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Dastlabki qiymat render vaqtida o'qiladi — effect ichida sinxron
  // setState yo'q (react-hooks/set-state-in-effect).
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
