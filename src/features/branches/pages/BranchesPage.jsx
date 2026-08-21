// Toast
import { toast } from "sonner";

// Icons
import {
  Building2,
  Pencil,
  Archive,
  ArchiveRestore,
  RefreshCw,
  Plus,
} from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { useBranches } from "@/features/branches/queries/branches.queries";
import {
  useRestoreBranch,
  useRetryBranch,
} from "@/features/branches/queries/branches.mutations";

// Data
import { branchStatus } from "@/features/branches/data/branch.data";

// Components
import Can from "@/shared/components/guards/Can";
import Table from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";

const COLUMNS = [
  "Filial",
  "Kod / baza",
  "Holat",
  { label: "O'quvchi", align: "right" },
  { label: "Xodim", align: "right" },
  { label: "", align: "right" },
];

const BranchesPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { branch: activeBranch } = useBranch();

  // Arxivlanganlar ham ko'rsatiladi: filial o'chirilmaydi, ya'ni "yo'q bo'lib
  // qolgan" filial emas, "yopilgan" filial — u ro'yxatda ko'rinishi kerak.
  const { data: branches = [], isLoading } = useBranches({
    includeArchived: true,
  });

  const { mutate: restoreBranch } = useRestoreBranch();
  const { mutate: retryBranch } = useRetryBranch();

  const handleRestore = (row) =>
    restoreBranch(row.id, {
      onSuccess: () => toast.success(`"${row.name}" arxivdan qaytarildi`),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  const handleRetry = (row) =>
    retryBranch(row.id, {
      onSuccess: () => toast.success("Qayta urinish boshlandi"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Filiallar</h1>

        <Can do="branches.create">
          <Button onClick={() => openModal("createBranch")}>
            <Plus strokeWidth={1.5} />
            Filial qo'shish
          </Button>
        </Can>
      </div>

      {isLoading && <LoaderCard />}

      {!isLoading && branches.length === 0 && (
        <EmptyState
          icon={Building2}
          title="Filial yo'q"
          description="Birinchi filialni qo'shing — unga alohida baza yaratiladi."
        />
      )}

      {!isLoading && branches.length > 0 && (
        <Table columns={COLUMNS}>
          {branches.map((row) => {
            const status = branchStatus(row.status);
            const isActiveBranch = row.id === activeBranch?.id;

            return (
              <tr
                key={row.id}
                className={row.isArchived ? "opacity-60" : undefined}
              >
                {/* Nom */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.name}</span>
                    {row.isDefault && (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                        Asosiy
                      </span>
                    )}
                    {isActiveBranch && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                        Siz shu yerdasiz
                      </span>
                    )}
                    {row.isArchived && (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                        Arxivlangan
                      </span>
                    )}
                  </div>
                  {row.address && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {row.address}
                    </p>
                  )}
                </td>

                {/* Kod va baza */}
                <td className="whitespace-nowrap px-4 py-3">
                  <p className="font-mono text-xs">{row.code}</p>
                  <p className="font-mono text-[11px] text-gray-400">
                    {row.schemaName}
                  </p>
                </td>

                {/* Holat */}
                <td className="whitespace-nowrap px-4 py-3">
                  <Tooltip content={row.provisionError || status.description}>
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </Tooltip>
                  {!row.isActive && !row.isArchived && (
                    <p className="mt-1 text-[11px] text-amber-600">
                      Kirish yopilgan
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-right tabular-nums">
                  {row.counts?.students ?? 0}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.counts?.staff ?? 0}
                </td>

                {/* Amallar */}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {row.status === "failed" && can("branches.create") && (
                      <Tooltip content="Bazani qayta tayyorlash">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleRetry(row)}
                        >
                          <RefreshCw strokeWidth={1.5} />
                        </Button>
                      </Tooltip>
                    )}

                    <Can do="branches.update">
                      <Tooltip content="Tahrirlash">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => openModal("editBranch", row)}
                        >
                          <Pencil strokeWidth={1.5} />
                        </Button>
                      </Tooltip>
                    </Can>

                    <Can do="branches.archive">
                      {row.isArchived ? (
                        <Tooltip content="Arxivdan qaytarish">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => handleRestore(row)}
                          >
                            <ArchiveRestore strokeWidth={1.5} />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Arxivlash">
                          <Button
                            size="icon"
                            variant="secondary"
                            disabled={row.isDefault}
                            onClick={() => openModal("archiveBranch", row)}
                          >
                            <Archive strokeWidth={1.5} />
                          </Button>
                        </Tooltip>
                      )}
                    </Can>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};

export default BranchesPage;
