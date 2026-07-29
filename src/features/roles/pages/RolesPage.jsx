// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Plus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import RolesList from "@/features/roles/components/RolesList";
import RoleDetailsPanel from "@/features/roles/components/RoleDetailsPanel";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useRoles } from "@/features/roles/queries/roles.queries";

const RolesPage = () => {
  const { openModal } = useModal();

  const [selectedId, setSelectedId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const { data: roles = [], isLoading } = useRoles();

  // Tanlanmagan bo'lsa (yoki tanlangan rol o'chirilsa) — birinchisi
  const selected = roles.find((role) => role.id === selectedId) || roles[0];

  // Saqlanmagan o'zgarish bo'lsa — boshqa rolga o'tishni tasdiqlatamiz
  const handleSelect = (id) => {
    if (id === selected?.id) return;

    if (isDirty) {
      return toast.warning("Saqlanmagan o'zgarishlar bor", {
        description: "Boshqa rolga o'tsangiz, ular bekor qilinadi.",
        action: {
          label: "O'tish",
          onClick: () => {
            setIsDirty(false);
            setSelectedId(id);
          },
        },
      });
    }

    setSelectedId(id);
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="page-title">Rollar</h1>

        <Button onClick={() => openModal("createRole")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi rol
        </Button>
      </div>

      {!selected ? (
        <Card className="py-12 text-center">
          <p className="text-gray-500">Hozircha rollar yo'q</p>
        </Card>
      ) : (
        /* 1-panel — 1/3, 2-panel — 2/3 */
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <RolesList
            roles={roles}
            selectedId={selected.id}
            onSelect={handleSelect}
            className="lg:col-span-1"
          />

          <RoleDetailsPanel
            key={selected.id}
            role={selected}
            onDirtyChange={setIsDirty}
            className="lg:col-span-2"
          />
        </div>
      )}
    </div>
  );
};

export default RolesPage;
