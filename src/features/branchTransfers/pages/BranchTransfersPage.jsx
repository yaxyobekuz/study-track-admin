// React
import { useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeftRight, X } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Components
import Button from "@/shared/components/ui/button/Button";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import PeoplePicker from "../components/PeoplePicker";
import ClassPicker from "../components/ClassPicker";
import TransferHistory from "../components/TransferHistory";
import BranchTransferModal from "../components/BranchTransferModal";

// Data
import { TRANSFER_LIMITS, TRANSFER_TABS } from "../data/branchTransfers.data";

/**
 * FILIALLARARO KO'CHIRISH — o'quvchi, xodim (o'qituvchi, tyutor va boshqa
 * barcha xodimlar) va sinf.
 *
 * Manba — DOIM joriy filial: ro'yxat shu filialniki, ko'chirish shu yerdan
 * boshlanadi. Bir yoki bir nechtasi tanlanadi, so'ng oynada ko'rib
 * chiqiladi va tasdiqlanadi (`BranchTransferModal`).
 */
const BranchTransfersPage = () => {
  const { can } = usePermissions();
  const { branch } = useBranch();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = TRANSFER_TABS.filter((tab) => can(tab.permission));
  const tabParam = searchParams.get("tab");
  const active = tabs.find((t) => t.value === tabParam) ?? tabs[0];

  // Tanlov tab bo'yicha alohida: o'quvchilar va xodimlar aralashmaydi
  const [selection, setSelection] = useState(() => ({ student: new Map(), staff: new Map(), class: new Map() }));
  const kind = active?.kind;
  const selected = kind ? selection[kind] : new Map();

  const change = (rows, checked) =>
    setSelection((prev) => {
      const next = new Map(prev[kind]);
      for (const row of rows) {
        if (checked) next.set(row.id, row.label);
        else next.delete(row.id);
      }
      if (next.size > TRANSFER_LIMITS[kind]) {
        toast.warning(`Bir martada ko'pi bilan ${TRANSFER_LIMITS[kind]} ta`);
        return prev;
      }
      return { ...prev, [kind]: next };
    });

  const clear = () => setSelection((prev) => ({ ...prev, [kind]: new Map() }));

  const openTransfer = () =>
    openModal("branchTransfer", {
      kind,
      items: [...selected].map(([id, label]) => ({ id, label })),
      onDone: clear,
    });

  if (!active) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Filiallararo ko'chirish</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          "{branch?.name}" filialidan boshqa filialga — tarix shu filialda qoladi, odam o'z logini,
          tarifi va qoldiqlari bilan ko'chadi
        </p>
      </div>

      <TabsButtons
        items={tabs.map((t) => ({ value: t.value, label: t.label }))}
        value={active.value}
        onChange={(value) => setSearchParams({ tab: value }, { replace: true })}
      />

      {kind && selected.size > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 backdrop-blur">
          <span className="text-sm font-medium text-gray-900">{selected.size} ta tanlandi</span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={openTransfer}>
              <ArrowLeftRight className="size-4" />
              Boshqa filialga ko'chirish
            </Button>
            <Button size="icon" variant="ghost" onClick={clear} aria-label="Tanlovni tozalash">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {kind === "student" && <PeoplePicker kind="student" selected={selected} onChange={change} />}
      {kind === "staff" && <PeoplePicker kind="staff" selected={selected} onChange={change} />}
      {kind === "class" && <ClassPicker selected={selected} onChange={change} />}
      {active.value === "history" && <TransferHistory />}

      <BranchTransferModal />
    </div>
  );
};

export default BranchTransfersPage;
