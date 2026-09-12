// React
import { useEffect, useRef, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { RefreshCw } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import {
  PayrollImpact,
  RemovedClasses,
  SubstitutionImpact,
  TodayImpact,
} from "./ImpactPanels";
import RevisionSummary, { RevisionAttention } from "./RevisionSummary";
import SnapshotImpacts from "./SnapshotImpacts";
import AckChecklist from "./AckChecklist";
import { DiffSection } from "./DiffView";
import IssueList from "./IssueList";
import Notice from "./Notice";

// Hooks, queries, helpers & data
import useAcknowledgements from "../hooks/useAcknowledgements";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { useCheckSheet, useSwitchSource } from "../queries/scheduleSync.mutations";
import {
  allAcknowledged,
  blockerText,
  errorMessage,
  isDiffUnknown,
  notifySyncError,
  switchBackBlockers,
} from "../helpers/scheduleSync.helpers";
import { DIFF_UNKNOWN_TEXT } from "../data/scheduleSync.data";

// Oyna ichidagi kartalar oq fonda — chegara bilan ajratiladi
const MODAL_CARD = "border border-gray-100";

/**
 * MANBANI ALMASHTIRISH — platforma ↔ Google Sheets.
 *
 * Yo'nalish modal OCHILGANDA qotiriladi (`from`): oyna ochiq turganda
 * holat yangilansa ham, odam boshlagan amal boshqasiga aylanib ketmaydi.
 *
 * ⚠️ BUTUN MAKTAB JADVALI almashadi — shuning uchun tasdiqlashdan oldin
 * TO'LIQ ko'rinish chiziladi ("O'zgarishlar" tabidagi bilan bir xil
 * bo'laklar): farq sinflar bo'yicha, ogohlantirishlar, bugungi darslar,
 * oylik va o'rinbosarlikka ta'sir. Faqat jami raqamlar bilan tasdiqlash
 * "nimani almashtirayotganimni bilmadim" degan holatga olib kelardi.
 *
 * Har ikki yo'nalishda almashtirilayotgan jadval arxivga saqlanadi —
 * hech narsa o'chmaydi, "Versiyalar" dan tiklash mumkin.
 */
const SwitchSourceModal = () => (
  <ResponsiveModal
    name="scheduleSyncSwitch"
    title="Manbani almashtirish"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ from, ...props }) =>
  from === "sheet" ? <ToPlatform {...props} /> : <ToSheet {...props} />;

/** Pastki tugmalar — ikkala yo'nalishda bir xil shakl. */
const Footer = ({ close, onSubmit, disabled, isLoading, label, children = null }) => (
  <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
    <Button type="button" variant="secondary" onClick={close}>
      Bekor qilish
    </Button>
    {children}
    <Button type="button" onClick={onSubmit} disabled={disabled}>
      {label}
      {isLoading && "..."}
    </Button>
  </div>
);

// ── Platforma → Google Sheets ─────────────────

/**
 * Sheet'dagi holatning to'liq ko'rinishi va tasdiq. Xeshlar o'zgarganda
 * `key` orqali qayta chiziladi — belgilangan tasdiqlar eski ko'rinishga
 * tegishli edi.
 *
 * @param {object} props
 * @param {object} props.review - `Review`
 * @param {boolean} props.created - shu oynadagi tekshiruv yangi tahrir yaratdi
 * @param {boolean} props.isRefreshing - ko'rinish qayta o'qilmoqda (xeshlar eskirgan bo'lishi mumkin)
 */
const ToSheetReview = ({
  review,
  created,
  close,
  isLoading,
  setIsLoading,
  onRecheck,
  isChecking,
  isRefreshing,
}) => {
  const acks = useAcknowledgements();
  const [serverErrors, setServerErrors] = useState([]);
  const { mutate: switchSource } = useSwitchSource();

  const requiredAcks = acks.listFor(review.requiredAcks ?? []);
  const diffUnknown = isDiffUnknown(review);
  // Natija xeshisiz almashtirib bo'lmaydi — odam ko'rgan jadval noma'lum
  const canSwitch = review.canSwitch && Boolean(review.newHash);
  const isReady = canSwitch && allAcknowledged(requiredAcks, acks.acked);

  const handleSubmit = () => {
    setServerErrors([]);
    setIsLoading(true);
    switchSource(
      {
        to: "sheet",
        revisionId: review.revision.id,
        activeHash: review.activeHash,
        newHash: review.newHash,
        acknowledged: acks.acknowledged,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Jadval endi Google Sheets orqali boshqariladi");
        },
        onError: (err) =>
          notifySyncError(err, {
            onAckRequired: acks.markMissing,
            onValidation: setServerErrors,
          }),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <RevisionAttention revision={review.revision} created={created} />
      <RevisionSummary revision={review.revision} className={MODAL_CARD} />

      {!diffUnknown && review.hasChanges === false && (
        <Notice
          tone="success"
          title="Amaldagi jadval sheet bilan bir xil — faqat manba almashadi"
        />
      )}

      <IssueList items={serverErrors} tone="danger" title="Almashtirishda aniqlangan xatolar" />
      <IssueList
        items={review.errors ?? []}
        tone="danger"
        title="Xatolar"
        description={`Tuzatilmaguncha o'tib bo'lmaydi — "O'zgarishlar" va "Moslash" bo'limida tuzating.`}
      />
      <IssueList
        items={review.blockers ?? []}
        tone="warning"
        title="Nega hozir almashtirib bo'lmaydi"
      />
      <IssueList items={review.warnings ?? []} tone="warning" title="Ogohlantirishlar" />

      <RemovedClasses items={review.removedClasses ?? []} />
      <TodayImpact impact={review.todayImpact} />
      <PayrollImpact rows={review.payrollImpact ?? []} className={MODAL_CARD} />
      <SubstitutionImpact rows={review.substitutionImpact ?? []} className={MODAL_CARD} />

      <DiffSection
        view={review}
        className={MODAL_CARD}
        unknownText={
          review.isLatest === false ? DIFF_UNKNOWN_TEXT.old : DIFF_UNKNOWN_TEXT.errors
        }
      />

      <AckChecklist
        acks={requiredAcks}
        acked={acks.acked}
        missing={acks.missing}
        onToggle={acks.toggle}
        disabled={!canSwitch || isLoading}
      />

      <Footer
        close={close}
        onSubmit={handleSubmit}
        disabled={!isReady || isLoading || isChecking || isRefreshing}
        isLoading={isLoading}
        label="Google Sheets'ga o'tish"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onRecheck}
          disabled={isChecking || isLoading}
        >
          <RefreshCw
            className={cn("size-4", isChecking && "animate-spin")}
            strokeWidth={1.5}
          />
          Qayta tekshirish
        </Button>
      </Footer>
    </div>
  );
};

/**
 * Sheet'ga o'tish: avval sheet YANGIDAN o'qiladi, keyin aynan o'sha
 * holatning ko'rinishi ko'rsatiladi va shu ko'rinish xeshlari bilan
 * almashtiriladi. Eski tekshiruv natijasi bilan butun maktab jadvalini
 * almashtirib bo'lmaydi.
 */
const ToSheet = ({ close, isLoading, setIsLoading }) => {
  const {
    mutate: runCheck,
    data: checkResult,
    error: checkError,
    isPending: isChecking,
    isError: isCheckFailed,
  } = useCheckSheet();

  // Oyna ochilishi bilan BIR MARTA tekshiriladi (qayta chizishda emas)
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runCheck();
  }, [runCheck]);

  const revisionId = checkResult?.revision?.id ?? null;
  const reviewQuery = useQuery(scheduleSyncQueries.revision(revisionId));
  const review = reviewQuery.data;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-gray-600">
        Hozirgi platforma jadvali arxivga saqlanadi (o'chmaydi) va sheet'dagi
        jadval amalga kiradi. Platformada tahrirlash yopiladi.
      </p>

      {isChecking && (
        <LoaderCard
          kind="icon"
          title="Sheet tekshirilmoqda..."
          className="border border-gray-100"
        />
      )}

      {isCheckFailed && (
        <Notice
          tone="danger"
          title="Sheet'ni o'qib bo'lmadi"
          action={
            <Button size="sm" variant="outline" onClick={() => runCheck()}>
              <RefreshCw className="size-4" strokeWidth={1.5} />
              Qayta tekshirish
            </Button>
          }
        >
          {errorMessage(checkError)}
        </Notice>
      )}

      {revisionId && reviewQuery.isLoading && (
        <LoaderCard
          kind="icon"
          title="O'zgarishlar yuklanmoqda..."
          className="border border-gray-100"
        />
      )}

      {revisionId && reviewQuery.isError && (
        <Notice
          tone="danger"
          title="Ko'rinishni yuklab bo'lmadi"
          action={
            <Button size="sm" variant="outline" onClick={() => reviewQuery.refetch()}>
              Qayta urinish
            </Button>
          }
        />
      )}

      {review && !isChecking ? (
        <ToSheetReview
          key={`${review.revision?.id}:${review.activeHash}:${review.newHash}`}
          review={review}
          created={Boolean(checkResult?.created)}
          close={close}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onRecheck={() => runCheck()}
          isChecking={isChecking}
          isRefreshing={reviewQuery.isFetching}
        />
      ) : (
        <Footer
          close={close}
          disabled
          label="Google Sheets'ga o'tish"
          onSubmit={() => {}}
        />
      )}
    </div>
  );
};

// ── Google Sheets → Platforma ─────────────────

/**
 * Arxivdagi platforma jadvalini tiklab qaytish — tiklashdagi AYNI
 * ko'rinish: farq sinflar bo'yicha, ogohlantirishlar, tiklanmaydigan
 * darslar va to'siqlar.
 *
 * ⚠️ "O'zgarish yo'q" to'sig'i bu yerda hisobga olinmaydi: arxivdagi
 * jadval amaldagisi bilan bir xil bo'lsa ham platformaga qaytish mumkin.
 * Boshqa to'siq bo'lsa (yoki farq hisoblanmagan bo'lsa) — tasdiq yopiq va
 * "hozirgi jadvalni saqlab qolish" taklif qilinadi.
 *
 * `isRefreshing` — ko'rinish qayta o'qilmoqda: ekrandagi xeshlar eskirgan
 * bo'lishi mumkin, shuning uchun tasdiq tugmasi kutadi.
 */
const ArchiveRestore = ({
  view,
  close,
  isLoading,
  setIsLoading,
  isRefreshing,
  onChooseKeep,
}) => {
  const acks = useAcknowledgements();
  const [serverErrors, setServerErrors] = useState([]);
  const { mutate: switchSource } = useSwitchSource();

  const requiredAcks = acks.listFor(view.requiredAcks ?? []);
  const blockers = switchBackBlockers(view.blockers ?? []);
  const diffUnknown = isDiffUnknown(view);
  const isBlocked = blockers.length > 0 || !view.newHash;
  const isReady = !isBlocked && allAcknowledged(requiredAcks, acks.acked);

  const handleSubmit = () => {
    setServerErrors([]);
    setIsLoading(true);
    switchSource(
      {
        to: "platform",
        restore: "archive",
        activeHash: view.activeHash,
        newHash: view.newHash,
        acknowledged: acks.acknowledged,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Jadval platformaga qaytdi — arxivdagi jadval tiklandi");
        },
        onError: (err) =>
          notifySyncError(err, {
            onAckRequired: acks.markMissing,
            onValidation: setServerErrors,
          }),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <IssueList
        items={blockers.map(blockerText)}
        tone="warning"
        title="Arxivdagi jadvalni hozir qaytarib bo'lmaydi"
      />

      {isBlocked && (
        <Notice
          tone="info"
          title="Hozirgi jadvalni saqlab qolib qaytish mumkin"
          action={
            <Button size="sm" variant="outline" onClick={onChooseKeep} disabled={isLoading}>
              Shu variantni tanlash
            </Button>
          }
        >
          Amaldagi jadval o'zgarmaydi — faqat platformada tahrirlash ochiladi.
        </Notice>
      )}

      {!diffUnknown && view.hasChanges === false && (
        <Notice
          tone="success"
          title="Arxivdagi jadval amaldagisi bilan bir xil — faqat manba almashadi"
        />
      )}

      <IssueList items={serverErrors} tone="danger" title="Almashtirishda aniqlangan xatolar" />
      <IssueList items={view.warnings ?? []} tone="warning" title="Ogohlantirishlar" />
      <SnapshotImpacts view={view} cardClassName={MODAL_CARD} />

      <DiffSection
        view={view}
        title="Tiklansa amaldagi jadvalda nima o'zgaradi"
        unknownText={DIFF_UNKNOWN_TEXT.snapshot}
        className={MODAL_CARD}
      />

      <AckChecklist
        acks={requiredAcks}
        acked={acks.acked}
        missing={acks.missing}
        onToggle={acks.toggle}
        disabled={isBlocked || isLoading}
      />

      <Footer
        close={close}
        onSubmit={handleSubmit}
        disabled={!isReady || isLoading || isRefreshing}
        isLoading={isLoading}
        label="Platformaga qaytish"
      />
    </div>
  );
};

/** Amaldagi (sheet) jadvalni o'zgartirmasdan platformaga qaytish. */
const KeepCurrent = ({ status, close, isLoading, setIsLoading }) => {
  const { mutate: switchSource } = useSwitchSource();
  const active = status?.active;

  const handleSubmit = () => {
    setIsLoading(true);
    switchSource(
      { to: "platform", restore: "keep", activeHash: active?.hash },
      {
        onSuccess: () => {
          close();
          toast.success("Jadval platformaga qaytdi");
        },
        onError: (err) => notifySyncError(err),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Amaldagi jadval ({active?.classCount ?? 0} ta sinf · {active?.lessonCount ?? 0}{" "}
        ta dars) o'zgarmaydi — faqat platformada tahrirlash ochiladi.
      </p>

      <Footer
        close={close}
        onSubmit={handleSubmit}
        disabled={!active?.hash || isLoading}
        isLoading={isLoading}
        label="Platformaga qaytish"
      />
    </div>
  );
};

const RestoreOption = ({ value, current, onSelect, title, description, disabled }) => (
  <label
    className={cn(
      "flex gap-3 rounded-xl border p-3 transition-colors",
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      current === value
        ? "border-primary bg-primary/5"
        : "border-gray-200 hover:border-gray-300",
    )}
  >
    <input
      type="radio"
      name="restoreMode"
      className="mt-0.5 size-4"
      disabled={disabled}
      checked={current === value}
      onChange={() => onSelect(value)}
    />
    <span className="space-y-0.5">
      <span className="block text-sm font-medium text-gray-800">{title}</span>
      <span className="block text-xs text-gray-500">{description}</span>
    </span>
  </label>
);

/**
 * Platformaga qaytish: arxivdagi platforma jadvalini tiklash yoki
 * amaldagisini saqlab qolish. Arxiv tanlansa, uni tiklash ko'rinishi
 * (farq, ogohlantirish, tasdiqlar) OLDINDAN ko'rsatiladi.
 */
const ToPlatform = ({ close, isLoading, setIsLoading }) => {
  const { data: status } = useQuery(scheduleSyncQueries.status());
  const archive = status?.platformSnapshot ?? null;
  const [restore, setRestore] = useState(archive ? "archive" : "keep");

  const snapshotQuery = useQuery({
    ...scheduleSyncQueries.snapshot(archive?.id),
    enabled: restore === "archive" && Boolean(archive?.id),
  });
  const view = snapshotQuery.data;

  // Oyna ochiq turganda manbani boshqa odam almashtirib qo'ygan bo'lsa,
  // server 409 qaytaradi (`mode_changed` / `already_in_mode`) — holat
  // qayta o'qiladi va odam qaytadan qaror qiladi.
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Hozirgi (sheet) jadval arxivga saqlanadi.</p>

      <fieldset className="space-y-2">
        <legend className="sr-only">Qaysi jadval amalda qolsin</legend>
        <RestoreOption
          value="archive"
          current={restore}
          onSelect={setRestore}
          disabled={!archive || isLoading}
          title={
            archive
              ? `Arxivdagi platforma jadvalini qaytarish (saqlangan sana: ${formatDateTimeUz(archive.createdAt)})`
              : "Arxivdagi platforma jadvalini qaytarish"
          }
          description={
            archive
              ? `${archive.classCount} ta sinf · ${archive.lessonCount} ta dars`
              : "Arxivda platforma jadvali yo'q"
          }
        />
        <RestoreOption
          value="keep"
          current={restore}
          onSelect={setRestore}
          disabled={isLoading}
          title="Hozirgi jadvalni saqlab qolish"
          description="Sheet'dan kelgan jadval amalda qoladi va platformada tahrirlanadi."
        />
      </fieldset>

      {restore === "keep" && (
        <KeepCurrent
          status={status}
          close={close}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {restore === "archive" && snapshotQuery.isLoading && (
        <LoaderCard
          kind="icon"
          title="Arxivdagi jadval yuklanmoqda..."
          className="border border-gray-100"
        />
      )}

      {restore === "archive" && snapshotQuery.isError && (
        <Notice
          tone="danger"
          title="Arxivdagi jadvalni yuklab bo'lmadi"
          action={
            <Button size="sm" variant="outline" onClick={() => snapshotQuery.refetch()}>
              Qayta urinish
            </Button>
          }
        />
      )}

      {restore === "archive" &&
        (view ? (
          <ArchiveRestore
            key={`${view.snapshot?.id}:${view.activeHash}:${view.newHash}`}
            view={view}
            close={close}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isRefreshing={snapshotQuery.isFetching}
            onChooseKeep={() => setRestore("keep")}
          />
        ) : (
          // Arxiv ko'rinishi hali yo'q — tasdiqlab bo'lmaydi, lekin chiqish bor
          <Footer close={close} disabled label="Platformaga qaytish" onSubmit={() => {}} />
        ))}
    </div>
  );
};

export default SwitchSourceModal;
