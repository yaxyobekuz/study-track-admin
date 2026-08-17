// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useChangelogSettings } from "../queries/changelog.queries";
import {
  useSendChangelogNow,
  useUpdateChangelogSettings,
} from "../queries/changelog.mutations";

// Icons
import { Plus, Send, Trash2 } from "lucide-react";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Switch from "@/shared/components/ui/switch/Switch";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ChangelogNotificationLog from "./ChangelogNotificationLog";

// Data
import { DEFAULT_RECIPIENT, DEFAULT_SEND_TIME } from "../data/changelog.data";

const ChangelogSettingsTab = () => {
  const { data: settings, isLoading } = useChangelogSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateChangelogSettings();
  const { mutate: sendNow, isPending: isSending } = useSendChangelogNow();

  const { dailyEnabled, weeklyEnabled, sendTime, setField, setFields } = useObjectState({
    dailyEnabled: false,
    weeklyEnabled: false,
    sendTime: DEFAULT_SEND_TIME,
  });

  // Qatorlar — `ScheduleSettingsPage` dagi "draft" naqshi: birinchi tahrirgacha
  // `null`, ya'ni serverdagi qiymat to'g'ridan-to'g'ri ko'rsatiladi. Bu useEffect
  // ichida setState chaqirishdan qutqaradi (react-hooks/set-state-in-effect).
  const [draft, setDraft] = useState(null);
  const recipients = draft ?? settings?.recipients ?? [];

  useEffect(() => {
    if (!settings) return;

    setFields({
      dailyEnabled: settings.dailyEnabled ?? false,
      weeklyEnabled: settings.weeklyEnabled ?? false,
      sendTime: settings.sendTime || DEFAULT_SEND_TIME,
    });
  }, [settings]);

  const updateRecipient = (index, field, value) =>
    setDraft(
      recipients.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );

  const removeRecipient = (index) =>
    setDraft(recipients.filter((_, idx) => idx !== index));

  const addRecipient = () => setDraft([...recipients, { ...DEFAULT_RECIPIENT }]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Serverda ham tekshiriladi — bu yerda faqat tezroq javob berish uchun
    const filled = recipients.filter((r) => r.chatId.trim());
    const ids = filled.map((r) => r.chatId.trim());

    if (new Set(ids).size !== ids.length) {
      toast.error("Chat ID lar takrorlanmasligi kerak");
      return;
    }

    if (dailyEnabled && filled.length === 0) {
      toast.error("Xabarnoma yoqilgan, lekin birorta chat ID kiritilmagan");
      return;
    }

    updateSettings(
      { dailyEnabled, weeklyEnabled, sendTime, recipients: filled },
      {
        onSuccess: () => {
          // Draft'ni bo'shatamiz — endi serverdagi (normallashtirilgan) qiymat
          // ko'rsatiladi, ya'ni label bo'sh qolgan qatorlar chatId bilan to'ladi.
          setDraft(null);
          toast.success("Sozlamalar saqlandi");
        },
        onError: (error) =>
          toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const handleSendYesterday = () =>
    sendNow(
      {},
      {
        onSuccess: (res) => toast.success(res.message || "Yuborildi"),
        onError: (error) =>
          toast.error(error.response?.data?.message || "Yuborishda xatolik"),
      },
    );

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Xabarnomalar */}
        <Card className="p-4">
          <h2 className="mb-1 font-medium text-gray-900">Telegram xabarnomalari</h2>
          <p className="mb-4 text-xs text-gray-500">
            Bot har kuni ertalab kechagi kun uchun yozuv bo'lsa xabar yuboradi.
            Yozuv bo'lmasa hech narsa yubormaydi.
          </p>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Kunlik xabar</p>
              <p className="text-xs text-gray-500">
                Kechagi kun hisoboti belgilangan vaqtda yuboriladi
              </p>
            </div>
            <Switch
              checked={dailyEnabled}
              onChange={(v) => setField("dailyEnabled", v)}
            />
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <InputField
              name="sendTime"
              type="time"
              label="Yuborish vaqti"
              value={sendTime}
              className="max-w-48"
              description="Toshkent vaqti bilan"
              onChange={(e) => setField("sendTime", e.target.value)}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Haftalik yig'ma</p>
              <p className="text-xs text-gray-500">
                Har dushanba o'tgan hafta bo'yicha umumiy hisobot
              </p>
            </div>
            <Switch
              checked={weeklyEnabled}
              onChange={(v) => setField("weeklyEnabled", v)}
            />
          </div>

          {settings?.lastDailySentAt ? (
            <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
              Oxirgi yuborilgan: {formatUzDate(settings.lastDailySentAt)}
              {settings.lastDailySentDate
                ? ` (${formatUzDate(settings.lastDailySentDate)} hisoboti)`
                : ""}
            </p>
          ) : null}
        </Card>

        {/* Qabul qiluvchilar */}
        <Card className="p-4">
          <h2 className="mb-1 font-medium text-gray-900">Kimga yuborilsin</h2>
          <p className="mb-4 text-xs text-gray-500">
            Chat ID raqam (guruh uchun manfiy, masalan -1001234567890) yoki @username.
            Bot avval o'sha guruhga qo'shilgan bo'lishi kerak.
          </p>

          {recipients.length === 0 ? (
            <p className="py-4 text-center text-sm italic text-gray-500">
              Hali chat qo'shilmagan
            </p>
          ) : (
            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <InputField
                    label="Nomi"
                    className="min-w-40 flex-1"
                    value={recipient.label}
                    placeholder="Rahbariyat guruhi"
                    onChange={(e) => updateRecipient(index, "label", e.target.value)}
                  />

                  <InputField
                    label="Chat ID"
                    className="min-w-44 flex-1"
                    value={recipient.chatId}
                    placeholder="-1001234567890"
                    onChange={(e) => updateRecipient(index, "chatId", e.target.value)}
                  />

                  <div className="mb-2 flex items-center gap-2">
                    <Switch
                      checked={recipient.isActive !== false}
                      onChange={(v) => updateRecipient(index, "isActive", v)}
                    />
                    <span className="text-xs text-gray-500">Faol</span>
                  </div>

                  <button
                    type="button"
                    title="O'chirish"
                    onClick={() => removeRecipient(index)}
                    className="mb-1.5 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addRecipient}
            className="mt-3 w-full border-2 border-dashed text-gray-600 hover:border-blue-500 hover:text-blue-500"
          >
            <Plus className="size-4" strokeWidth={1.5} />
            Chat qo'shish
          </Button>
        </Card>

        {/* Amallar */}
        <div className="flex flex-wrap justify-end gap-3">
          <Can do="changelog.send">
            <Button
              type="button"
              variant="secondary"
              disabled={isSending}
              onClick={handleSendYesterday}
            >
              <Send className="size-4" strokeWidth={1.5} />
              {isSending ? "Yuborilmoqda..." : "Kechagi kunni yuborish"}
            </Button>
          </Can>

          <Can
            do="changelog.settings"
            fallback={
              <p className="text-sm text-gray-500">
                Sozlamalarni o'zgartirish uchun ruxsatingiz yo'q
              </p>
            }
          >
            <Button disabled={isSaving} className="w-full xs:w-40">
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </Can>
        </div>
      </form>

      <ChangelogNotificationLog />
    </div>
  );
};

export default ChangelogSettingsTab;
