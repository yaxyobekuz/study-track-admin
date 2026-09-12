// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useSyncParams from "../hooks/useSyncParams";

// Components
import LoaderCard from "@/shared/components/ui/LoaderCard";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import RejectRevisionModal from "../components/RejectRevisionModal";
import SwitchSourceModal from "../components/SwitchSourceModal";
import SnapshotsTab from "../components/SnapshotsTab";
import ConfigModal from "../components/ConfigModal";
import HistoryTab from "../components/HistoryTab";
import MappingTab from "../components/MappingTab";
import ReviewTab from "../components/ReviewTab";
import StatusTab from "../components/StatusTab";
import LoadError from "../components/LoadError";
import Pill from "../components/Pill";

// Queries & data
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { MODE_META, SYNC_TABS } from "../data/scheduleSync.data";

/**
 * DARS JADVALI — GOOGLE SHEETS.
 *
 * Ikki manba: "Platforma" (jadval shu panelda tahrirlanadi) va "Google
 * Sheets" (jadval sheet'da tahrirlanadi, mas'ul xodim o'zgarishni shu
 * yerda ko'rib chiqib qo'llaydi). Har bir almashtirishdan oldin amaldagi
 * jadval "Versiyalar" ga saqlanadi — hech narsa yo'qolmaydi.
 *
 * Tugmalar `Status.can` bo'yicha ko'rsatiladi (server hisoblaydi, owner —
 * hammasi). Sahifaga kirishning o'zi `scheduleSync.*` dan istalgan biri.
 */
const ScheduleSyncPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { tab, setTab } = useSyncParams();

  const {
    data: status,
    isLoading,
    isError,
    refetch,
  } = useQuery(scheduleSyncQueries.status());

  const hasPendingChange = status?.latestRevision?.status === "pending";

  // Ko'rib chiqilmagan o'zgarish bo'lsa — tab yonida belgi
  const tabs = SYNC_TABS.map((item) =>
    item.value === "changes" && hasPendingChange
      ? {
          ...item,
          label: (
            <span className="flex items-center gap-1.5">
              {item.label}
              <span
                className="size-1.5 rounded-full bg-amber-500"
                aria-label="ko'rib chiqilmagan o'zgarish bor"
              />
            </span>
          ),
        }
      : item,
  );

  const openConfig = () =>
    openModal("scheduleSyncConfig", {
      sheetUrl: status?.sheetUrl ?? "",
      sheetTab: status?.sheetTab ?? "",
      autoCheck: Boolean(status?.autoCheck),
    });

  const openSwitch = () => openModal("scheduleSyncSwitch", { from: status?.mode });

  const openReject = (revisionId) => openModal("scheduleSyncReject", { revisionId });

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          {can("schedules.view") && (
            <Link
              to="/schedules"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="size-4" />
              Dars jadvali
            </Link>
          )}
          <h1 className="page-title">Google Sheets</h1>
        </div>

        {status && MODE_META[status.mode] && (
          <Pill meta={MODE_META[status.mode]} className="text-sm">
            Manba: {MODE_META[status.mode].label}
          </Pill>
        )}
      </div>

      {isLoading ? (
        <LoaderCard title="Holat yuklanmoqda..." />
      ) : isError || !status ? (
        <LoadError title="Holatni yuklab bo'lmadi" onRetry={refetch} />
      ) : (
        <>
          <TabsButtons
            value={tab}
            onChange={setTab}
            items={tabs}
            listClassName="justify-start hidden-scrollbar"
          />

          {tab === "status" && (
            <StatusTab
              status={status}
              onOpenConfig={openConfig}
              onOpenSwitch={openSwitch}
              onShowChanges={() => setTab("changes")}
            />
          )}

          {tab === "changes" && (
            <ReviewTab
              status={status}
              onOpenSwitch={openSwitch}
              onOpenReject={openReject}
            />
          )}

          {tab === "mapping" && <MappingTab status={status} />}

          {tab === "versions" && <SnapshotsTab status={status} />}

          {tab === "history" && <HistoryTab />}
        </>
      )}

      {/* Modals */}
      <ConfigModal />
      <SwitchSourceModal />
      <RejectRevisionModal />
    </div>
  );
};

export default ScheduleSyncPage;
