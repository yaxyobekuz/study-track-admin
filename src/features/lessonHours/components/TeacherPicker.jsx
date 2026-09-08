// React
import { useMemo, useState } from "react";

// Icons
import { Check, ChevronDown, Search } from "lucide-react";

// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { CHIP, SURFACE, T } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";

/**
 * O'QITUVCHI TANLAGICH — qidiruvli, guruhlangan.
 *
 * ⚠️ NATIV `<select>` EMAS va bu shu bo'limdagi eng ko'p ta'sir qiladigan
 * qaror. Maktabda 40–200 xodim bor; brauzerning o'z ro'yxati ularni bir xil
 * kulrang qator qilib chiqaradi, qidiruvi yo'q va u OS ga qarab boshqacha
 * ko'rinadi — ya'ni butun ekrandagi yagona "begona" element bo'lib qolardi.
 *
 * ⚠️ IKKI GURUH ATAYLAB: "jadvalda darsi bor" va "darsi yo'q". Ilgari
 * hamma qatorda "0 soat/hafta" turardi va u ekranni yolg'on ma'lumot bilan
 * to'ldirardi ("hech kim ishlamaydimi?"). Aslida savol boshqa: dars
 * ko'chirish uchun DARSI BOR odam kerak. Darsi yo'qlar ro'yxatdan
 * chiqarilmaydi (o'rinbosar sifatida ular ham yaroqli), lekin PASTGA
 * tushadi va so'niq ko'rinadi.
 *
 * ⚠️ QIDIRUV — ism ham, login ham. Bir maktabda ikkita "Malika" bo'lishi
 * odatiy hol, ularni faqat login ajratadi.
 *
 * @param {object} props
 * @param {string} props.value - tanlangan `id`
 * @param {(id: string) => void} props.onChange
 * @param {Array<{id, name, username, weeklyHours}>} props.teachers
 * @param {string} [props.placeholder]
 * @param {string} [props.excludeId] - ro'yxatdan chiqariladigan id
 * @param {boolean} [props.disabled]
 */
const TeacherPicker = ({
  value,
  onChange,
  teachers = [],
  placeholder = "O'qituvchini tanlang",
  excludeId = null,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(
    () => teachers.filter((teacher) => teacher.id !== excludeId),
    [teachers, excludeId],
  );

  const selected = options.find((teacher) => teacher.id === value) ?? null;

  const { withLessons, withoutLessons } = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matched = needle
      ? options.filter(
          (teacher) =>
            teacher.name?.toLowerCase().includes(needle) ||
            teacher.username?.toLowerCase().includes(needle),
        )
      : options;

    return {
      withLessons: matched.filter((teacher) => teacher.weeklyHours > 0),
      withoutLessons: matched.filter((teacher) => !teacher.weeklyHours),
    };
  }, [options, query]);

  const isEmpty = withLessons.length === 0 && withoutLessons.length === 0;

  const pick = (teacher) => {
    onChange?.(teacher.id);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center gap-2.5 rounded-xl bg-slate-50 px-3 text-left",
            "transition-colors duration-200 ease-out-quint",
            disabled
              ? "cursor-not-allowed opacity-55"
              : "hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
            open && "bg-slate-100",
          )}
        >
          {selected ? (
            <>
              <Initials name={selected.name} />
              <span className="min-w-0 flex-1">
                <span className={cn(T.tdName, "block truncate")}>
                  {selected.name}
                </span>
              </span>
              <HoursBadge hours={selected.weeklyHours} />
            </>
          ) : (
            <span className={cn(T.td, "flex-1 truncate text-slate-400")}>
              {placeholder}
            </span>
          )}

          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-slate-400 transition-transform duration-200",
              open && "rotate-180",
            )}
            strokeWidth={2.2}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-2xl border-0 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_44px_-20px_rgba(15,23,42,0.28)]"
      >
        {/* ── Qidiruv ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Search className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ism yoki login"
            className={cn(
              T.td,
              "h-auto w-full border-0 bg-transparent p-0 placeholder:text-slate-400 focus:outline-none focus:ring-0",
            )}
          />
        </div>

        {/* Ajratgich — chiziq, chunki bu ro'yxatning BOSHI. Kartalar
            ichida chiziq chizilmaydi, lekin qidiruv maydoni bilan ro'yxat
            orasida ko'z uchun aniq chegara kerak. */}
        <span className="block h-px bg-slate-100" />

        <div className="max-h-[268px] overflow-y-auto hidden-scrollbar p-1.5">
          {isEmpty && (
            <p className={cn(T.hint, "px-2 py-6 text-center")}>
              Hech kim topilmadi
            </p>
          )}

          {withLessons.length > 0 && (
            <Group label="Dars jadvalida bor">
              {withLessons.map((teacher) => (
                <Option
                  key={teacher.id}
                  teacher={teacher}
                  selected={teacher.id === value}
                  onPick={() => pick(teacher)}
                />
              ))}
            </Group>
          )}

          {withoutLessons.length > 0 && (
            <Group label="Jadvalda darsi yo'q" muted>
              {withoutLessons.map((teacher) => (
                <Option
                  key={teacher.id}
                  teacher={teacher}
                  selected={teacher.id === value}
                  onPick={() => pick(teacher)}
                  muted
                />
              ))}
            </Group>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Group = ({ label, muted, children }) => (
  <div className="mb-1 last:mb-0">
    <div className="flex items-center gap-2 px-2 pb-1 pt-1.5">
      <span className={cn(T.label, muted && "text-slate-300")}>{label}</span>
      <span className={SURFACE.rule} />
    </div>
    {children}
  </div>
);

const Option = ({ teacher, selected, onPick, muted }) => (
  <button
    type="button"
    onClick={onPick}
    className={cn(
      "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left",
      "transition-colors duration-200 ease-out-quint",
      selected ? "bg-indigo-50" : "hover:bg-slate-50",
    )}
  >
    <Initials name={teacher.name} muted={muted} />

    <span className="min-w-0 flex-1">
      <span className={cn(T.tdName, "block truncate", muted && "text-slate-500")}>
        {teacher.name}
      </span>
      {teacher.username && (
        <span className={cn(T.meta, "block truncate")}>@{teacher.username}</span>
      )}
    </span>

    <HoursBadge hours={teacher.weeklyHours} />

    <Check
      className={cn(
        "size-3.5 shrink-0 text-indigo-600",
        selected ? "opacity-100" : "opacity-0",
      )}
      strokeWidth={2.6}
    />
  </button>
);

/**
 * Bosh harflar — surat o'rnida.
 * Rang ISMDAN chiqadi, tasodifiy emas: bir odam har safar bir xil rangda
 * ko'rinishi kerak, aks holda u belgi bo'lib xizmat qilmasdi.
 */
const TONES = [
  "bg-indigo-50 text-indigo-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-800",
  "bg-rose-50 text-rose-700",
  "bg-slate-100 text-slate-600",
];

const Initials = ({ name, muted }) => {
  const text = String(name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const tone = muted
    ? "bg-slate-100 text-slate-400"
    : TONES[(text.charCodeAt(0) || 0) % TONES.length];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-[9px]",
        "text-[10.5px] font-semibold tracking-tight",
        tone,
      )}
    >
      {text || "?"}
    </span>
  );
};

/**
 * Haftalik yuklama.
 *
 * ⚠️ NOL uchun "0 soat" YOZILMAYDI. Bo'sh raqam "bu odam ishlamaydi" deb
 * o'qiladi, aslida esa u shunchaki dars jadvaliga kiritilmagan — ikkalasi
 * butunlay boshqa xabar.
 */
const HoursBadge = ({ hours }) =>
  hours > 0 ? (
    <span className={cn(CHIP, "shrink-0 bg-slate-100 text-slate-600")}>
      {formatHourNumber(hours)}/hafta
    </span>
  ) : (
    <span className={cn(CHIP, "shrink-0 bg-slate-50 text-slate-400")}>
      jadvalsiz
    </span>
  );

export default TeacherPicker;
