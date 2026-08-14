// Router
import { useSearchParams } from "react-router-dom";

// Data
import { resolveTab } from "../data/usersTabs.data";

/**
 * Detal sahifaning ichki tabini URL bilan bog'laydi (`?tab=finance`).
 *
 * URL'da saqlanishi ikki narsani beradi: sahifani ochiq tab bilan link qilib
 * yuborish mumkin va brauzerning "orqaga" tugmasi tab bo'yicha ishlaydi.
 * Birinchi tab standart, shuning uchun u paramsiz — manzil toza qoladi.
 *
 * @param {{value: string}[]} tabs
 * @returns {[string, (value: string) => void]}
 */
const useDetailTab = (tabs) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = resolveTab(tabs, searchParams.get("tab"));

  const setTab = (value) =>
    setSearchParams(
      (prev) => {
        if (value === tabs[0].value) prev.delete("tab");
        else prev.set("tab", value);
        return prev;
      },
      { replace: true },
    );

  return [tab, setTab];
};

export default useDetailTab;
