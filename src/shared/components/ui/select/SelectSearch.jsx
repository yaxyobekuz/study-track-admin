/**
 * QIDIRUVLI TANLAGICH.
 *
 * ⚠️ `inline` REJIMI — MODAL ICHIDA MAJBURIY.
 *
 * Sukut bo'yicha ro'yxat Radix `Popover` da, ya'ni `document.body` ga
 * PORTALLANADI. Radix `Dialog` esa sahifa aylanishini `react-remove-scroll`
 * bilan qulflaydi va faqat BITTA DOM shoxiga ruxsat beradi:
 * `shards: [contentRef]` — dialog kontentining o'zi. Portalga chiqarilgan
 * ro'yxat o'sha shoxdan tashqarida qoladi, natijada u KO'RINADI va
 * BOSILADI, lekin g'ildirak bilan AYLANMAYDI: `max-h-[300px]` dan
 * keyingi variantlarga umuman yetib bo'lmaydi.
 *
 * `inline` da ro'yxat oddiy oqim elementi sifatida tugmaning tagida
 * chiziladi — dialog kontentining ichida bo'lgani uchun aylanish ishlaydi,
 * mobil `Drawer` da ham xuddi shunday.
 *
 * Sahifada (modaldan tashqarida) qulf yo'q, shuning uchun u yerda portalli
 * rejim o'zgarishsiz qoladi: u kontentni pastga surmaydi.
 */

// React
import { useEffect, useRef, useState } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "../button/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/shared/components/shadcn/command";

// Hooks
import useSound from "@/shared/hooks/useSound";

// Icons
import { Check, ChevronDown } from "lucide-react";

/**
 * `idValues` rejimidagi qidiruv: faqat YORLIQ bo'yicha (cmdk qiymati id —
 * u qidiruvga aralashsa, hex belgilar tasodifiy mos kelib qolardi).
 */
const filterByLabel = (value, search, keywords = []) =>
  keywords.join(" ").toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0;

/**
 * @param {boolean} [props.idValues] - cmdk elementining qiymati `option.value`
 *   (id) bo'ladi. ⚠️ Sukut bo'yicha qiymat — YORLIQ, ya'ni yorlig'i bir xil
 *   ikki variant (adash o'qituvchilar) cmdk uchun BITTA element bo'lib
 *   qolardi. Qidiruv baribir yorliq bo'yicha ishlaydi (`keywords`).
 */
const SelectSearch = ({
  value,
  onChange,
  options = [],
  isLoading = false,
  inline = false,
  idValues = false,
  playClickSound = true,
  triggerClassName = "",
  searchPlaceholder = "Qidirish...",
  emptyText = "Hech narsa topilmadi",
  ...props
}) => {
  const { playSound } = useSound();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find((o) => o.value === value);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    playClickSound && playSound("notification-pop");
  };

  const handleChange = (option) => {
    setOpen(false);
    playClickSound && playSound("notification-pop");
    onChange?.(option.value === value ? "" : option.value);
  };

  // Oqim ichidagi ro'yxat o'z-o'zidan yopilmaydi (portal qatlami buni tekin
  // beradi), shuning uchun tashqariga bosish va `Escape` qo'lda ulanadi.
  useEffect(() => {
    if (!inline || !open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [inline, open]);

  const trigger = (
    <Button
      type="button"
      variant="outline"
      playClickSound={false}
      disabled={props.disabled || isLoading}
      className="justify-between font-normal px-3 hover:bg-white"
      {...(inline ? { onClick: () => handleOpenChange(!open) } : {})}
    >
      <span
        className={cn(
          "line-clamp-1",
          selectedOption?.label ? "text-black" : "text-gray-500",
        )}
      >
        {selectedOption?.label || props.placeholder}
      </span>
      <ChevronDown className="size-4 shrink-0 opacity-50" />
    </Button>
  );

  const list = (
    <Command filter={idValues ? filterByLabel : undefined}>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={idValues ? String(option.value) : option.label}
              keywords={idValues ? [String(option.label)] : undefined}
              onSelect={() => handleChange(option)}
              className="flex items-center justify-between gap-1.5"
            >
              {option.label}
              <Check
                className={cn(
                  "size-4 text-primary shrink-0",
                  value === option.value ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  // ── Modal ichidagi shakl: portalsiz, oqim ichida ──────────────
  if (inline) {
    return (
      <div ref={rootRef} className={cn("relative", props.className)}>
        <div className={triggerClassName}>{trigger}</div>

        {open && (
          <div className="mt-1.5 overflow-hidden rounded-xl border bg-white shadow-lg">
            {list}
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover
      open={open}
      className={cn(props.className)}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild className={triggerClassName}>
        {trigger}
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        {list}
      </PopoverContent>
    </Popover>
  );
};

export default SelectSearch;
