// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Eye } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Notice from "./Notice";

// Queries & helpers
import {
  useInspectSheet,
  useSaveSyncConfig,
} from "../queries/scheduleSync.mutations";
import { notifySyncError } from "../helpers/scheduleSync.helpers";

/**
 * SHEET HAVOLASINI SOZLASH — fayl, varaq va avtomatik tekshirish.
 *
 * Varaq ro'yxati serverdan olinadi ("Varaqlarni ko'rish"): nomni qo'lda
 * yozish xato varaqqa ulanib qolish yo'li bo'lardi. Ro'yxat QAYSI havola
 * uchun olingani eslab qolinadi — havola o'zgarsa, eski ro'yxat bilan
 * saqlab bo'lmaydi.
 */
const ConfigModal = () => (
  <ResponsiveModal
    name="scheduleSyncConfig"
    title="Sheet havolasini sozlash"
    description="Jadval o'qiladigan Google Sheets fayli va varag'i."
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  sheetUrl = "",
  sheetTab = "",
  autoCheck = false,
}) => {
  const [url, setUrl] = useState(sheetUrl || "");
  // Joriy sozlama bor bo'lsa — uning varag'i tayyor ro'yxat: faqat
  // avtomatik tekshirishni o'zgartirish uchun qayta so'rov shart emas.
  const [inspected, setInspected] = useState(() =>
    sheetUrl && sheetTab ? { url: sheetUrl, tabs: [sheetTab] } : null,
  );
  const [tab, setTab] = useState(sheetTab || "");
  const [auto, setAuto] = useState(Boolean(autoCheck));

  const { mutate: inspect, isPending: isInspecting } = useInspectSheet();
  const { mutate: saveConfig } = useSaveSyncConfig();

  const trimmedUrl = url.trim();
  const tabs = inspected?.url === trimmedUrl ? inspected.tabs : [];
  const canSave = Boolean(trimmedUrl && tab && tabs.includes(tab));

  const handleInspect = () => {
    if (!trimmedUrl) return;

    inspect(trimmedUrl, {
      onSuccess: (data) => {
        const list = data?.tabs ?? [];
        setInspected({ url: trimmedUrl, tabs: list });
        setTab((prev) => (list.includes(prev) ? prev : list[0] ?? ""));
        if (list.length === 0) {
          toast.warning("Faylda ko'rinadigan varaq topilmadi");
        }
      },
      onError: (err) => notifySyncError(err),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;

    setIsLoading(true);
    saveConfig(
      { sheetUrl: trimmedUrl, sheetTab: tab, autoCheck: auto },
      {
        onSuccess: () => {
          close();
          toast.success("Sheet sozlamalari saqlandi");
        },
        onError: (err) => notifySyncError(err),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <Notice tone="info" title="Fayl havola orqali ochiq bo'lishi kerak">
        Google Sheets'da "Ulashish" → "Havolaga ega har kim ko'ra oladi"
        (faqat ko'rish) ni tanlang. Tahrirlash huquqi berish shart emas.
      </Notice>

      <div className="space-y-2">
        <InputField
          required
          type="url"
          name="sheetUrl"
          label="Sheet havolasi"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!trimmedUrl || isInspecting || isLoading}
          onClick={handleInspect}
        >
          <Eye className="size-4" strokeWidth={1.5} />
          Varaqlarni ko'rish{isInspecting && "..."}
        </Button>
      </div>

      <SelectField
        name="sheetTab"
        label="Varaq"
        value={tab}
        disabled={tabs.length === 0 || isLoading}
        placeholder={tabs.length ? "Varaqni tanlang" : "Avval varaqlarni ko'ring"}
        options={tabs.map((name) => ({ label: name, value: name }))}
        onChange={setTab}
        description="Faqat ko'rinadigan (yashirilmagan) varaqlar ko'rsatiladi"
      />

      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="space-y-0.5">
          <span className="block text-sm font-medium text-gray-900">
            Avtomatik tekshirish
          </span>
          <span className="block text-xs text-gray-500">
            Sheet vaqti-vaqti bilan o'zi o'qiladi. O'zgarish baribir faqat
            tasdiqlangandan keyin qo'llanadi.
          </span>
        </span>
        <Switch checked={auto} onChange={setAuto} disabled={isLoading} />
      </label>

      <div className="flex flex-col-reverse gap-3.5 w-full xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={!canSave || isLoading}>
          Saqlash{isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default ConfigModal;
