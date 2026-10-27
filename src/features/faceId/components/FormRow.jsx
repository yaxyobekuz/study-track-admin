// Utils
import { cn } from "@/shared/utils/cn";

/**
 * FORMA QATORI — yorliq, izoh va maydon bir joyda.
 *
 * ⚠️ Shared `Field` ISHLATILMAYDI: u shadcn primitivlari ustida va
 * IZOH (`hint`) propini qabul qilmaydi. Bu bo'limda esa izoh deyarli
 * har maydonda SHART — "0.62" raqamining ma'nosini bilmaydigan odam
 * tasodifan 0.95 qo'yib butun maktabni "tanilmadi" holatiga
 * tushirishi mumkin (`faceId.data.js` → `SETTING_FIELDS`).
 *
 * ⚠️ Izoh maydon OSTIDA emas, USTIDA turadi: odam avval nima
 * qilayotganini o'qiydi, keyin kiritadi. Ostida turganda uni faqat
 * xato qilgandan keyin o'qiydi.
 */
const FormRow = ({ label, hint = "", required = false, danger = false, children, className = "" }) => (
  <div className={cn("min-w-0", className)}>
    <p className="mb-1 text-[12.5px] font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </p>

    {hint && (
      <p
        className={cn(
          "mb-1.5 text-[11.5px] leading-snug",
          danger ? "text-amber-700" : "text-gray-500",
        )}
      >
        {hint}
      </p>
    )}

    {children}
  </div>
);

export default FormRow;
