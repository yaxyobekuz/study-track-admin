// Toast
import { toast } from "sonner";

// React
import { useCallback, useMemo, useState } from "react";

// Icons
import { Check, CloudDownload, Eraser, Eye, Save, Table2 } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import DistributionGrid from "../components/DistributionGrid";
import SubjectSplitRows from "../components/SubjectSplitRows";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import usePermissions from "@/shared/hooks/usePermissions";
import useDistributionSheet from "../hooks/useDistributionSheet";

// Reference data — TIZIMNING O'ZIDAN
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import { useQuery } from "@tanstack/react-query";
import { plannerQueries, usePlannerDistribution } from "../queries/planner.queries";
import { useSaveDistribution, useSavePlannerLoad } from "../queries/planner.mutations";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

/**
 * "DARS TAQSIMOTI" TABI.
 *
 * Ustunlar — TIZIMDAGI sinflar, qatorlar — TIZIMDAGI fanlar, o'quvchi soni
 * ham tizimdan. Varaq faqat KATAK QIYMATLARINI saqlaydi, ya'ni sinf nomi
 * o'zgarsa yoki yangi fan qo'shilsa jadval o'zi yangilanadi va kiritilgan
 * soatlar joyida qoladi (ular id ga bog'langan).
 *
 * VARAQNI SAQLASH IKKI QAVATLI:
 *   1. localStorage — DOIMIY va avtomatik, FILIALGA bog'langan kalit bilan.
 *   2. Server — IXTIYORIY, faqat "Saqlash" tugmasi bosilganda.
 *
 * ⚠️ FAN QATORI OSTIDAGI TAQSIMOT esa boshqacha: u to'g'ridan-to'g'ri
 * SERVERGA yoziladi ("Asosiy" tabdagi yuklama jadvaliga). Ataylab: varaqdagi
 * raqam — TALAB ("5-A da matematikadan 4 soat"), taqsimot esa "kim beradi"
 * degan javob va u jadval shakllantirishning haqiqiy kirimi. Brauzer
 * xotirasida qolsa, generator uni ko'rmasdi.
 */
const PlannerDistributionPage = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const canSaveToServer = can("planner.distribution");

  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  // Faqat FAOL sinf va fanlar: nofaoli jadvalni behuda kengaytiradi.
  const columns = useMemo(
    () => classes.filter((c) => c.isActive !== false),
    [classes],
  );
  const rows = useMemo(
    () => subjects.filter((s) => s.isActive !== false),
    [subjects],
  );

  const sheetState = useDistributionSheet({
    branchId: user?.branch?.id ?? null,
    columns,
    rows,
  });
  const {
    sheet,
    totals,
    visibleColumns,
    visibleRows,
    dirtyForServer,
    markSaved,
  } = sheetState;

  const { data: serverCopy } = usePlannerDistribution();
  const { mutate: saveToServer, isPending: isSaving } = useSaveDistribution();

  const [editStructure, setEditStructure] = useState(false);
  const [active, setActive] = useState(null);
  // Ochiq fan qatori — BITTA. Ikkitasi ochiq bo'lsa jadval "sig'adigan bitta
  // sahifa" bo'lishdan to'xtardi va qaysi taqsimot qaysi fanniki ekani
  // chalkashardi.
  const [expandedRow, setExpandedRow] = useState(null);

  // Yuklama faqat KERAK BO'LGANDA so'raladi: varaqni to'ldirish uchun bu
  // ma'lumot kerak emas, u esa beshta jadvalni o'qiydi.
  const { data: loads, isLoading: loadsLoading } = useQuery({
    ...plannerQueries.loads(),
    enabled: Boolean(expandedRow),
  });

  const { mutateAsync: savePlannerLoad } = useSavePlannerLoad();

  const handleSaveSplit = useCallback(
    (payload) =>
      savePlannerLoad(payload).catch((err) => {
        toast.error(
          err.response?.data?.message || "Taqsimotni saqlashda xatolik",
        );
        // Qayta tashlaymiz — panel qoralamani orqaga qaytarishi kerak.
        throw err;
      }),
    [savePlannerLoad],
  );

  const toggleExpanded = useCallback(
    (subjectId) =>
      setExpandedRow((prev) => (prev === subjectId ? null : subjectId)),
    [],
  );

  const hiddenCount = sheet.hiddenColumns.length + sheet.hiddenRows.length;

  const handlePasteReport = ({ applied, skipped, ignored }) => {
    const parts = [`${applied} ta katak to'ldirildi`];
    if (skipped > 0) parts.push(`${skipped} tasi jadvaldan tashqarida qoldi`);
    if (ignored > 0) parts.push(`${ignored} tasi son emasligi uchun tegilmadi`);

    if (skipped > 0 || ignored > 0) toast.warning(parts.join(", "));
    else toast.success(parts[0]);
  };

  const handleSave = () =>
    saveToServer(sheet, {
      onSuccess: () => {
        markSaved();
        toast.success("Varaq serverga saqlandi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Saqlashda xatolik"),
    });

  const handleLoadFromServer = () => {
    if (!serverCopy?.data) return;
    const ok = window.confirm(
      "Serverdagi nusxa yuklansinmi? Bu brauzerdagi joriy varaqni almashtiradi.",
    );
    if (!ok) return;
    sheetState.replaceSheet(serverCopy.data);
    toast.success("Serverdagi nusxa yuklandi");
  };

  const handleClear = () => {
    const ok = window.confirm(
      "Barcha dars soatlari tozalansinmi? Sinf va fan ro'yxati tizimdan keladi, ular tegilmaydi.",
    );
    if (ok) {
      sheetState.clearValues();
      toast.success("Soatlar tozalandi");
    }
  };

  if (classesLoading || subjectsLoading) {
    return <LoaderCard title="Sinf va fanlar yuklanmoqda..." />;
  }

  if (columns.length === 0 || rows.length === 0) {
    return (
      <EmptyState
        icon={Table2}
        title="Jadval qurish uchun ma'lumot yetarli emas"
        description={
          columns.length === 0
            ? "Tizimda faol sinf yo'q — avval \"Sinflar\" bo'limida sinf qo'shing."
            : "Tizimda faol fan yo'q — avval \"Fanlar\" bo'limida fan qo'shing."
        }
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Asboblar paneli — bitta qatorda, jadvalga ko'proq joy qolishi uchun */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-1.5 text-sm">
          <Table2 size={16} strokeWidth={1.5} className="text-gray-400" />
          <span className="text-gray-500">Jami:</span>
          <span className="font-semibold text-gray-900">{totals.grand}</span>
          <span className="text-gray-500">soat ·</span>
          <span className="font-semibold text-gray-900">{totals.students}</span>
          <span className="text-gray-500">o`quvchi ·</span>
          <span className="text-gray-500">
            {visibleRows.length} fan × {visibleColumns.length} sinf
          </span>
        </div>

        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
          <Check size={13} strokeWidth={2} />
          Brauzerda saqlanmoqda
        </span>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Switch checked={editStructure} onChange={setEditStructure} />
          Yashirish rejimi
        </label>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={sheetState.showAll}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs text-amber-800 hover:bg-amber-100"
          >
            <Eye size={13} strokeWidth={2} />
            {hiddenCount} ta yashirilgan — hammasini ko`rsatish
          </button>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {serverCopy?.data && (
            <span className="text-xs text-gray-500">
              Serverda: {formatDateTimeUz(serverCopy.updatedAt)}
            </span>
          )}

          {serverCopy?.data && (
            <Button variant="outline" size="sm" onClick={handleLoadFromServer}>
              <CloudDownload className="size-4" strokeWidth={1.5} />
              Serverdan yuklash
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={handleClear}>
            <Eraser className="size-4" strokeWidth={1.5} />
            Soatlarni tozalash
          </Button>

          {canSaveToServer && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="size-4" strokeWidth={1.5} />
              Saqlash{dirtyForServer ? " *" : ""}
              {isSaving && "..."}
            </Button>
          )}
        </div>
      </div>

      <DistributionGrid
        columns={visibleColumns}
        rows={visibleRows}
        values={sheet.values}
        totals={totals}
        active={active}
        expandedRowId={expandedRow}
        editStructure={editStructure}
        onValueChange={sheetState.setValue}
        onManyValues={sheetState.setManyValues}
        onActiveChange={setActive}
        onToggleExpand={toggleExpanded}
        renderRowPanel={(row) => (
          <SubjectSplitRows
            subject={row}
            columns={visibleColumns}
            values={sheet.values}
            loadRows={loads?.rows ?? []}
            isLoading={loadsLoading}
            canEdit={can("planner.loads")}
            onSave={handleSaveSplit}
            onClose={() => setExpandedRow(null)}
          />
        )}
        onToggleColumn={sheetState.toggleColumn}
        onToggleRow={sheetState.toggleRow}
        onPasteReport={handlePasteReport}
      />
    </div>
  );
};

export default PlannerDistributionPage;
