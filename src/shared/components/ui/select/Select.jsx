// Utils
import { cn } from "@/shared/utils/cn";

// Components
import {
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
  Select as SelectWrapper,
} from "@/shared/components/shadcn/select";

// Hooks
import useSound from "@/shared/hooks/useSound";

/**
 * Radix `SelectItem` BO'SH SATRNI qabul qilmaydi.
 *
 * `""` — Radix uchun zaxiralangan qiymat: u "tanlovni tozala va
 * placeholder'ni ko'rsat" degani. Uni VARIANT sifatida berish xato
 * tashlaydi va butun sahifa oq bo'lib qoladi (React render'ni to'xtatadi).
 *
 * Kodbazada esa "Barchasi" / "Tanlanmagan" varianti hamma joyda `value: ""`
 * bilan yoziladi — filtr bo'sh bo'lsa so'rovga parametr qo'shilmaydi degani.
 * Har bir sahifada o'z sentinel'ini o'ylab topish o'rniga almashtirish SHU
 * YERDA, bir marta bajariladi: tashqariga baribir `""` chiqadi, ya'ni
 * chaqiruvchi kodning birortasi o'zgarmaydi.
 */
const EMPTY_VALUE = "__empty__";
const toInner = (value) => (value === "" ? EMPTY_VALUE : value);
const toOuter = (value) => (value === EMPTY_VALUE ? "" : value);

/**
 * ⚠️ ALMASHTIRISH FAQAT `""` VARIANTI BOR RO'YXATDA.
 *
 * Filtrlarda `""` haqiqiy variant ("Barcha xonalar") va u `__empty__`
 * bo'lib ro'yxatga tushadi — almashtirish shu yerda kerak.
 *
 * FORMALARDA esa bunday variant YO'Q: `""` "hali tanlanmagan" degani.
 * Uni `__empty__` ga aylantirsak, Radix mos variantni topolmay trigger'ni
 * BO'SH ko'rsatadi — placeholder ham, tanlangan qiymat ham chiqmaydi va
 * foydalanuvchi tanlagich umuman ishlamayapti deb o'ylaydi.
 * Radix placeholder'ni faqat `undefined` da ko'rsatadi, shuning uchun
 * bunday holatda qiymat almashtirilmaydi.
 */
const resolveValue = (value, options) => {
  if (value === undefined) return undefined;
  if (value !== "") return value;

  return options.some((opt) => opt.value === "") ? EMPTY_VALUE : undefined;
};

const Select = ({
  onChange,
  onOpenChange,
  options = [],
  isLoading = false,
  triggerClassName = "",
  value,
  ...props
}) => {
  const { playSound } = useSound();
  const handleChange = (e) => onChange?.(toOuter(e));

  const handleOpenChange = (e) => {
    onOpenChange?.(e);
    playSound("notification-pop");
  };

  return (
    <SelectWrapper
      id={props.id || props.name}
      onValueChange={handleChange}
      name={props.name || props.id}
      onOpenChange={handleOpenChange}
      {...props}
      // Spread'dan KEYIN: boshqarilayotgan qiymat ham almashtirilishi shart,
      // aks holda tanlangan variant trigger'da ko'rinmay qolardi
      value={resolveValue(value, options)}
    >
      {/* Trigger */}
      <SelectTrigger
        className={cn(
          "h-10 bg-white text-base outline-2 outline-primary md:text-sm",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>

      {/* Content */}
      <SelectContent>
        {/* Options */}
        {!isLoading &&
          options.map((opt) => {
            const itemValue = toInner(opt.value);

            return (
              <SelectItem
                key={itemValue}
                value={itemValue}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            );
          })}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-20">
            <div className="size-5 border-2 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </SelectContent>
    </SelectWrapper>
  );
};

export default Select;
