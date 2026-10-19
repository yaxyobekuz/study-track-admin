// React
import { useEffect, useMemo, useRef, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Check, Loader2, Search, X } from "lucide-react";

// Components
import Input from "@/shared/components/ui/input/Input";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { certificatesQueries } from "../queries/certificates.queries";

/** Qidiruv serverga yuborilishidan oldingi kutish (ms). */
const DEBOUNCE_MS = 350;

/**
 * O'QUVCHI TANLAGICHI — qidiruv bilan.
 *
 * ⚠️ Modulning O'Z yo'lidan o'qiydi (`/certificates/students`,
 * `certificates.manage`), `users.view` TALAB QILMAYDI: sertifikat rejasini
 * kiritadigan xodimga butun foydalanuvchilar bo'limini ochib berish kerak
 * emas.
 *
 * ⚠️ Bo'sh qidiruvda so'rov YUBORILMAYDI (`enabled`): butun maktab
 * ro'yxatini tortib kelish ham sekin, ham keraksiz. Taklif qilingan
 * nomzodlar (`suggestions`) esa SERVERDAN importda allaqachon kelgan va
 * qidiruvsiz ko'rinadi.
 *
 * @param {object} props
 * @param {{id: string, fullName: string, classNames?: string[]}|null} props.value
 * @param {(student: object|null) => void} props.onChange
 * @param {Array} [props.suggestions] - import taklif qilgan nomzodlar
 * @param {string} [props.defaultSearch] - fayldagi xom ism
 * @param {string} [props.classId] - fayldagi guruhga mos sinf (qidiruv doirasi)
 * @param {string} [props.placeholder]
 */
const StudentPicker = ({
  value,
  onChange,
  suggestions = [],
  defaultSearch = "",
  classId = null,
  placeholder = "Ism yoki familiya",
}) => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Tashqariga bosilganda yopiladi — ro'yxat jadval katagida turadi va
  // ochiq qolsa qo'shni qatorlarni to'sib qo'yardi
  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const { data: found = [], isFetching } = useQuery(
    certificatesQueries.students({ search: debounced, classId: null }),
  );

  const options = useMemo(() => {
    const seen = new Set();
    const list = [];

    // Takliflar birinchi — ular SERVER hisoblagan o'xshashlik bo'yicha
    for (const item of debounced ? [] : suggestions) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      list.push(item);
    }
    for (const item of found) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      list.push(item);
    }

    return list;
  }, [suggestions, found, debounced]);

  const pick = (student) => {
    onChange(student);
    setOpen(false);
    setSearch("");
  };

  if (value) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
          <Check className="size-3.5 shrink-0" strokeWidth={2} />
          <span className="truncate font-medium">{value.fullName}</span>
          {value.classNames?.length > 0 && (
            <span className="shrink-0 text-emerald-600">
              · {value.classNames.join(", ")}
            </span>
          )}
        </span>

        <button
          type="button"
          onClick={() => onChange(null)}
          title="Tanlovni olib tashlash"
          className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative min-w-52">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400"
          strokeWidth={1.75}
        />
        <Input
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          placeholder={defaultSearch || placeholder}
          className="h-9 pl-8 text-xs"
        />
        {isFetching && (
          <Loader2
            className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-gray-400"
            strokeWidth={2}
          />
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 max-h-56 w-full min-w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          {options.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-gray-500">
              {debounced
                ? "O'quvchi topilmadi"
                : "Ism yoki familiyani yozing"}
            </p>
          ) : (
            options.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => pick(student)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                  "hover:bg-gray-50",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-900">
                    {student.fullName}
                  </span>
                  {student.classNames?.length > 0 && (
                    <span className="block truncate text-gray-500">
                      {student.classNames.join(", ")}
                    </span>
                  )}
                </span>

                {typeof student.score === "number" && (
                  <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                    {student.score}%
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPicker;
