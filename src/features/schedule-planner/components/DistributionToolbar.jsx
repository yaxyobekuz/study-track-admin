// Icons
import {
  Eye,
  Save,
  Eraser,
  EyeOff,
  Table2,
  Loader2,
  CloudDownload,
} from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";
import ConfirmPopover from "./ConfirmPopover";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { SAVE_STATES } from "../data/distribution.data";

// Paneldagi HAMMA boshqaruv bir xil balandlikda. Turli balandlikdagi
// tugmalar qatorni "arralab" ko'rsatadi — aynan shu narsa panelni tartibsiz
// qilib ko'rsatadigan birinchi sabab.
const CONTROL = "h-9 gap-2 rounded-xl px-3 text-sm font-medium";

// Ikkinchi darajali amallar RAMKASIZ. Ramkali tugmalar yonma-yon tursa,
// ko'z asosiy amalni (Saqlash) topolmay qoladi.
const GHOST = cn(
  CONTROL,
  "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
);

// Yozuv tor ekranda yashiriladi: ikonka qoladi, tasdiq paneli esa baribir
// nima bo'layotganini to'liq aytadi.
const LABEL = "hidden lg:inline";

/**
 * Bitta ko'rsatkich — raqam tepada, izoh pastda.
 *
 * Ilgari hammasi bitta uzun jumla edi ("Jami: 768 soat · 469 o'quvchi ·
 * 23 fan × 25 sinf") va undan bitta raqamni ajratib olish uchun butun
 * qatorni o'qishga to'g'ri kelardi.
 */
const Stat = ({ value, label, accent = false }) => (
  <div className="flex flex-col leading-none">
    <span
      className={cn(
        "text-[15px] font-semibold tabular-nums",
        accent ? "text-primary" : "text-gray-900",
      )}
    >
      {value}
    </span>
    <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
      {label}
    </span>
  </div>
);

const Divider = () => <span className="h-7 w-px shrink-0 bg-gray-200" />;

/**
 * "DARS TAQSIMOTI" VARAG'INING ASBOBLAR PANELI.
 *
 * Panel uch blokka bo'lingan va tartib ATAYLAB shunday:
 *   1. Ko'rsatkichlar — faqat o'qiladi, chapda (ko'z shu yerdan boshlaydi).
 *   2. Holat va ko'rinish — varaq qayerda saqlanmoqda, nima yashirilgan.
 *   3. Amallar — o'ngda, oxirida asosiy tugma (Saqlash).
 *
 * ⚠️ Qaytmas amallar (serverdan yuklash, soatlarni tozalash) `window.confirm`
 * bilan emas, TUGMA YONIDA ochiladigan tasdiq paneli bilan so'raladi —
 * `ConfirmPopover` ga qarang.
 */
const DistributionToolbar = ({
  totals,
  savedAt,
  isSaving,
  dirtyForServer,
  canSave,
  onSave,
  onClear,
  hiddenCount,
  onShowAll,
  editStructure,
  onEditStructureChange,
  hasServerCopy,
  onLoadFromServer,
}) => {
  // "Saqlanmagan o'zgarish bor" va "serverda nusxa umuman yo'q" — boshqa-boshqa
  // holat, shuning uchun uchinchi (kulrang) ko'rinish ham bor.
  const status = dirtyForServer
    ? SAVE_STATES.unsaved
    : savedAt
      ? SAVE_STATES.saved
      : SAVE_STATES.localOnly;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
      {/* ── 1. Ko'rsatkichlar ── */}
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 py-1.5 pl-3 pr-4">
        <Table2 size={18} strokeWidth={1.5} className="text-gray-400" />

        <Stat accent value={totals.grand} label="jami soat" />
        <Divider />
        <Stat value={totals.students} label="o'quvchi" />
      </div>

      {/* ── 2. Saqlanish holati ──
          Bitta belgi uchala savolga javob beradi: saqlandimi, qayerda va
          qachon. Ilgari bu uchta alohida element edi (yashil yorliq, matn
          va tugmadagi yulduzcha). */}
      <Tooltip
        content={
          <div className="max-w-60 space-y-1">
            <p className="text-xs leading-relaxed text-gray-600">
              {status.hint}
            </p>
            {savedAt && (
              <p className="text-xs font-medium text-gray-900">
                Serverdagi nusxa: {formatDateTimeUz(savedAt)}
              </p>
            )}
          </div>
        }
      >
        <span
          tabIndex={0}
          role="status"
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-medium outline-none",
            status.className,
          )}
        >
          <span className="relative flex size-2">
            {status.pulse && (
              <span
                className={cn(
                  "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                  status.dotClassName,
                )}
              />
            )}
            <span
              className={cn(
                "relative inline-flex size-2 rounded-full",
                status.dotClassName,
              )}
            />
          </span>
          {status.label}
        </span>
      </Tooltip>

      <span className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />

      {/* ── 3. Ko'rinish ── */}
      <Tooltip content="Yoqilsa, har bir sinf va fan ustida yashirish tugmasi chiqadi">
        <Button
          variant="ghost"
          aria-pressed={editStructure}
          onClick={() => onEditStructureChange(!editStructure)}
          className={cn(
            GHOST,
            editStructure &&
              "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
          )}
        >
          <EyeOff strokeWidth={1.8} />
          <span className={LABEL}>Yashirish rejimi</span>
        </Button>
      </Tooltip>

      {/* Yashirilgan ustun/qator bor ekan — uni QAYTARIB olish yo'li doim
          ko'rinib turadi. Aks holda odam yashirgan sinfini qidirib qoladi. */}
      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          onClick={onShowAll}
          className={cn(
            CONTROL,
            "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800",
          )}
        >
          <Eye strokeWidth={1.8} />
          {hiddenCount} ta yashirilgan
          <span className="hidden text-amber-600/80 xl:inline">
            — ko'rsatish
          </span>
        </Button>
      )}

      {/* ── 4. Amallar ── */}
      <div className="ml-auto flex items-center gap-1">
        {hasServerCopy && (
          <ConfirmPopover
            tooltip="Serverdan yuklash"
            title="Serverdagi nusxa yuklansinmi?"
            description="Brauzerdagi joriy varaq almashtiriladi — unga kiritilgan, hali saqlanmagan o'zgarishlar yo'qoladi."
            confirmLabel="Yuklash"
            onConfirm={onLoadFromServer}
          >
            <Button variant="ghost" className={GHOST}>
              <CloudDownload strokeWidth={1.8} />
              <span className={LABEL}>Serverdan yuklash</span>
            </Button>
          </ConfirmPopover>
        )}

        <ConfirmPopover
          danger
          tooltip="Soatlarni tozalash"
          title="Barcha soatlar tozalansinmi?"
          description="Faqat kiritilgan soatlar o'chadi. Sinf va fan ro'yxati tizimdan keladi — ularga tegilmaydi."
          confirmLabel="Tozalash"
          onConfirm={onClear}
        >
          <Button
            variant="ghost"
            className={cn(GHOST, "hover:bg-red-50 hover:text-red-600")}
          >
            <Eraser strokeWidth={1.8} />
            <span className={LABEL}>Soatlarni tozalash</span>
          </Button>
        </ConfirmPopover>

        {canSave && (
          <>
            <span className="mx-1 h-6 w-px bg-gray-200" />

            <Tooltip
              content={
                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                  Varaqni serverga yozadi
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-gray-500">
                    Ctrl/⌘ + S
                  </kbd>
                </span>
              }
            >
              <Button
                onClick={onSave}
                disabled={isSaving}
                className={cn(CONTROL, "px-4")}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" strokeWidth={1.8} />
                ) : (
                  <Save strokeWidth={1.8} />
                )}
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}

                {/* Saqlanmagan o'zgarish borligi — tugmaning O'ZIDA.
                    Ilgari bu yulduzcha edi va yozuvga yopishib turardi. */}
                {dirtyForServer && !isSaving && (
                  <span className="size-1.5 rounded-full bg-white/90" />
                )}
              </Button>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};

export default DistributionToolbar;
