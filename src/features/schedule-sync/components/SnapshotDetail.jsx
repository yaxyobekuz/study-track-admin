// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronLeft, RotateCcw } from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import { InfoList, InfoRow } from "./InfoList";
import SnapshotImpacts from "./SnapshotImpacts";
import AckChecklist from "./AckChecklist";
import { DiffSection } from "./DiffView";
import IssueList from "./IssueList";
import LoadError from "./LoadError";
import Notice from "./Notice";
import Pill from "./Pill";

// Hooks, queries, helpers & data
import useAcknowledgements from "../hooks/useAcknowledgements";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { useRestoreSnapshot } from "../queries/scheduleSync.mutations";
import {
  allAcknowledged,
  isDiffUnknown,
  nameOf,
  notifySyncError,
  snapshotKindLabel,
} from "../helpers/scheduleSync.helpers";
import { DIFF_UNKNOWN_TEXT, MODE_META } from "../data/scheduleSync.data";

/**
 * Versiya ko'rinishi. Xeshlar o'zgarganda `key` orqali qayta chiziladi —
 * belgilangan ogohlantirishlar eski ko'rinishga tegishli edi.
 * `isRefreshing` paytida "Tiklash" kutadi (xeshlar eskirgan bo'lishi mumkin).
 */
const SnapshotBody = ({ view, canSource, isRefreshing }) => {
  const acks = useAcknowledgements();
  const [serverErrors, setServerErrors] = useState([]);
  const { mutate: restore, isPending } = useRestoreSnapshot();

  const snapshot = view.snapshot ?? {};
  const requiredAcks = acks.listFor(view.requiredAcks ?? []);
  const isAcked = allAcknowledged(requiredAcks, acks.acked);
  // Farq hisoblanmagan (buzuq versiya) — "bir xil" EMAS
  const diffUnknown = isDiffUnknown(view);
  const canRestore = view.canRestore && !diffUnknown;

  const handleRestore = () => {
    setServerErrors([]);
    restore(
      {
        id: snapshot.id,
        activeHash: view.activeHash,
        newHash: view.newHash,
        acknowledged: acks.acknowledged,
      },
      {
        onSuccess: () => toast.success("Versiya tiklandi — jadval yangilandi"),
        onError: (err) =>
          notifySyncError(err, {
            onAckRequired: acks.markMissing,
            onValidation: setServerErrors,
          }),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-gray-900">{snapshotKindLabel(snapshot)}</h2>
          {MODE_META[snapshot.mode] && <Pill meta={MODE_META[snapshot.mode]} />}
        </div>

        <InfoList>
          <InfoRow label="Saqlangan">
            {formatDateTimeUz(snapshot.createdAt)} · {nameOf(snapshot.createdBy, "Tizim")}
          </InfoRow>
          <InfoRow label="Tarkibi">
            {snapshot.classCount} ta sinf · {snapshot.lessonCount} ta dars
          </InfoRow>
          {snapshot.note && <InfoRow label="Izoh">{snapshot.note}</InfoRow>}
        </InfoList>
      </Card>

      {!diffUnknown && view.hasChanges === false && (
        <Notice tone="success" title="Bu versiya amaldagi jadval bilan bir xil" />
      )}

      <IssueList items={serverErrors} tone="danger" title="Tiklashda aniqlangan xatolar" />
      <IssueList items={view.warnings ?? []} tone="warning" title="Ogohlantirishlar" />
      <SnapshotImpacts view={view} />

      <DiffSection
        view={view}
        title="Tiklansa nima o'zgaradi"
        unknownText={DIFF_UNKNOWN_TEXT.snapshot}
      />

      {canSource && (
        <Card className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Tiklash</h2>
            <p className="text-sm text-gray-600">
              Amaldagi jadval shu versiya bilan almashtiriladi. Hozirgi holat
              ham "Versiyalar" ga saqlanadi — kerak bo'lsa qaytarish mumkin.
            </p>
          </div>

          <IssueList
            items={view.blockers ?? []}
            tone="warning"
            title="Nega hozir tiklab bo'lmaydi"
          />

          <AckChecklist
            acks={requiredAcks}
            acked={acks.acked}
            missing={acks.missing}
            onToggle={acks.toggle}
            disabled={!canRestore || isPending}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-3.5 xs:flex-row xs:items-center xs:justify-end">
            {canRestore && !isAcked && (
              <p className="text-xs text-gray-500 xs:mr-auto">
                Avval barcha ogohlantirishlarni belgilang
              </p>
            )}

            <ConfirmPopover
              danger
              title="Versiya tiklansinmi?"
              description="Amaldagi jadval shu versiya bilan almashtiriladi. Hozirgi holat versiyalarga saqlanadi."
              confirmLabel="Tiklash"
              onConfirm={handleRestore}
            >
              <Button disabled={!canRestore || !isAcked || isPending || isRefreshing}>
                <RotateCcw className="size-4" strokeWidth={1.5} />
                Tiklash{isPending && "..."}
              </Button>
            </ConfirmPopover>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Bitta versiya: tarkibi, tiklansa nima o'zgarishi va tiklash.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {boolean} props.canSource - `scheduleSync.source`
 * @param {() => void} props.onBack
 */
const SnapshotDetail = ({ id, canSource, onBack }) => {
  const { data: view, isLoading, isError, isFetching, refetch } = useQuery(
    scheduleSyncQueries.snapshot(id),
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="size-4" />
        Versiyalar ro'yxati
      </button>

      {isLoading ? (
        <LoaderCard title="Versiya yuklanmoqda..." />
      ) : isError || !view ? (
        <LoadError title="Versiyani yuklab bo'lmadi" onRetry={refetch} />
      ) : (
        <SnapshotBody
          key={`${view.snapshot?.id}:${view.activeHash}:${view.newHash}`}
          view={view}
          canSource={canSource}
          isRefreshing={isFetching}
        />
      )}
    </div>
  );
};

export default SnapshotDetail;
