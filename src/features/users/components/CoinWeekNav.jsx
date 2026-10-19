// Icons
import { ChevronLeft, ChevronRight } from "lucide-react";

// Utils
import { formatDateRangeUz } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";

/**
 * TANGA HAFTASINING NAVIGATORI — "oldingi hafta / keyingi hafta".
 *
 * ⚠️ BU YERDA SANA HISOBLANMAYDI. Hafta chegarasi ham, qo'shni haftalarning
 * langari ham SERVERDAN tayyor keladi (`coinPeriod`): hafta boshini
 * frontendda qayta hisoblash ikki xavf tug'dirardi — ekranda bir hafta,
 * ustundagi raqamda boshqa hafta turishi, va brauzer boshqa vaqt
 * mintaqasida bo'lsa butun navigator bir haftaga siljib ketishi.
 *
 * ⚠️ KELAJAK HAFTA YO'Q: joriy haftada server `nextWeek: null` beradi va
 * tugma o'chiq bo'ladi. U yerda hali birorta tanga yo'q, bo'sh jadval esa
 * "tizim ishlamayapti" bo'lib ko'rinardi.
 *
 * @param {object} props
 * @param {{fromDay: string, toDay: string, prevWeek: string,
 *   nextWeek: string|null, isCurrent: boolean}} [props.period]
 * @param {(weekAnchor: string|null) => void} props.onChange - `null` → joriy hafta
 */
const CoinWeekNav = ({ period, onChange }) => {
  // Server javobi hali kelmagan (yoki eski server) — navigator chizilmaydi:
  // bosib bo'ladigan, lekin qaysi haftada turganini aytmaydigan tugma
  // foydalanuvchini adashtirardi.
  if (!period?.fromDay) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-3 py-2.5">
      <Button
        variant="outline"
        className="h-9 gap-2 pl-2 pr-3"
        aria-label="Oldingi hafta"
        onClick={() => onChange(period.prevWeek)}
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Oldingi hafta</span>
      </Button>

      <Button
        variant="outline"
        className="h-9 gap-2 pl-3 pr-2"
        aria-label="Keyingi hafta"
        disabled={!period.nextWeek}
        onClick={() => onChange(period.nextWeek)}
      >
        <span className="hidden sm:inline">Keyingi hafta</span>
        <ChevronRight size={18} />
      </Button>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
        <span className="text-sm text-gray-600">
          {formatDateRangeUz(period.fromDay, period.toDay)}
        </span>

        {period.isCurrent ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Joriy hafta
          </span>
        ) : (
          <Button
            variant="link"
            className="size-auto h-auto py-0 text-sm"
            onClick={() => onChange(null)}
          >
            Joriy haftaga
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoinWeekNav;
