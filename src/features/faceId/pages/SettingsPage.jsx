// React
import { useState } from "react";

// Icons
import { AlertTriangle, RotateCcw, Save, ShieldAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Switch from "@/shared/components/ui/switch/Switch";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import FormRow from "../components/FormRow";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { faceIdQueries } from "../queries/faceId.queries";
import { useUpdateFaceSettings } from "../queries/faceId.mutations";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { SETTING_FIELDS, SETTING_TOGGLES } from "../data/faceId.data";

/**
 * FACE ID SOZLAMASI.
 *
 * ⚠️ HAR MAYDONNING IZOHI EKRANDA TURADI. "0.62" raqamining ma'nosini
 * bilmaydigan odam tasodifan 0.95 qo'yib butun maktabni "tanilmadi"
 * holatiga tushirishi mumkin — matnlar `faceId.data.js` da
 * (`SETTING_FIELDS`), ya'ni bir joyda.
 *
 * ⚠️ CHEGARALAR SERVERDAN KELADI (`ranges`) va bu yerda takrorlanmaydi:
 * panel slayderlarining chegarasi va serverning tekshiruvi BIR
 * MANBADAN bo'lishi kerak, aks holda panel ruxsat bergan qiymat
 * serverda rad etilardi.
 *
 * ⚠️ `warnings` SAQLAGANDAN KEYIN KO'RSATILADI va bu "xato" emas:
 * server qiymatni qabul qiladi, lekin xavf haqida aytadi (tiriklik
 * o'chirilgan, oflayn o'chirilgan va h.k.). Jim o'tib ketilsa,
 * tiriklik tekshiruvi o'chirilgani hech kimga ma'lum bo'lmasdi.
 *
 * ⚠️ MODEL ALMASHTIRISH BU EKRANDA YO'Q. U migratsiya, sozlama emas:
 * butun galereyani yaroqsiz qiladi va hammani qaytadan ro'yxatga olish
 * talab qiladi. Alohida endpoint (`POST /face-id/settings/model`) va
 * `confirm: true` ortida turadi — tasodifan bosilgan tanlov ertasiga
 * butun maktabni to'xtatib qo'yardi.
 */
const SettingsPage = () => {
  const { can } = usePermissions();
  const { data, isPending } = useQuery(faceIdQueries.settings());
  const { mutate: save, isPending: isSaving } = useUpdateFaceSettings();

  const [draft, setDraft] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const settings = data?.settings;
  const ranges = data?.ranges ?? {};
  const editable = can("faceId.settings");

  /**
   * ⚠️ RENDER PAYTIDA MOSLASH, `useEffect` EMAS. React'ning o'z naqshi
   * ("adjusting state when props change"): effekt ichida `setState`
   * qilish kaskadli render beradi va eski qiymat bir kadr ko'rinib
   * ketardi — sozlama ekranida bu "o'zgarishim yo'qoldi" bo'lib
   * ko'rinardi.
   *
   * ⚠️ `baseline` — serverdan kelgan OXIRGI nusxa. Draft bilan
   * taqqoslash (`dirty`) va "Qaytarish" tugmasi aynan shundan ishlaydi:
   * saqlangandan keyin server yangi nusxa qaytaradi va draft unga
   * tenglashadi.
   */
  if (settings && baseline !== settings) {
    setBaseline(settings);
    setDraft(settings);
  }

  if (isPending || !draft) return <LoaderCard />;

  const dirty = baseline && Object.keys(draft).some((key) => draft[key] !== baseline[key]);

  const handleSave = () => {
    setWarnings([]);
    save(draft, {
      onSuccess: (result) => {
        toast.success("Sozlama saqlandi");
        setWarnings(result?.warnings ?? []);
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Saqlanmadi"),
    });
  };

  return (
    <div className="space-y-4">
      {/* ── Saqlashdan keyingi ogohlantirishlar ── */}
      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-amber-900">
            <ShieldAlert className="size-4" />
            Saqlandi, lekin e'tibor bering
          </p>
          <ul className="mt-1.5 space-y-1">
            {warnings.map((warning) => (
              <li key={warning} className="text-[11.5px] leading-snug text-amber-800">
                · {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Bayroqlar ── */}
      <div className="rounded-2xl bg-white p-4 xs:p-5">
        <h2 className="font-semibold text-gray-900">Kimga ishlaydi</h2>
        <div className="mt-3 space-y-3">
          {SETTING_TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex items-start justify-between gap-4 border-t border-gray-100 pt-3 first:border-0 first:pt-0"
            >
              <span className="min-w-0">
                <span className="block text-[12.5px] font-medium text-gray-800">
                  {toggle.label}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-500">
                  {toggle.hint}
                </span>
              </span>

              <Switch
                disabled={!editable}
                checked={Boolean(draft[toggle.key])}
                onChange={(value) => setDraft((prev) => ({ ...prev, [toggle.key]: value }))}
              />
            </label>
          ))}
        </div>
      </div>

      {/* ── Raqamli maydonlar ── */}
      {SETTING_FIELDS.map((group) => (
        <div key={group.group} className="rounded-2xl bg-white p-4 xs:p-5">
          <h2 className="font-semibold text-gray-900">{group.group}</h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {group.items.map((field) => (
              <NumberField
                key={field.key}
                field={field}
                range={ranges[field.key]}
                value={draft[field.key]}
                disabled={!editable}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, [field.key]: value }))
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── Model (faqat ko'rish) ── */}
      <div className="rounded-2xl bg-white p-4 xs:p-5">
        <h2 className="font-semibold text-gray-900">Model</h2>
        <p className="mt-1 text-[12px] text-gray-500">
          Kiosk dasturidagi model bilan bir xil bo'lishi shart — server mos
          kelmagan kadrni rad etadi.
        </p>

        <div className="mt-3 grid gap-3 text-[12.5px] sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
            <p className="text-[11.5px] text-gray-500">Model</p>
            <p className="mt-0.5 font-medium text-gray-900">{draft.embeddingModel}</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
            <p className="text-[11.5px] text-gray-500">Vektor o'lchami</p>
            <p className="mt-0.5 font-medium text-gray-900">{draft.embeddingDim}</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
            <p className="text-[11.5px] text-gray-500">Galereya versiyasi</p>
            <p className="mt-0.5 font-medium text-gray-900">v{draft.galleryVersion}</p>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-[11.5px] leading-snug text-amber-800">
            Modelni almashtirish — <b>migratsiya</b>, sozlama emas: barcha
            saqlangan kadrlar taqqoslashdan chiqadi va hammani qaytadan
            ro'yxatga olish kerak bo'ladi. Shuning uchun u bu ekrandan
            o'zgartirilmaydi.
          </p>
        </div>
      </div>

      {/* ── Saqlash ── */}
      {editable && (
        <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-gray-200/60">
          <p className="text-[11.5px] text-gray-500">
            {settings.updatedAt
              ? `Oxirgi o'zgarish: ${formatDateTimeUz(settings.updatedAt)}`
              : "Hali o'zgartirilmagan"}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={!dirty || isSaving}
              onClick={() => setDraft(baseline)}
              className="gap-1.5"
            >
              <RotateCcw className="size-4" />
              Qaytarish
            </Button>
            <Button disabled={!dirty || isSaving} onClick={handleSave} className="gap-1.5">
              <Save className="size-4" />
              Saqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * RAQAMLI MAYDON — foiz yoki butun son.
 *
 * ⚠️ FOIZ EKRANDA, KASR BAZADA. Server 0..1 oralig'ida ishlaydi
 * (kosinus o'xshashlik shunday o'lchanadi), odam esa foizda o'ylaydi:
 * "62%" tushunarli, "0.62" esa nimaga nisbatan ekani noma'lum.
 * Almashtirish FAQAT shu komponentda — ikkinchi joyda qilinsa, bir
 * ekran foizni, boshqasi kasrni yuborib qo'yardi.
 */
const NumberField = ({ field, range, value, disabled, onChange }) => {
  const isPercent = Boolean(field.percent);
  const min = range?.min ?? 0;
  const max = range?.max ?? 100;

  const shown = isPercent ? Math.round((value ?? 0) * 1000) / 10 : (value ?? 0);
  const shownMin = isPercent ? Math.round(min * 1000) / 10 : min;
  const shownMax = isPercent ? Math.round(max * 1000) / 10 : max;

  const handleChange = (raw) => {
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    // ⚠️ Qisish SHU YERDA: server ham tekshiradi, lekin maydonga 500
    // yozib "saqlash" bosgan odam xato xabarini emas, to'g'ri qiymatni
    // ko'rishi kerak.
    const clamped = Math.max(shownMin, Math.min(shownMax, num));
    onChange(isPercent ? Math.round(clamped * 10) / 1000 : Math.round(clamped));
  };

  return (
    <FormRow label={field.label} hint={field.hint} danger={field.danger}>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          disabled={disabled}
          value={shown}
          min={shownMin}
          max={shownMax}
          step={isPercent ? 0.5 : 1}
          onChange={(e) => handleChange(e.target.value)}
          className={cn("max-w-28", field.danger && shown === 0 && "border-amber-400")}
        />
        <span className="text-[12px] text-gray-400">
          {isPercent ? "%" : ""} ({shownMin}–{shownMax})
        </span>
      </div>
    </FormRow>
  );
};

export default SettingsPage;
