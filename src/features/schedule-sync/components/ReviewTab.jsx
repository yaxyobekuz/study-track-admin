// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeftRight, Check, FileSpreadsheet, X } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import {
  PayrollImpact,
  RemovedClasses,
  SlotTable,
  SubstitutionImpact,
  TodayImpact,
} from "./ImpactPanels";
import ReviewMappingProblems from "./ReviewMappingProblems";
import RevisionSummary from "./RevisionSummary";
import AckChecklist from "./AckChecklist";
import CheckButton from "./CheckButton";
import { DiffSection } from "./DiffView";
import IssueList from "./IssueList";
import LoadError from "./LoadError";
import Notice from "./Notice";

// Hooks, queries, helpers & data
import useAcknowledgements from "../hooks/useAcknowledgements";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { useApplyRevision } from "../queries/scheduleSync.mutations";
import {
  allAcknowledged,
  isDiffUnknown,
  notifySyncError,
} from "../helpers/scheduleSync.helpers";
import { DIFF_UNKNOWN_TEXT } from "../data/scheduleSync.data";

/**
 * Ko'rinishning o'zi. Ko'rinish (xeshlar) o'zgarganda `key` orqali qayta
 * chiziladi — belgilangan ogohlantirishlar ESKI ko'rinishga tegishli edi
 * va yangisiga o'tib ketmasligi kerak.
 *
 * `isRefreshing` — ko'rinish qayta o'qilmoqda (masalan moslash saqlangach):
 * ekrandagi xeshlar eskirgan bo'lishi mumkin, "Qo'llash" kutadi.
 */
const ReviewBody = ({ review, status, isRefreshing, onOpenSwitch, onOpenReject }) => {
  const acks = useAcknowledgements();
  const [serverErrors, setServerErrors] = useState([]);
  const { mutate: apply, isPending } = useApplyRevision();

  const isSheet = review.mode === "sheet";
  const requiredAcks = acks.listFor(review.requiredAcks ?? []);
  const isAcked = allAcknowledged(requiredAcks, acks.acked);
  const canEditMappings = Boolean(status.can?.review || status.can?.source);
  // Farq hisoblanmagan (xato yoki eski tahrir) — "farq yo'q" EMAS
  const diffUnknown = isDiffUnknown(review);
  const canApply = review.canApply && !diffUnknown;

  const handleApply = () => {
    setServerErrors([]);
    apply(
      {
        id: review.revision.id,
        activeHash: review.activeHash,
        newHash: review.newHash,
        acknowledged: acks.acknowledged,
      },
      {
        onSuccess: () => toast.success("O'zgarish qo'llandi — jadval yangilandi"),
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
      <RevisionSummary revision={review.revision} />

      {!diffUnknown && review.hasChanges === false && (
        <Notice tone="success" title="Amaldagi jadval bilan farq yo'q" />
      )}

      <IssueList
        items={serverErrors}
        tone="danger"
        title="Qo'llashda aniqlangan xatolar"
      />

      <IssueList
        items={review.errors ?? []}
        tone="danger"
        title="Xatolar"
        description="Tuzatilmaguncha o'zgarishni qo'llab bo'lmaydi. Sheet'ni tuzatib qayta tekshiring yoki nomlarni moslang."
      />

      <ReviewMappingProblems
        resolution={review.resolution}
        canEdit={canEditMappings}
      />

      <SlotTable slots={review.slots ?? []} />

      <IssueList
        items={review.warnings ?? []}
        tone="warning"
        title="Ogohlantirishlar"
      />

      <RemovedClasses items={review.removedClasses ?? []} />
      <TodayImpact impact={review.todayImpact} />
      <PayrollImpact rows={review.payrollImpact ?? []} />
      <SubstitutionImpact rows={review.substitutionImpact ?? []} />

      <DiffSection
        view={review}
        unknownText={
          review.isLatest === false ? DIFF_UNKNOWN_TEXT.old : DIFF_UNKNOWN_TEXT.errors
        }
      />

      {/* Qaror */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">Qaror</h2>

        {isSheet ? (
          <p className="text-sm text-gray-600">
            Qo'llansa amaldagi jadval sheet'dagi holat bilan almashtiriladi.
            Hozirgi jadval "Versiyalar" ga saqlanadi — kerak bo'lsa tiklash
            mumkin.
          </p>
        ) : (
          <Notice tone="info" title="Hozir jadval platformada boshqariladi">
            O'zgarish "Manbani almashtirish" orqali amalga kiradi: platformadagi
            jadval arxivga saqlanadi (o'chmaydi) va sheet'dagi jadval qo'llanadi.
            {review.canSwitch
              ? " Hozir almashtirish mumkin."
              : " Pastdagi sabablar bartaraf etilgach almashtirish mumkin bo'ladi."}
          </Notice>
        )}

        <IssueList
          items={review.blockers ?? []}
          tone="warning"
          title={isSheet ? "Nega hozir qo'llab bo'lmaydi" : "Nega hozir almashtirib bo'lmaydi"}
        />

        {isSheet && (
          <AckChecklist
            acks={requiredAcks}
            acked={acks.acked}
            missing={acks.missing}
            onToggle={acks.toggle}
            disabled={!canApply || isPending}
          />
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-3.5 xs:flex-row xs:flex-wrap xs:items-center xs:justify-end">
          {isSheet && canApply && !isAcked && (
            <p className="text-xs text-gray-500 xs:mr-auto">
              Avval barcha ogohlantirishlarni belgilang
            </p>
          )}

          {review.canReject && (
            <Button
              variant="outline"
              onClick={() => onOpenReject(review.revision.id)}
              disabled={isPending}
            >
              <X className="size-4" strokeWidth={1.5} />
              Rad etish
            </Button>
          )}

          {isSheet && status.can?.review && (
            <ConfirmPopover
              title="O'zgarish qo'llansinmi?"
              description="Amaldagi jadval sheet'dagi holat bilan almashtiriladi. Hozirgi holat versiyalarga saqlanadi."
              confirmLabel="Qo'llash"
              onConfirm={handleApply}
            >
              <Button disabled={!canApply || !isAcked || isPending || isRefreshing}>
                <Check className="size-4" strokeWidth={1.5} />
                Qo'llash{isPending && "..."}
              </Button>
            </ConfirmPopover>
          )}

          {!isSheet && status.can?.source && (
            <Button onClick={onOpenSwitch}>
              <ArrowLeftRight className="size-4" strokeWidth={1.5} />
              Manbani almashtirish
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * "O'zgarishlar" tabi — oxirgi o'qilgan holat va uni qo'llash.
 *
 * @param {object} props
 * @param {object} props.status - `Status`
 * @param {() => void} props.onOpenSwitch
 * @param {(revisionId: string) => void} props.onOpenReject
 */
const ReviewTab = ({ status, onOpenSwitch, onOpenReject }) => {
  const latestId = status.latestRevision?.id ?? null;
  const {
    data: review,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery(scheduleSyncQueries.revision(latestId));

  if (!latestId) {
    return (
      <Card>
        <EmptyState
          icon={FileSpreadsheet}
          title="Sheet hali o'qilmagan"
          description={
            status.sheetUrl
              ? "\"Tekshirish\" ni bosing — sheet o'qiladi va amaldagi jadval bilan farqi shu yerda chiqadi."
              : "Avval \"Holat\" bo'limida sheet havolasini sozlang."
          }
          action={<CheckButton status={status} />}
        />
      </Card>
    );
  }

  if (isLoading) return <LoaderCard title="O'zgarishlar yuklanmoqda..." />;

  if (isError || !review) {
    return <LoadError title="O'zgarishlarni yuklab bo'lmadi" onRetry={refetch} />;
  }

  return (
    <ReviewBody
      key={`${review.revision?.id}:${review.activeHash}:${review.newHash}`}
      review={review}
      status={status}
      isRefreshing={isFetching}
      onOpenSwitch={onOpenSwitch}
      onOpenReject={onOpenReject}
    />
  );
};

export default ReviewTab;
