// Toast
import { toast } from "sonner";

// React
import { useCallback, useEffect, useMemo, useState } from "react";

// Icons
import { Table2 } from "lucide-react";

// Components
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import DistributionGrid from "../components/DistributionGrid";
import SubjectSplitModal from "../components/SubjectSplitModal";
import DistributionToolbar from "../components/DistributionToolbar";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDistributionSheet from "../hooks/useDistributionSheet";

// Reference data — TIZIMNING O'ZIDAN
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import { usePlannerDistribution } from "../queries/planner.queries";
import { useSaveDistribution } from "../queries/planner.mutations";

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
 * ⚠️ FAN NOMI BOSILGANDA OCHILADIGAN TAQSIMOT esa boshqacha: u
 * to'g'ridan-to'g'ri SERVERGA yoziladi ("Asosiy" tabdagi yuklama
 * jadvaliga) — qarang `SubjectSplitModal`. Ataylab: varaqdagi
 * raqam — TALAB ("5-A da matematikadan 4 soat"), taqsimot esa "kim beradi"
 * degan javob va u jadval shakllantirishning haqiqiy kirimi. Brauzer
 * xotirasida qolsa, generator uni ko'rmasdi.
 */
const PlannerDistributionPage = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { openModal } = useModal();
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

  const hiddenCount = sheet.hiddenColumns.length + sheet.hiddenRows.length;

  const handlePasteReport = ({ applied, skipped, ignored }) => {
    const parts = [`${applied} ta katak to'ldirildi`];
    if (skipped > 0) parts.push(`${skipped} tasi jadvaldan tashqarida qoldi`);
    if (ignored > 0) parts.push(`${ignored} tasi son emasligi uchun tegilmadi`);

    if (skipped > 0 || ignored > 0) toast.warning(parts.join(", "));
    else toast.success(parts[0]);
  };

  const handleSave = useCallback(
    () =>
      saveToServer(sheet, {
        onSuccess: () => {
          markSaved();
          toast.success("Varaq serverga saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Saqlashda xatolik"),
      }),
    [saveToServer, sheet, markSaved],
  );

  // ⌘S / Ctrl+S — varaqli ekranlarda odat bo'lgan qisqartma.
  //
  // ⚠️ Brauzerning o'z "sahifani saqlash" oynasi bu yerda faqat xalaqit
  // beradi, shuning uchun hodisa to'xtatiladi. Ruxsat yo'q bo'lsa esa
  // umuman ulanmaydi: to'xtatib qo'yib, evaziga hech narsa qilmaslik —
  // eng yomon variant.
  useEffect(() => {
    if (!canSaveToServer) return;

    const onKeyDown = (event) => {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (!isSaving) handleSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canSaveToServer, isSaving, handleSave]);

  const handleLoadFromServer = () => {
    if (!serverCopy?.data) return;
    sheetState.replaceSheet(serverCopy.data);
    toast.success("Serverdagi nusxa yuklandi");
  };

  const handleClear = () => {
    sheetState.clearValues();
    toast.success("Soatlar tozalandi");
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
      <DistributionToolbar
        totals={totals}
        savedAt={serverCopy?.data ? serverCopy.updatedAt : null}
        isSaving={isSaving}
        dirtyForServer={dirtyForServer}
        canSave={canSaveToServer}
        onSave={handleSave}
        onClear={handleClear}
        hiddenCount={hiddenCount}
        onShowAll={sheetState.showAll}
        editStructure={editStructure}
        onEditStructureChange={setEditStructure}
        hasServerCopy={Boolean(serverCopy?.data)}
        onLoadFromServer={handleLoadFromServer}
      />

      <DistributionGrid
        columns={visibleColumns}
        rows={visibleRows}
        values={sheet.values}
        totals={totals}
        active={active}
        editStructure={editStructure}
        onValueChange={sheetState.setValue}
        onManyValues={sheetState.setManyValues}
        onActiveChange={setActive}
        onOpenSplit={(row) => openModal("plannerSubjectSplit", { subject: row })}
        onToggleColumn={sheetState.toggleColumn}
        onToggleRow={sheetState.toggleRow}
        onPasteReport={handlePasteReport}
      />

      {/* Fan nomi bosilganda ochiladi. Varaq (`values`) localStorage'da
          yashaydi, so'rovda emas — shuning uchun u modal ma'lumotiga emas,
          PROP sifatida beriladi: modal ma'lumoti yopilgandan keyin ham
          saqlanib qolib, eskirgan varaqni ko'rsatardi. */}
      <SubjectSplitModal
        columns={visibleColumns}
        values={sheet.values}
        canEdit={can("planner.loads")}
      />
    </div>
  );
};

export default PlannerDistributionPage;
