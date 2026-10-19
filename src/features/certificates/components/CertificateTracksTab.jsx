// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Archive, ArchiveRestore, Layers, Pencil, Plus } from "lucide-react";

// Toast
import { toast } from "sonner";

// Components
import Card from "@/shared/components/ui/Card";
import Badge from "@/shared/components/ui/badge/Badge";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Queries
import { certificatesQueries } from "../queries/certificates.queries";
import { useUpdateCertificateTrack } from "../queries/certificates.mutations";

/**
 * YO'NALISHLAR KATALOGI TABI.
 *
 * ⚠️ O'CHIRILMAYDI — ARXIVLANADI: yo'nalishga o'tgan rejalar ishora qiladi
 * (bazada ham `onDelete: Restrict`). Faol rejasi bor yo'nalishni arxivlab
 * ham bo'lmaydi — server rad etadi, aks holda u statistikadan va o'quvchi
 * ekranidan jimgina tushib qolardi.
 *
 * ⚠️ "Fan" ustuni — MAVZU PROGRESSINING manbai. Bog'lanmagan yo'nalishda
 * progress o'rniga sababi ko'rinadi.
 */
const CertificateTracksTab = ({ canManage }) => {
  const { openModal } = useModal();
  const { data: tracks = [], isLoading } = useQuery(
    certificatesQueries.tracks({ archived: true, usage: true }),
  );
  const { mutateAsync: updateTrack, isPending } = useUpdateCertificateTrack();

  const toggleArchive = async (track) => {
    try {
      await updateTrack({ id: track.id, isActive: !track.isActive });
      toast.success(track.isActive ? "Yo'nalish arxivlandi" : "Yo'nalish qaytarildi");
    } catch (error) {
      toast.error(error.response?.data?.message || "Amalni bajarib bo'lmadi");
    }
  };

  if (isLoading && tracks.length === 0) {
    return <LoaderCard title="Yo'nalishlar yuklanmoqda..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Yo'nalish maktab fani bo'lishi shart emas — IELTS, CEFR va SAT ham
          shu ro'yxatda turadi.
        </p>

        {canManage && (
          <Button size="sm" onClick={() => openModal("certificateTrack")}>
            <Plus className="size-4" strokeWidth={2} />
            Yo'nalish qo'shish
          </Button>
        )}
      </div>

      {tracks.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title="Yo'nalish yo'q"
            description="Fayldan yuklashda yo'nalishlar avtomatik yaratiladi, yoki qo'lda qo'shing."
          />
        </Card>
      ) : (
        <Table
          columns={[
            "Yo'nalish",
            "Maktab fani",
            { label: "Faol rejalar", align: "right" },
            "Holat",
            ...(canManage ? [{ label: "", align: "right" }] : []),
          ]}
        >
          {tracks.map((track) => (
            <Tr key={track.id} className={track.isActive ? "" : "bg-gray-50/60"}>
              <Td className="font-medium text-gray-900">{track.name}</Td>

              <Td>
                {track.subject ? (
                  track.subject.name
                ) : (
                  <span className="text-gray-400">Bog'lanmagan</span>
                )}
              </Td>

              <Td align="right">{track.activePlans ?? "—"}</Td>

              <Td>
                <Badge variant={track.isActive ? "default" : "outline"}>
                  {track.isActive ? "Faol" : "Arxivlangan"}
                </Badge>
              </Td>

              {canManage && (
                <Td align="right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Tahrirlash"
                      onClick={() => openModal("certificateTrack", { track })}
                    >
                      <Pencil className="size-4" strokeWidth={1.75} />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={isPending}
                      title={track.isActive ? "Arxivlash" : "Arxivdan qaytarish"}
                      onClick={() => toggleArchive(track)}
                    >
                      {track.isActive ? (
                        <Archive className="size-4" strokeWidth={1.75} />
                      ) : (
                        <ArchiveRestore className="size-4" strokeWidth={1.75} />
                      )}
                    </Button>
                  </div>
                </Td>
              )}
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default CertificateTracksTab;
