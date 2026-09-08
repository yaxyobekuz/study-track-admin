// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import { Lock, Search } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import LedgerTable from "../components/LedgerTable";
import TeacherHoursModal from "../components/TeacherHoursModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { MODE, SURFACE, T } from "../data/ledger.tokens";
import { lessonHoursQueries } from "../queries/lessonHours.queries";

/**
 * VEDOMOST — oy yakunidagi asosiy ekran.
 *
 * ⚠️ FILTR SERVERGA YUBORILADI, ro'yxat mijozda kesilmaydi: jami raqam
 * ham filtrga MOS bo'lishi kerak. "5 ta soatbay xodim ko'rinib turibdi,
 * lekin jami 38 ta xodimniki" — bu tushuntirib bo'lmas holat.
 */
const LessonHoursLedgerPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal("teacherHours");

  // Oy va filtr sloti layoutdan keladi (`LessonHoursLayout`): tablar,
  // filtrlar va oy tanlagich BITTA qatorda turishi uchun.
  const { month, filterSlot } = useOutletContext() ?? {};

  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery(
    lessonHoursQueries.ledger({
      month,
      ...(type ? { type } : {}),
      ...(search ? { search } : {}),
    }),
  );

  if (!can("payroll.hours")) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Vedomostni ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Filtrlar — LAYOUTDAGI tablar qatoriga portal orqali ──
          Alohida qator ochilsa, ekranning yuqorisidan yana bitta satr
          ketardi va vedomost pastroqdan boshlanardi. */}
      {filterSlot &&
        createPortal(
          <>
            <ModeFilter value={type} onChange={setType} />

            <label
              className={cn(
                "flex items-center gap-2 rounded-xl bg-white px-3 py-2",
                "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
              )}
            >
              <Search className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ism yoki login"
                className={cn(
                  T.td,
                  "h-auto w-[140px] border-0 bg-transparent p-0 placeholder:text-slate-400 focus:outline-none focus:ring-0",
                )}
              />
            </label>
          </>,
          filterSlot,
        )}

      <LedgerTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        onSelect={(row) => openModal("teacherHours", { staffId: row.staffId, month })}
      />

      <TeacherHoursModal />
    </div>
  );
};

/**
 * REJIM FILTRI — segmentli tugma.
 *
 * ⚠️ `<select>` EMAS. Variantlar uchta va ular ekranning asosiy kesimi;
 * ochiladigan ro'yxat har safar ikki bosish talab qilardi va joriy
 * tanlovni ham yashirardi.
 */
const ModeFilter = ({ value, onChange }) => {
  const options = [
    { key: "", label: "Barchasi" },
    { key: "hourly", label: MODE.hourly.short },
    { key: "mixed", label: MODE.mixed.short },
    { key: "fixed", label: MODE.fixed.short },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl bg-white p-1",
        "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
      )}
    >
      {options.map((option) => (
        <button
          key={option.key || "all"}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-200 ease-out-quint",
            value === option.key
              ? "bg-slate-900 text-white"
              : cn("text-slate-500", SURFACE.tileHover),
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default LessonHoursLedgerPage;
