// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import {
  ExternalLink,
  MessageSquareWarning,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { groupSignalsQueries } from "../queries/group-signals.queries";
import {
  useDismissGroupSignal,
  useRefreshGroupSignals,
} from "../queries/group-signals.mutations";

// Data
import {
  SIGNAL_KIND_META,
  SIGNAL_SEVERITY_META,
  SIGNAL_STATUS_FILTERS,
  SIGNAL_STATUS_META,
} from "../data/issues.data";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import AttachSignalForm from "../components/AttachSignalForm";

/**
 * "Guruh signallari" tabi — AI rasmiy guruhlarda topgan muammolar.
 *
 * ⚠️ BU MUAMMOLAR RO'YXATI EMAS va shunday ko'rinmasligi kerak. Bu
 * yerdagi har bir yozuv — AI taxmini: u xato bo'lishi, hazilni shikoyat
 * deb o'qishi mumkin. Shuning uchun ro'yxat ishga tayyor navbat emas,
 * KO'RIB CHIQILADIGAN ro'yxat: odam o'qiydi, kerak bo'lsa kategoriya
 * tanlab muammolarga biriktiradi, kerak bo'lmasa e'tiborsiz qoldiradi.
 *
 * ⚠️ KARTADA FAQAT MUAMMONING O'ZI: sarlavha, ostida ism, vaqt va
 * havola. Iqtibos bu yerda KO'RSATILMAYDI — u sarlavhani deyarli
 * takrorlaydi va ro'yxatni uzaytirardi. Xabarning aynan matni ikki
 * joyda qoladi: "Xabarni ochish" havolasida va biriktirish oynasida
 * (u yerda odam nimani muammoga aylantirayotganini ko'rishi kerak).
 *
 * ⚠️ SARLAVHA — MUAMMONING O'ZI, "...aytilgan" kabi o'ramsiz: shikoyat
 * mazmunidan tushuniladi va qo'shimcha izoh ortiqcha (prompt qoidasi
 * `groupSignalAi.service.js` da).
 *
 * ⚠️ HAVOLA GURUH A'ZOSIGA ochiladi. Yopiq guruhda `t.me/c/...` havolasi
 * faqat o'sha guruhdagi odamga ishlaydi — bu kamchilik emas.
 */
const GroupSignalsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermissions();
  const { openModal } = useModal();

  const status = searchParams.get("status") || "new";

  const { data: signals = [], isLoading } = useQuery(
    groupSignalsQueries.list({ status }),
  );
  const { data: counts } = useQuery(groupSignalsQueries.counts());

  const dismissMutation = useDismissGroupSignal();
  const refreshMutation = useRefreshGroupSignals();

  const canManage = can("issues.signals");

  const setStatus = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", value);
    setSearchParams(params);
  };

  /**
   * HOZIR TEKSHIRISH.
   *
   * ⚠️ NATIJA ROSTINI AYTADI. "Yangilandi" deb qo'yish eng yomon
   * variant bo'lardi: tugma bosilgan-u ro'yxat o'zgarmagan bo'lsa, odam
   * tizim buzilgan deb o'ylardi. Shuning uchun uch xil javob bor —
   * yangi gap yo'q edi, tahlil qilindi-yu signal chiqmadi, yoki
   * signal topildi.
   */
  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result?.error) {
          toast.error("Tekshirib bo'lmadi — birozdan keyin qayta urinib ko'ring");
          return;
        }
        // AI sozlanmagan — bu xato emas, lekin jim qolish ham noto'g'ri.
        if (result?.skipped) {
          toast.info("AI sozlanmagan — tahlil ishlamayapti");
          return;
        }
        // ⚠️ TAHLIL YIQILGANI "TOPILMADI" DEB KO'RSATILMAYDI. AI
        // ishlamasa xabarlar navbatda qoladi va ularni "ko'rildi" deb
        // aytish yolg'on bo'lardi — aynan shu xato bo'lgan edi: 4 ta
        // ochiq shikoyat turgan-u, panel "gap topilmadi" degan.
        if (result?.failedGroups > 0 && !result?.analyzed) {
          toast.error(
            "Tahlil qilib bo'lmadi — AI xizmati javob bermadi. Xabarlar saqlanib turibdi, keyinroq qayta urinib ko'ring",
          );
          return;
        }

        if (!result?.analyzed) {
          toast.info("Yangi xabar yo'q — tekshiradigan narsa topilmadi");
          return;
        }
        // Bir qism guruh tahlil qilinmay qolgan bo'lsa — buni aytish
        // kerak, aks holda "topilmadi" to'liq manzara bo'lib ko'rinardi.
        const tail =
          result.failedGroups > 0
            ? ` (${result.failedGroups} ta guruh tahlil qilinmadi — keyin qayta ko'riladi)`
            : "";

        if (!result.signals) {
          toast.success(
            `${result.analyzed} ta xabar ko'rildi — e'tibor talab qiladigan gap topilmadi${tail}`,
          );
          return;
        }
        toast.success(
          `${result.analyzed} ta xabar ko'rildi — ${result.signals} ta signal topildi${tail}`,
        );
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Tekshirib bo'lmadi"),
    });
  };

  const handleDismiss = (signal) => {
    dismissMutation.mutate(signal.id, {
      onSuccess: () => toast.success("Signal e'tiborsiz qoldirildi"),
      onError: (error) =>
        toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  // Sanoq hali kelmagan bo'lsa yorliq raqamsiz turadi — nol deb
  // ko'rsatish yolg'on bo'lardi (`IssuesPage` bilan ayni qoida).
  const statusTabs = SIGNAL_STATUS_FILTERS.map((tab) => ({
    value: tab.value,
    label:
      counts?.[tab.value] != null
        ? `${tab.label} (${counts[tab.value]})`
        : tab.label,
  }));

  return (
    <div className="space-y-4">
      {/* Tekshirish — 30 daqiqalik aylanishni kutmasdan */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw
              strokeWidth={1.5}
              className={refreshMutation.isPending ? "animate-spin" : undefined}
            />
            {refreshMutation.isPending ? "Tekshirilmoqda..." : "Hozir tekshirish"}
          </Button>
        </div>
      )}

      <TabsButtons
        items={statusTabs}
        value={status}
        onChange={setStatus}
        listClassName="max-w-full justify-start overflow-x-auto hidden-scrollbar"
        triggerClassName="shrink-0"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : signals.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquareWarning}
            title="Signal yo'q"
            description={
              status === "new"
                ? "Rasmiy guruhlarda e'tibor talab qiladigan gap topilmadi. Tekshiruv har 30 daqiqada o'zi takrorlanadi — kutmaslik uchun \"Hozir tekshirish\" tugmasini bosing."
                : "Bu ro'yxat bo'sh."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => {
            const kind = SIGNAL_KIND_META[signal.kind];
            const severity = SIGNAL_SEVERITY_META[signal.severity];
            const statusMeta = SIGNAL_STATUS_META[signal.status];

            return (
              <Card key={signal.id} className="space-y-3">
                {/* Yorliqlar + guruh nomi */}
                <div className="flex flex-wrap items-center gap-2">
                  {kind && (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${kind.className}`}
                    >
                      {kind.label}
                    </span>
                  )}
                  {severity && (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severity.className}`}
                    >
                      {severity.label}
                    </span>
                  )}
                  {statusMeta && signal.status !== "new" && (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  )}

                  <span className="ml-auto text-xs text-gray-500">
                    {signal.group?.title}
                  </span>
                </div>

                {/* AI xulosasi */}
                <p className="font-medium text-gray-900">{signal.summary}</p>

                {/* Manba: kim, qachon, qayerda */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {signal.senderName && (
                    <span className="font-medium text-gray-700">
                      {signal.senderName}
                    </span>
                  )}
                  {signal.sentAt && <span>{formatDateTimeUz(signal.sentAt)}</span>}

                  {/* ⚠️ HAVOLA YANGI OYNADA: panelni tashlab ketmasligi kerak */}
                  {signal.messageLink && (
                    <a
                      href={signal.messageLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                    >
                      <ExternalLink className="size-3.5" strokeWidth={1.5} />
                      Xabarni ochish
                    </a>
                  )}
                </div>

                {/* Biriktirilgan bo'lsa — kim va qachon */}
                {signal.status === "attached" && (
                  <p className="text-xs text-gray-500">
                    {signal.attachedBy
                      ? `${signal.attachedBy.firstName} ${signal.attachedBy.lastName} biriktirgan`
                      : "Biriktirilgan"}
                    {signal.attachedAt
                      ? ` · ${formatDateTimeUz(signal.attachedAt)}`
                      : ""}
                  </p>
                )}

                {/* Amallar — faqat hal qilinmagan signalda */}
                {canManage && signal.status === "new" && (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={dismissMutation.isPending}
                      onClick={() => handleDismiss(signal)}
                    >
                      <X className="size-4" strokeWidth={1.5} />
                      Bu muammo emas
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => openModal("attachGroupSignal", signal)}
                    >
                      <Plus className="size-4" strokeWidth={1.5} />
                      Muammolarga biriktirish
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ResponsiveModal
        name="attachGroupSignal"
        title="Signalni muammolarga biriktirish"
        description="Kategoriyani tanlang — qolgan ma'lumot signaldan ko'chiriladi"
      >
        <AttachSignalForm />
      </ResponsiveModal>
    </div>
  );
};

export default GroupSignalsPage;
