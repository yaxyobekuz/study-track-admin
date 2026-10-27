// React
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext, useSearchParams } from "react-router-dom";

// Icons
import {
  KeyRound,
  MonitorSmartphone,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  ShieldOff,
  Trash2,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Table, { Tr, Td } from "@/shared/components/ui/Table";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import KioskModal from "../components/KioskModal";
import PairingCodeModal from "../components/PairingCodeModal";
import KioskPinModal from "../components/KioskPinModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDebounce from "@/shared/hooks/useDebounce";

// Queries
import { faceIdQueries } from "../queries/faceId.queries";
import {
  useIssuePairingCode,
  useResumeKiosk,
  useRevokeKiosk,
  useSuspendKiosk,
  useDeleteKiosk,
} from "../queries/faceId.mutations";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  KIOSK_MODES,
  KIOSK_OFFLINE_AFTER_MIN,
  KIOSK_STATUS,
  KIOSK_STATUS_FILTERS,
} from "../data/faceId.data";

/**
 * KIOSKLAR RO'YXATI — "qurilmalar ishlayaptimi".
 *
 * ⚠️ "ALOQA YO'Q" BELGISI HOLATDAN ALOHIDA ko'rsatiladi. Kiosk reyestrda
 * `active` bo'lib turishi va o'sha paytda o'chiq bo'lishi mumkin: holat
 * — bu ADMIN qarori (biriktirilgan / to'xtatilgan), aloqa esa QURILMA
 * fakti (`lastSeenAt`). Ikkalasini bitta ustunga yig'ish eng chalg'ituvchi
 * holat bo'lardi — ekranda "ishlayapti" turgan kiosk aslida uch kundan
 * beri o'chiq bo'lishi mumkin.
 *
 * ⚠️ Holat filtri URL da saqlanadi (`?status=revoked`): manzaradagi
 * karta to'g'ridan-to'g'ri shu ro'yxatni ochadi.
 */
const KiosksPage = () => {
  const { filterSlot } = useOutletContext();
  const { can } = usePermissions();
  const { openModal } = useModal();

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const status = params.get("status") || "all";
  const page = Number(params.get("page")) || 1;

  const query = useMemo(
    () => ({ status, search: debouncedSearch || undefined, page, limit: 20 }),
    [status, debouncedSearch, page],
  );

  const { data, isPending } = useQuery(faceIdQueries.kiosks(query));

  const issueCode = useIssuePairingCode();
  const revoke = useRevokeKiosk();
  const suspend = useSuspendKiosk();
  const resume = useResumeKiosk();
  const remove = useDeleteKiosk();

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    // Filtr o'zgarganda sahifa birinchisiga qaytadi — aks holda 3-betda
    // turgan odam filtrni almashtirib bo'sh ekran ko'rardi.
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  /**
   * ⚠️ Kod MODALDA ko'rsatiladi, toast'da EMAS: u bir martalik va
   * odam uni kompyuterga qo'lda ko'chirib yozadi. Toast 4 soniyada
   * yo'qolib, kodni qaytadan so'rashga majbur qilardi.
   */
  const handleIssueCode = (kiosk) => {
    issueCode.mutate(kiosk.id, {
      onSuccess: (result) =>
        openModal("faceKioskPairingCode", { kiosk, ...result }),
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Kod berilmadi"),
    });
  };

  const runAction = (mutation, payload, successText) =>
    mutation.mutate(payload, {
      onSuccess: () => toast.success(successText),
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Amal bajarilmadi"),
    });

  const rows = data?.data ?? [];

  const columns = [
    "Kiosk",
    "Holat",
    "Aloqa",
    "Rejim",
    { label: "Qaydlar", align: "right" },
    { label: "", key: "actions", align: "right" },
  ];

  return (
    <>
      {/* ── Filtrlar — layoutdagi slotga ── */}
      {filterSlot &&
        createPortal(
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nomi yoki joyi"
                className="h-10 w-full pl-9 xs:w-56"
              />
            </div>

            <Select
              value={status}
              options={KIOSK_STATUS_FILTERS}
              onChange={(value) => setParam("status", value)}
              triggerClassName="w-full xs:w-44"
            />

            {can("faceId.kiosks") && (
              <Button onClick={() => openModal("faceKiosk")} className="gap-1.5">
                <Plus className="size-4" />
                Kiosk qo'shish
              </Button>
            )}
          </>,
          filterSlot,
        )}

      {isPending ? (
        <LoaderCard />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-white">
          <EmptyState
            icon={MonitorSmartphone}
            title="Kiosk topilmadi"
            description="Kiosk qo'shilganda sizga bir martalik biriktirish kodi beriladi — uni kiosk dasturining birinchi ekraniga kiritasiz."
            action={
              can("faceId.kiosks") ? (
                <Button onClick={() => openModal("faceKiosk")} className="gap-1.5">
                  <Plus className="size-4" />
                  Kiosk qo'shish
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <Table columns={columns}>
            {rows.map((kiosk) => (
              <KioskRow
                key={kiosk.id}
                kiosk={kiosk}
                can={can}
                onEdit={() => openModal("faceKiosk", { kiosk })}
                onPin={() => openModal("faceKioskPin", { kiosk })}
                onIssueCode={() => handleIssueCode(kiosk)}
                onSuspend={(reason) =>
                  runAction(suspend, { id: kiosk.id, reason }, "Kiosk to'xtatildi")
                }
                onResume={() => runAction(resume, kiosk.id, "Kiosk qaytarildi")}
                onRevoke={(reason) =>
                  runAction(revoke, { id: kiosk.id, reason }, "Token bekor qilindi")
                }
                onRemove={() => runAction(remove, kiosk.id, "Kiosk o'chirildi")}
              />
            ))}
          </Table>

          {data.pagination?.totalPages > 1 && (
            <Pagination
              className="mt-4"
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={data.pagination.hasNextPage}
              hasPrevPage={data.pagination.hasPrevPage}
              onPageChange={(next) => setParam("page", String(next))}
            />
          )}
        </>
      )}

      <KioskModal />
      <PairingCodeModal />
      <KioskPinModal />
    </>
  );
};

/**
 * ALOQA HOLATI — `lastSeenAt` dan hisoblanadi.
 *
 * ⚠️ Serverda saqlanadigan "onlayn" bayrog'i YO'Q va bo'lmasligi kerak:
 * uni kim va qachon `false` qilishi aniq bo'lmaydi (kiosk o'chganda
 * hech kimga xabar bermaydi). Jonli hisoblash esa har doim to'g'ri.
 */
const connectionOf = (kiosk) => {
  if (!kiosk.lastSeenAt) {
    return { label: "Hech qachon ulanmagan", tone: "text-gray-400" };
  }
  const minutes = (Date.now() - new Date(kiosk.lastSeenAt).getTime()) / 60000;
  if (minutes <= KIOSK_OFFLINE_AFTER_MIN) {
    return { label: "Onlayn", tone: "text-emerald-600", live: true };
  }
  return { label: formatDateTimeUz(kiosk.lastSeenAt), tone: "text-amber-600" };
};

const KioskRow = ({
  kiosk,
  can,
  onEdit,
  onPin,
  onIssueCode,
  onSuspend,
  onResume,
  onRevoke,
  onRemove,
}) => {
  const status = KIOSK_STATUS[kiosk.status] ?? KIOSK_STATUS.pending;
  const connection = connectionOf(kiosk);
  const mode = KIOSK_MODES.find((m) => m.value === kiosk.mode)?.label ?? kiosk.mode;

  return (
    <Tr>
      <Td nowrap={false}>
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{kiosk.name}</p>
          <p className="mt-0.5 text-[12px] text-gray-500">
            {kiosk.location || "Joyi ko'rsatilmagan"}
            {kiosk.branchName ? ` · ${kiosk.branchName}` : ""}
          </p>
          {kiosk.appVersion && (
            <p className="mt-0.5 text-[11.5px] text-gray-400">
              Dastur {kiosk.appVersion}
              {kiosk.cameraLabel ? ` · ${kiosk.cameraLabel}` : ""}
            </p>
          )}
        </div>
      </Td>

      <Td>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
            status.tone,
          )}
          title={kiosk.statusReason || status.hint}
        >
          <span className={cn("size-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>

        {/* Kod berilgan va hali amal qiladi — "o'rnatish kutilmoqda" */}
        {kiosk.pairingPending && (
          <p className="mt-1 text-[11.5px] text-sky-600">Kod berilgan</p>
        )}
      </Td>

      <Td>
        <span className={cn("inline-flex items-center gap-1.5 text-[12.5px]", connection.tone)}>
          {connection.live && (
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          )}
          {connection.label}
        </span>
        {kiosk.pendingCount > 0 && (
          <p className="mt-0.5 text-[11.5px] font-medium text-amber-600">
            {kiosk.pendingCount} qayd navbatda
          </p>
        )}
      </Td>

      <Td className="text-[12.5px] text-gray-600">{mode}</Td>

      <Td align="right">
        <p className="font-medium text-gray-900">{kiosk.checkCount ?? 0}</p>
        {kiosk.lastCheckAt && (
          <p className="mt-0.5 text-[11.5px] text-gray-400">
            {formatDateTimeUz(kiosk.lastCheckAt)}
          </p>
        )}
      </Td>

      <Td align="right">
        <div className="flex items-center justify-end gap-1">
          {can("faceId.pair") && (
            <Button variant="ghost" size="icon" title="Biriktirish kodi" onClick={onIssueCode}>
              <KeyRound className="size-4" />
            </Button>
          )}

          {can("faceId.kiosks") && (
            <>
              <Button variant="ghost" size="icon" title="Tahrirlash" onClick={onEdit}>
                <Pencil className="size-4" />
              </Button>

              {kiosk.status === "suspended" ? (
                <Button variant="ghost" size="icon" title="Qaytarish" onClick={onResume}>
                  <Play className="size-4" />
                </Button>
              ) : (
                kiosk.status !== "revoked" && (
                  <ConfirmPopover
                    title="Kioskni to'xtatish?"
                    description="Token tirik qoladi, lekin server so'rovlarni rad etadi. Qaytarish uchun qayta biriktirish kerak bo'lmaydi."
                    confirmLabel="To'xtatish"
                    tooltip="Vaqtincha to'xtatish"
                    onConfirm={() => onSuspend("Admin to'xtatdi")}
                  >
                    <Button variant="ghost" size="icon">
                      <Pause className="size-4" />
                    </Button>
                  </ConfirmPopover>
                )
              )}

              <Button variant="ghost" size="icon" title="Sozlama PIN kodi" onClick={onPin}>
                <ShieldOff className="size-4" />
              </Button>
            </>
          )}

          {/* ⚠️ BEKOR QILISH — `faceId.pair` bilan: bu ishlab turgan
              qurilmani UZIB QO'YISH, nomini tahrirlash bilan bir xil
              og'irlikda emas. */}
          {can("faceId.pair") && kiosk.status !== "revoked" && kiosk.pairedAt && (
            <ConfirmPopover
              danger
              title="Tokenni bekor qilish?"
              description="Qurilma darhol uziladi va davomat qabul qilinmaydi. Qaytarish uchun yangi kod bilan qayta biriktirish kerak bo'ladi."
              confirmLabel="Bekor qilish"
              tooltip="Tokenni bekor qilish"
              onConfirm={() => onRevoke("Admin bekor qildi")}
            >
              <Button variant="ghost" size="icon" className="text-rose-600">
                <ShieldOff className="size-4" />
              </Button>
            </ConfirmPopover>
          )}

          {/* ⚠️ O'CHIRISH FAQAT ISHLATILMAGAN KIOSK uchun ko'rinadi:
              server ham rad etadi, lekin tugmani ko'rsatib keyin "mumkin
              emas" deyish eng yomon tartib bo'lardi. */}
          {can("faceId.kiosks") && !kiosk.pairedAt && (kiosk.checkCount ?? 0) === 0 && (
            <ConfirmPopover
              danger
              title="Kioskni o'chirish?"
              description="Bu kiosk hali ishlatilmagan, shuning uchun uni butunlay o'chirish mumkin."
              confirmLabel="O'chirish"
              tooltip="O'chirish"
              onConfirm={onRemove}
            >
              <Button variant="ghost" size="icon" className="text-rose-600">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmPopover>
          )}
        </div>
      </Td>
    </Tr>
  );
};

export default KiosksPage;
