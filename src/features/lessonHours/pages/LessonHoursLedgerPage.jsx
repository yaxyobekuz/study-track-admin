// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import { Loader2, Lock, Search, Sheet } from "lucide-react";

// Notifications
import { toast } from "sonner";

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

// Utils
import { downloadBlob } from "@/shared/utils/download.utils";

// Data & queries
import { MODE, SURFACE, T } from "../data/ledger.tokens";
import { lessonHoursAPI } from "../api/lessonHours.api";
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
  const [isExporting, setIsExporting] = useState(false);

  // ⚠️ FILTRLAR BITTA JOYDA — so'rov ham, Excel ham SHU obyektni oladi.
  // Ikki joyda yig'ilsa, biri o'zgarib ikkinchisi eskirardi va fayl
  // ekrandagidan boshqa ro'yxat qaytarardi.
  const params = {
    month,
    ...(type ? { type } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading, isError } = useQuery(lessonHoursQueries.ledger(params));

  /**
   * ⚠️ XATO XABARI BLOB'DAN O'QILADI. So'rov `responseType: "blob"` bilan
   * ketgani uchun server qaytargan JSON xato ham Blob bo'lib keladi va
   * `error.response.data.message` HAR DOIM `undefined` bo'lardi — ya'ni
   * foydalanuvchi haqiqiy sababni hech qachon ko'rmasdi.
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await lessonHoursAPI.exportLedger(params);
      downloadBlob(response, `dars-soatlari_${month}.xlsx`);
    } catch (error) {
      let message = "Faylni yuklab bo'lmadi";
      try {
        const text = await error.response?.data?.text?.();
        if (text) message = JSON.parse(text).message || message;
      } catch {
        // Javob JSON emas — umumiy xabar qoladi
      }
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

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

            {/* Excel — filtrlar YONIDA va bu ataylab: fayl ekrandagi
                ro'yxatning nusxasi, ya'ni u filtr qarorining davomi.
                Ro'yxat bo'sh bo'lsa tugma o'chiriladi. */}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isLoading || !data?.items?.length}
              title="Vedomostni Excel'ga yuklab olish"
              className={cn(
                "flex items-center gap-1.5 rounded-xl bg-white px-3 py-2",
                "text-[11.5px] font-medium text-slate-600 transition-colors duration-200 ease-out-quint",
                "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !isExporting && SURFACE.tileHover,
              )}
            >
              {isExporting ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" strokeWidth={2} />
              ) : (
                <Sheet className="size-3.5 shrink-0 text-emerald-600" strokeWidth={2} />
              )}
              {isExporting ? "Tayyorlanmoqda…" : "Excel"}
            </button>
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
    { key: "kpi", label: MODE.kpi.short },
    { key: "mixed", label: MODE.mixed.short },
    { key: "fixed", label: MODE.fixed.short },
    // "Oyligi yo'q" — dars beradigan-u qoidasi biriktirilmaganlar.
    // Rejim emas, lekin aynan shu kesim bo'yicha ish qilinadi.
    { key: "none", label: MODE.none.short },
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
