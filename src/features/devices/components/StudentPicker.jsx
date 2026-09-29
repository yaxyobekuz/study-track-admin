// React
import { useState } from "react";

// Icons
import { Check, Search, Smartphone } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Input from "@/shared/components/ui/input/Input";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens & queries
import { CHIP, T } from "../data/guard.tokens";
import { devicesQueries } from "../queries/devices.queries";

/**
 * O'QUVCHI TANLAGICH — biriktirish, ochish va siyosat oynalarida.
 *
 * ⚠️ QATORDA "QURILMASI BORMI" VA "QAYSI QOIDA AMALDA" KO'RSATILADI.
 * Tanlayotgan odam aynan shu ikki narsani bilishi kerak: allaqachon
 * qurilmasi bor bolaga yana kod berish yoki shaxsiy istisnosi bor
 * bolaga yana bitta qoida biriktirish — ikkalasi ham keyin qidirib
 * topiladigan chalkashlik bo'lardi.
 *
 * ⚠️ KO'P TANLASH (`multiple`) — vaqtinchalik ochish uchun: "bugun
 * 9-A ga qo'shimcha vaqt". Har o'quvchiga ALOHIDA yozuv yoziladi
 * (server tomonda ham shunday), shuning uchun tanlov oddiy ro'yxat.
 *
 * @param {object} props
 * @param {string[]} props.value - tanlangan o'quvchi id lari
 * @param {(ids: string[]) => void} props.onChange
 * @param {boolean} [props.multiple=false]
 * @param {number} [props.max=200] - server chegarasi bilan AYNI
 */
const StudentPicker = ({ value = [], onChange, multiple = false, max = 200 }) => {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const { data: students = [], isLoading } = useQuery(
    devicesQueries.students({ search: debounced || undefined }),
  );

  const selected = new Set(value);

  const toggle = (id) => {
    if (!multiple) return onChange([id]);
    if (selected.has(id)) return onChange(value.filter((x) => x !== id));
    // ⚠️ Chegara server bilan AYNI: oynada 300 ta tanlab, keyin
    // "ko'pi bilan 200" degan xatoni ko'rish yomon tajriba bo'lardi.
    if (value.length >= max) return;
    onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki login bo'yicha qidiring"
          className="h-9 pl-8 text-[12.5px]"
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl bg-slate-50/80 p-1">
        {isLoading ? (
          <p className="px-3 py-4 text-center text-[12px] text-slate-400">Qidirilmoqda…</p>
        ) : students.length === 0 ? (
          <p className="px-3 py-4 text-center text-[12px] text-slate-400">
            O'quvchi topilmadi
          </p>
        ) : (
          <ul className="space-y-0.5">
            {students.map((student) => {
              const isSelected = selected.has(student.id);
              return (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => toggle(student.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      isSelected ? "bg-white shadow-sm" : "hover:bg-white/70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[5px] ring-1 transition-colors",
                        isSelected
                          ? "bg-slate-900 ring-slate-900"
                          : "bg-white ring-slate-300",
                      )}
                    >
                      {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className={cn(T.tdName, "block truncate")}>
                        {student.firstName} {student.lastName}
                      </span>
                      <span className={cn(T.hint, "block truncate")}>
                        {student.className || "Sinfsiz"}
                        {student.policyName && ` · ${student.policyName}`}
                      </span>
                    </span>

                    {student.deviceCount > 0 && (
                      <span className={cn(CHIP, "shrink-0 bg-emerald-50 text-emerald-700")}>
                        <Smartphone className="size-2.5" strokeWidth={2.4} />
                        {student.deviceCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {multiple && value.length > 0 && (
        <p className={T.hint}>
          {value.length} ta o'quvchi tanlandi
          {value.length >= max && ` — eng ko'pi (${max})`}
        </p>
      )}
    </div>
  );
};

export default StudentPicker;
