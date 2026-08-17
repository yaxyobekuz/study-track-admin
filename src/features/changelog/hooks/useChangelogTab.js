// Router
import { useSearchParams } from "react-router-dom";

/**
 * Sahifa tabini URL bilan bog'laydi (`?tab=settings`).
 *
 * Birinchi tab standart, shuning uchun u paramsiz — manzil toza qoladi.
 * `replace: true` — tab bosish brauzer tarixini to'ldirmasligi uchun.
 *
 * DIQQAT: `ChangelogListTab` dagi `setParam` helperi `page` dan boshqa har
 * qanday parametr o'zgarganda `page` ni o'chiradi. Tab shu sababli ALOHIDA
 * setter orqali boshqariladi — ikkalasi ham funksional `prev => ...` shaklda
 * ishlaydi, ya'ni bir-biriga xalaqit qilmaydi.
 *
 * (`features/users/hooks/useDetailTab.js` bilan bir xil mantiq. Ataylab
 * nusxa: shared'ga ko'chirish `users` featureiga tegadi va bu ishning
 * doirasidan tashqarida.)
 *
 * @param {{value: string}[]} tabs
 * @returns {[string, (value: string) => void]}
 */
const useChangelogTab = (tabs) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("tab");
  const tab = tabs.some((t) => t.value === requested) ? requested : tabs[0].value;

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

export default useChangelogTab;
