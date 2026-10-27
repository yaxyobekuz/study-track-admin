// Components
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Data
import { toneOfReason } from "../data/departures.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * SABABLAR KESIMI — "nega ketishyapti" degan savolning raqamli javobi.
 *
 * ⚠️ HAR DOIM TO'RTTA QATOR, nollari ham (server ham shunday qaytaradi).
 * Nol qatorni tashlab yuborish "chetlatilgan yo'q" degan MA'LUMOTdan
 * mahrum qilardi: bo'sh joy "nol" degani emas, "hisoblanmadi" degani ham
 * bo'lib o'qiladi.
 *
 * ⚠️ FOIZ SHU YERDA HISOBLANADI, serverdan tayyor kelmaydi: umumiy
 * ko'rinishda (barcha filiallar) serverning foizi OG'IRLIKSIZ
 * o'rtachalanardi, sanoqlar esa qo'shiladi — ya'ni ekranda jamiga mos
 * kelmaydigan ulush chiqardi (`AttendanceTrendCard` dagi AYNI qoida).
 */
const DepartureReasonBreakdown = ({
  byReason = [],
  total = 0,
  activeReason = "all",
  onSelect,
  isLoading,
}) => (
  <Card className="space-y-4">
    <div>
      <h2 className="font-semibold text-gray-900">Sabablar kesimi</h2>
      <p className="mt-0.5 text-xs text-gray-500">
        Tanlangan davrdagi ketishlarning toifalari — qatorni bosib
        ro&apos;yxatni filtrlash mumkin
      </p>
    </div>

    {isLoading ? (
      <div className="space-y-3.5">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-9 w-full" />
        ))}
      </div>
    ) : (
      <ul className="space-y-1">
        {byReason.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const tone = toneOfReason(item.key);
          const isActive = activeReason === item.key;

          return (
            <li key={item.key}>
              {/* Qator — TUGMA: kesimni ko'rib turgan odam darhol o'sha
                  toifani ro'yxatda ko'rishni xohlaydi. Bosilgan qator
                  qayta bosilsa filtr tozalanadi (toggle). */}
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect?.(isActive ? "all" : item.key)}
                className={cn(
                  "w-full space-y-1.5 rounded-xl px-2 py-2 text-left transition-colors",
                  isActive ? "bg-gray-50 ring-1 ring-gray-200" : "hover:bg-gray-50",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "min-w-0 truncate text-sm",
                      isActive ? "font-medium text-gray-900" : "text-gray-700",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="shrink-0 text-sm text-gray-500">
                    <span className="font-semibold tabular-nums text-gray-900">
                      {item.count}
                    </span>{" "}
                    ta · {percent}%
                  </span>
                </div>

                {/* Chiziq — raqamni ko'z bilan solishtirish uchun. Nolda ham
                    yo'lak qoladi: qator butunlay yo'qolib ketmasin. */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn("h-full rounded-full transition-all", tone.bar)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);

export default DepartureReasonBreakdown;
