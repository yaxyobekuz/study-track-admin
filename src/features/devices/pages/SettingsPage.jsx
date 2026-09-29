// React
import { useEffect } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Lock, Power, Save, ShieldCheck, Sliders } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Switch from "@/shared/components/ui/switch/Switch";
import Panel from "../components/Panel";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens, data & queries
import { SURFACE, T } from "../data/guard.tokens";
import { OFFLINE_POLICIES } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";
import { useUpdateDeviceSettings } from "../queries/devices.mutations";

const FIELDS = [
  {
    key: "enrollmentCodeTtlMinutes",
    label: "Biriktirish kodi qancha amal qiladi",
    unit: "daqiqa",
    hint: "Kod bir martalik. Muddati o'tgach yangisini berish kerak.",
  },
  {
    key: "offlineGraceMinutes",
    label: "Qancha vaqtdan keyin «oflayn» deb belgilansin",
    unit: "daqiqa",
    hint: "Oflayn qurilma buzuq emas — internet uzilgan bo'lishi mumkin.",
  },
  {
    key: "syncIntervalMinutes",
    label: "Telefon qoidani qancha vaqtda qayta so'rasin",
    unit: "daqiqa",
    hint: "Bildirishnoma yetmasa ham telefon yangi qoidani shu oraliqda oladi.",
  },
  {
    key: "usageRetentionDays",
    label: "Foydalanish hisoboti qancha saqlansin",
    unit: "kun",
    hint: "Undan eskisi kechasi o'chiriladi. Cheksiz saqlash asossiz bo'lardi.",
  },
];

/**
 * SOZLAMALAR — modulning favqulodda tugmasi va to'rtta raqam.
 *
 * ⚠️ «NAZORATNI YOQISH» — BUTUN MAKTABGA TA'SIR QILADIGAN BITTA BAYROQ.
 * O'chirilganda siyosat va biriktirishlar JOYIDA QOLADI, faqat
 * telefonlarda hech narsa bajarilmaydi. Shuning uchun u eng tepada,
 * alohida kartada turadi — "tizim noto'g'ri ishlayapti, bolalar
 * telefonsiz qoldi" holatida ikkilanmasdan bosiladigan tugma bo'lishi
 * kerak.
 *
 * ⚠️ O'ZGARMAS QOIDALAR SOZLAMA EMAS, lekin EKRANDA KO'RSATILADI:
 * favqulodda qo'ng'iroq doim ochiq, ochish ko'pi bilan 24 soat, mazmun
 * yig'ilmaydi. Hujjatda qolib ketgan qoidani hech kim o'qimaydi —
 * ekranda turgani esa e'tiroz bildirish imkonini beradi.
 */
const SettingsPage = () => {
  const { can } = usePermissions();
  const canEdit = can("devices.settings");

  const { data, isLoading, isError } = useQuery(devicesQueries.settings());
  const { mutate: updateSettings, isPending } = useUpdateDeviceSettings();

  const { state, setFields } = useObjectState({
    enrollmentCodeTtlMinutes: 15,
    offlineGraceMinutes: 120,
    syncIntervalMinutes: 30,
    usageRetentionDays: 180,
    offlinePolicy: "keepLast",
  });

  useEffect(() => {
    if (!data) return;
    setFields({
      enrollmentCodeTtlMinutes: data.enrollmentCodeTtlMinutes,
      offlineGraceMinutes: data.offlineGraceMinutes,
      syncIntervalMinutes: data.syncIntervalMinutes,
      usageRetentionDays: data.usageRetentionDays,
      offlinePolicy: data.offlinePolicy,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.updatedAt]);

  const save = (payload, message) =>
    updateSettings(payload, {
      onSuccess: () => toast.success(message),
      onError: (err) => toast.error(err.response?.data?.message || "Saqlanmadi"),
    });

  const limits = data?.limits || {};

  return (
    <div className="flex flex-col gap-3">
      {/* ── Favqulodda tugma ── */}
      <Panel
        title="Qurilma nazorati"
        hint="O'chirilganda siyosatlar saqlanib qoladi, lekin telefonlarda bajarilmaydi"
        icon={Power}
        tone={data?.enabled ? "open" : "blocked"}
        isLoading={isLoading}
        isError={isError}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-slate-900">
              {data?.enabled ? "Yoqilgan — qoidalar bajarilyapti" : "O'chirilgan"}
            </p>
            <p className={cn(T.hint, "mt-0.5 max-w-lg")}>
              {data?.enabled
                ? "Har bir telefon o'z siyosatini oladi va uni bajaradi."
                : "Barcha telefonlar cheklovsiz ishlayapti. Yoqilganda avvalgi qoidalar o'z-o'zidan tiklanadi."}
            </p>
          </div>

          <Switch
            checked={Boolean(data?.enabled)}
            disabled={!canEdit || isPending}
            onCheckedChange={(checked) =>
              save(
                { enabled: checked },
                checked ? "Qurilma nazorati yoqildi" : "Qurilma nazorati o'chirildi",
              )
            }
          />
        </div>
      </Panel>

      {/* ── O'zgarmas qoidalar ── */}
      <Panel
        title="O'zgarmas qoidalar"
        hint="Bular sozlama emas — modulning asosiga kiritilgan va o'chirilmaydi"
        icon={Lock}
        tone="open"
      >
        <ul className="space-y-2.5">
          <HardRule
            title="Favqulodda qo'ng'iroq doim ochiq"
            detail="Telefon to'liq bloklangan holatda ham raqam terish va favqulodda xizmatlar ishlaydi. Bloklangan telefon bolani yordam so'rashdan mahrum qila olmaydi."
          />
          <HardRule
            title="Mazmun o'qilmaydi"
            detail="Faqat ilova nomi, daqiqa va ochilish soni saqlanadi. Xabar, kontakt, surat, brauzer tarixi va joylashuv yig'ilmaydi."
          />
          <HardRule
            title="O'quvchi o'z qoidasini ko'radi"
            detail="Qaysi siyosat, qaysi ilovalar, qancha vaqt — hammasi o'quvchining o'z ekranida ochiq turadi. Yashirin kuzatuv rejimi yo'q."
          />
          <HardRule
            title={`Vaqtinchalik ochish ko'pi bilan ${data?.hardRules?.maxUnlockHours || 24} soat`}
            detail="Muddatsiz ochish chekovni jimgina abadiy o'chirib qo'yardi. Uzoqroq kerak bo'lsa — siyosatni o'zgartiring."
          />
        </ul>
      </Panel>

      {/* ── Raqamlar ── */}
      <Panel
        title="Ish rejimi"
        hint="Kod muddati, oflayn chegarasi, sinxronizatsiya va hisobot saqlash muddati"
        icon={Sliders}
        tone="allowed"
        isLoading={isLoading}
        isError={isError}
      >
        <div className="space-y-3.5">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-slate-800">{field.label}</p>
                <p className={cn(T.hint, "mt-0.5")}>{field.hint}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Input
                  type="number"
                  className="h-9 w-24"
                  disabled={!canEdit}
                  min={limits[field.key]?.min}
                  max={limits[field.key]?.max}
                  value={state[field.key]}
                  onChange={(e) => setFields({ [field.key]: e.target.value })}
                />
                <span className="text-[11.5px] text-slate-400">{field.unit}</span>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-slate-800">
                Internet yo'qolganda (sukut)
              </p>
              <p className={cn(T.hint, "mt-0.5")}>
                Siyosatda alohida ko'rsatilmagan bo'lsa shu qo'llanadi.
              </p>
            </div>
            <Select
              triggerClassName="h-9 min-w-52"
              value={state.offlinePolicy}
              disabled={!canEdit}
              options={OFFLINE_POLICIES.map((m) => ({ value: m.value, label: m.label }))}
              onChange={(value) => setFields({ offlinePolicy: value })}
            />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-1">
              <Button
                onClick={() =>
                  save(
                    {
                      enrollmentCodeTtlMinutes: Number(state.enrollmentCodeTtlMinutes),
                      offlineGraceMinutes: Number(state.offlineGraceMinutes),
                      syncIntervalMinutes: Number(state.syncIntervalMinutes),
                      usageRetentionDays: Number(state.usageRetentionDays),
                      offlinePolicy: state.offlinePolicy,
                    },
                    "Sozlamalar saqlandi",
                  )
                }
              >
                <Save className="size-4" />
                Saqlash
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};

const HardRule = ({ title, detail }) => (
  <li className={cn(SURFACE.inset, "flex items-start gap-2.5 px-3.5 py-3")}>
    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={2} />
    <div className="min-w-0">
      <p className="text-[12.5px] font-medium text-slate-900">{title}</p>
      <p className={cn(T.hint, "mt-0.5")}>{detail}</p>
    </div>
  </li>
);

export default SettingsPage;
