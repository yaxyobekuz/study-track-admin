// Icons
import { ArrowLeftRight, ExternalLink, Settings2 } from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import { InfoList, InfoRow } from "./InfoList";
import CheckButton from "./CheckButton";
import Notice from "./Notice";
import Pill from "./Pill";

// Helpers & data
import { nameOf } from "../helpers/scheduleSync.helpers";
import {
  MODE_META,
  CHECK_RESULT,
  CHECK_FRESHNESS,
  REVISION_STATUS,
} from "../data/scheduleSync.data";

/** Holat tabining yuqorisidagi ogohlantirishlar. */
const StatusNotices = ({ status, onOpenConfig }) => {
  const isSheet = status.mode === "sheet";
  const archive = status.platformSnapshot;
  const duplicates = status.integrity?.duplicateRows ?? 0;

  return (
    <>
      {!status.sheetUrl && (
        <Notice
          tone="info"
          title="Sheet havolasi sozlanmagan"
          action={
            status.can?.source && (
              <Button size="sm" variant="outline" onClick={onOpenConfig}>
                <Settings2 className="size-4" strokeWidth={1.5} />
                Sozlash
              </Button>
            )
          }
        >
          Jadvalni Google Sheets orqali boshqarish uchun avval fayl havolasi
          va varaqni ko'rsating.
        </Notice>
      )}

      {/* ⚠️ `false` — AYNAN farq bor; `null` — tekshirib bo'lmaydi (platforma
          rejimi yoki hali hech narsa qo'llanmagan), bu ogohlantirish emas. */}
      {isSheet && status.inSync === false && (
        <Notice
          tone="warning"
          title="Amaldagi jadval sheet'dagi oxirgi tasdiqlangan holatdan farq qiladi"
        >
          Sheet'ni qayta tekshirib, o'zgarishni ko'rib chiqing va qo'llang.
        </Notice>
      )}

      {duplicates > 0 && (
        <Notice tone="danger" title={`Jadvalda takroriy yozuvlar bor (${duplicates})`}>
          Bir sinfning bir kuni uchun bir nechta jadval yozuvi topildi — dars
          jadvali noto'g'ri ko'rinishi mumkin.
          {status.integrity?.uniqueIndexPresent === false &&
            " Takrorlanishdan himoya hali o'rnatilmagan."}{" "}
          Dasturchiga xabar bering.
        </Notice>
      )}

      {isSheet && archive && (
        <Notice tone="info" title="Platformadagi jadval arxivda saqlangan">
          {formatDateTimeUz(archive.createdAt)} · {archive.classCount} ta sinf ·{" "}
          {archive.lessonCount} ta dars. Platformaga qaytishda uni tiklash
          mumkin.
        </Notice>
      )}
    </>
  );
};

/**
 * "Holat" tabi — manba, havola, oxirgi tekshiruv va asosiy tugmalar.
 *
 * @param {object} props
 * @param {object} props.status - `Status`
 * @param {() => void} props.onOpenConfig
 * @param {() => void} props.onOpenSwitch
 * @param {() => void} props.onShowChanges
 */
const StatusTab = ({ status, onOpenConfig, onOpenSwitch, onShowChanges }) => {
  const can = status.can ?? {};
  const active = status.active ?? {};
  const latestRevision = status.latestRevision;
  const hasChecked = Boolean(status.lastCheckedAt);

  return (
    <div className="space-y-4">
      <StatusNotices status={status} onOpenConfig={onOpenConfig} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Manba */}
        <Card className="space-y-4">
          <h2 className="font-semibold text-gray-900">Jadval manbai</h2>

          <InfoList>
            <InfoRow label="Manba">
              <Pill meta={MODE_META[status.mode]} />
            </InfoRow>
            <InfoRow label="Amaldagi jadval">
              {active.classCount ?? 0} ta sinf · {active.lessonCount ?? 0} ta dars
            </InfoRow>
            {status.modeChangedAt && (
              <InfoRow label="Manba o'zgartirilgan">
                {formatDateTimeUz(status.modeChangedAt)}
                {status.modeChangedBy && ` · ${nameOf(status.modeChangedBy)}`}
              </InfoRow>
            )}
            <InfoRow label="Oxirgi o'qilgan holat">
              {latestRevision ? (
                <span className="inline-flex flex-wrap items-center gap-1.5 xs:justify-end">
                  <Pill meta={REVISION_STATUS[latestRevision.status]} />
                  {formatDateTimeUz(latestRevision.createdAt)}
                </span>
              ) : (
                "—"
              )}
            </InfoRow>
          </InfoList>

          <p className="text-xs leading-relaxed text-gray-500">
            {status.mode === "sheet"
              ? "Jadval sheet'da tahrirlanadi. Sheet'dagi o'zgarish mas'ul xodim ko'rib chiqib qo'llagandan keyingina amalga kiradi."
              : "Jadval platformada tahrirlanadi. Google Sheets'ga o'tishda hozirgi jadval arxivga saqlanadi — o'chmaydi."}
          </p>

          {can.source && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3.5">
              <Button onClick={onOpenSwitch}>
                <ArrowLeftRight className="size-4" strokeWidth={1.5} />
                Manbani almashtirish
              </Button>
            </div>
          )}
        </Card>

        {/* Google Sheets */}
        <Card className="space-y-4">
          <h2 className="font-semibold text-gray-900">Google Sheets</h2>

          <InfoList>
            <InfoRow label="Havola">
              {status.sheetUrl ? (
                <a
                  href={status.sheetUrl}
                  title={status.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-blue-600 hover:underline"
                >
                  <span className="truncate">Faylni ochish</span>
                  <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.5} />
                </a>
              ) : (
                "Sozlanmagan"
              )}
            </InfoRow>
            <InfoRow label="Varaq">{status.sheetTab || "—"}</InfoRow>
            <InfoRow label="Avtomatik tekshirish">
              {status.autoCheck ? "Yoqilgan" : "O'chirilgan"}
            </InfoRow>
            <InfoRow label="Oxirgi tekshiruv">
              {hasChecked ? (
                <span className="inline-flex flex-wrap items-center gap-1.5 xs:justify-end">
                  {formatDateTimeUz(status.lastCheckedAt)}
                  {status.lastCheckOk !== null && (
                    <Pill
                      meta={status.lastCheckOk ? CHECK_RESULT.ok : CHECK_RESULT.failed}
                    />
                  )}
                </span>
              ) : (
                "Hali tekshirilmagan"
              )}
            </InfoRow>
            {hasChecked && (
              <InfoRow label="Tekshiruv">
                <Pill
                  meta={status.checkFresh ? CHECK_FRESHNESS.fresh : CHECK_FRESHNESS.stale}
                />
              </InfoRow>
            )}
          </InfoList>

          {status.lastCheckError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-800">
              {status.lastCheckError}
              {status.checkFailureCount > 1 &&
                ` (ketma-ket ${status.checkFailureCount} marta)`}
            </p>
          )}

          {!status.checkFresh && status.sheetUrl && (
            <p className="text-xs text-gray-500">
              Qo'llash va Google Sheets'ga o'tish uchun sheet oxirgi 15 daqiqa
              ichida muvaffaqiyatli tekshirilgan bo'lishi kerak.
            </p>
          )}

          {(can.review || can.source) && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3.5">
              {can.source && (
                <Button variant="outline" onClick={onOpenConfig}>
                  <Settings2 className="size-4" strokeWidth={1.5} />
                  Sozlash
                </Button>
              )}
              <CheckButton status={status} onCreated={onShowChanges} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StatusTab;
