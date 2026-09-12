// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import { InfoList, InfoRow } from "./InfoList";
import Notice from "./Notice";
import Pill from "./Pill";

// Helpers & data
import { nameOf } from "../helpers/scheduleSync.helpers";
import { REVISION_ATTENTION, REVISION_STATUS } from "../data/scheduleSync.data";

/**
 * O'qilgan holatning qisqa tavsifi: qachon, kim, nima o'qildi va qaror.
 *
 * @param {object} props
 * @param {object} props.revision - `RevisionSummary`
 * @param {string} [props.className]
 */
const RevisionSummary = ({ revision, className = "" }) => {
  if (!revision) return null;

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">Oxirgi o'qilgan holat</h2>
        <Pill meta={REVISION_STATUS[revision.status]} />
      </div>

      <InfoList>
        <InfoRow label="O'qilgan">
          {formatDateTimeUz(revision.createdAt)} ·{" "}
          {revision.fetchedBy ? nameOf(revision.fetchedBy) : "Avtomatik"}
        </InfoRow>
        <InfoRow label="Varaq">{revision.sheetTab || "—"}</InfoRow>
        <InfoRow label="Sheet'da">
          {revision.classCount} ta sinf · {revision.lessonCount} ta dars
        </InfoRow>
        <InfoRow label="Muammolar">
          <span className={revision.issueCount > 0 ? "text-red-600" : undefined}>
            {revision.issueCount}
          </span>
        </InfoRow>
        {revision.reviewedBy && (
          <InfoRow label="Ko'rib chiqdi">
            {nameOf(revision.reviewedBy)} · {formatDateTimeUz(revision.reviewedAt)}
          </InfoRow>
        )}
        {revision.rejectReason && (
          <InfoRow label="Rad etish sababi">{revision.rejectReason}</InfoRow>
        )}
      </InfoList>
    </Card>
  );
};

/**
 * Butun maktab jadvalini almashtirishdan OLDIN — bu tahrir haqida
 * bilish shart bo'lgan narsa.
 *
 * ⚠️ "Manbani almashtirish" oynasi sheet'ni o'zi o'qiydi va natija hech
 * kim ko'rib chiqmagan yangi tahrir bo'lishi mumkin; yoki aksincha —
 * allaqachon RAD ETILGAN tahrir. Ikkalasi ham oddiy holat kabi jim o'tib
 * ketmasligi kerak.
 *
 * @param {object} props
 * @param {object} props.revision - `RevisionSummary`
 * @param {boolean} [props.created] - shu oynadagi tekshiruv yangi tahrir yaratdi
 */
export const RevisionAttention = ({ revision, created = false }) => {
  if (!revision) return null;

  if (revision.status && revision.status !== "pending") {
    const title = REVISION_ATTENTION[revision.status] || REVISION_STATUS[revision.status]?.label;
    return (
      <Notice tone="warning" title={title || "Bu tahrir ko'rib chiqilgan"}>
        {revision.rejectReason && <p>Sabab: {revision.rejectReason}</p>}
        {revision.reviewedBy && (
          <p>
            {nameOf(revision.reviewedBy)} · {formatDateTimeUz(revision.reviewedAt)}
          </p>
        )}
      </Notice>
    );
  }

  if (created) {
    return (
      <Notice tone="warning" title={REVISION_ATTENTION.created}>
        Quyidagi farq, ogohlantirish va ta'sirlarni diqqat bilan ko'rib chiqing.
      </Notice>
    );
  }

  return null;
};

export default RevisionSummary;
