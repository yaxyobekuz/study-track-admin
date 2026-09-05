// Icons
import { AlertCircle, Inbox } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Dashboard blokining yagona qobig'i — sarlavha, izoh, amal va uch holat
 * (yuklanmoqda / xato / bo'sh).
 *
 * ⚠️ SHARED, chunki IKKI dashboard bor: moliya va ta'lim. Ular bir xil
 * ko'rinishi shart — foydalanuvchi ikkalasini bitta tizim deb o'qiydi.
 * Har biri o'z kartasini chizsa, birinchi kichik o'zgarishdayoq ikki
 * ekran bir-biridan ajralib ketardi.
 *
 * O'n uchta blok bir xil ramkada turishi kerak: dizaynda ular bir tekis
 * to'rga terilgan va har biri o'z "Yuklanmoqda..." ini chizsa, ekran
 * yuklanish paytida uzuq-yuluq ko'rinardi.
 *
 * `height` berilsa ichki maydon qat'iy balandlikda bo'ladi (diagrammalar
 * uchun: `ResponsiveContainer` ota elementining balandligini talab qiladi).
 * Berilmasa — kontent o'zi qancha bo'lsa shuncha (jadvallar uchun).
 */
const DashboardCard = ({
  title,
  hint,
  action,
  footer,
  isLoading,
  isError,
  isEmpty,
  emptyText = "Bu oy uchun ma'lumot yo'q",
  height,
  bodyClassName = "",
  className = "",
  children,
}) => {
  const state = isLoading ? "loading" : isError ? "error" : isEmpty ? "empty" : "ready";

  return (
    <div
      className={cn(
        // `ring` — soyasiz chegara: dashboardda 18 ta karta yonma-yon
        // turadi va soya berilsa ekran "iflos" bo'lib ketardi
        "flex flex-col rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">
            {title}
          </h3>
          {hint && (
            <p className="mt-1 text-[11px] font-normal normal-case leading-snug text-gray-400">
              {hint}
            </p>
          )}
        </div>
        {action}
      </div>

      <div
        className={cn("mt-4 flex-1", bodyClassName)}
        style={height ? { height } : undefined}
      >
        {state === "loading" && (
          <div className="flex h-full min-h-24 items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        )}

        {state === "error" && (
          <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-gray-400">
            <AlertCircle className="size-6" />
            <p className="text-sm">Ma'lumotni yuklab bo'lmadi</p>
          </div>
        )}

        {state === "empty" && (
          <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-gray-400">
            <Inbox className="size-6" />
            <p className="text-sm">{emptyText}</p>
          </div>
        )}

        {state === "ready" && children}
      </div>

      {state === "ready" && footer}
    </div>
  );
};

export default DashboardCard;
