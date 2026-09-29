// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Clock, Unlock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import StudentPicker from "./StudentPicker";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens, data & queries
import { T } from "../data/guard.tokens";
import { UNLOCK_DURATIONS } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";
import { useCreateUnlock } from "../queries/devices.mutations";

const KINDS = [
  { value: "full", label: "Butun cheklovni to'xtatish" },
  { value: "app", label: "Bitta ilovaga qo'shimcha vaqt" },
];

/**
 * VAQTINCHALIK OCHISH — "bugun kechqurun ochib ber", "yana 30 daqiqa".
 *
 * ⚠️ MUDDATSIZ VARIANT YO'Q va ro'yxatda 24 soatdan uzun tanlov ham
 * ko'rsatilmaydi: server ham shuni rad etadi (`MAX_UNLOCK_HOURS`).
 * Ro'yxatda turib server rad etsa, bu "tizim buzuq" bo'lib ko'rinardi.
 *
 * ⚠️ SABAB MAJBURIY. Chekovni yumshatgan qaror sababsiz qolsa, keyin
 * "nega bu bolada cheklov ishlamagan" degan savolga javob bo'lmasdi —
 * audit qatorida faqat "kimdir ochgan" yozilib qolardi.
 *
 * ⚠️ KO'P O'QUVCHI BIRDANIGA: "bugun 9-A ga qo'shimcha vaqt". Har
 * o'quvchiga ALOHIDA yozuv yoziladi (server tomonda ham) — keyin har
 * biri o'zicha bekor qilinadi.
 */
const UnlockModal = () => (
  <ResponsiveModal
    name="deviceUnlock"
    title="Vaqtinchalik ochish"
    description="Cheklov belgilangan muddatga yumshatiladi. Muddat tugagach avvalgi qoida o'z-o'zidan qaytadi."
    className="max-w-lg"
  >
    <UnlockForm />
  </ResponsiveModal>
);

const UnlockForm = ({ close, setIsLoading, studentId, studentName }) => {
  const [studentIds, setStudentIds] = useState(studentId ? [studentId] : []);
  const { state, setFields } = useObjectState({
    kind: "full",
    appId: "",
    extraMinutes: 30,
    durationMinutes: 120,
    reason: "",
    note: "",
  });

  const { data: apps = [] } = useQuery({
    ...devicesQueries.appOptions(),
    enabled: state.kind === "app",
  });

  const { mutate: createUnlock } = useCreateUnlock();

  const appOptions = apps.map((app) => ({ value: app.id, label: app.name }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (studentIds.length === 0) return toast.error("O'quvchini tanlang");
    if (!state.reason.trim()) return toast.error("Sabab majburiy");
    if (state.kind === "app" && !state.appId) return toast.error("Ilovani tanlang");

    setIsLoading(true);
    createUnlock(
      {
        studentIds,
        kind: state.kind,
        durationMinutes: Number(state.durationMinutes),
        reason: state.reason.trim(),
        note: state.note.trim(),
        ...(state.kind === "app"
          ? { appId: state.appId, extraMinutes: Number(state.extraMinutes) }
          : {}),
      },
      {
        onSuccess: (res) => {
          close();
          toast.success(res?.message || "Vaqtinchalik ruxsat berildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Ruxsat berilmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* O'quvchi — qator orqali kelgan bo'lsa tanlagich ko'rsatilmaydi */}
      {studentId ? (
        <div className="rounded-xl bg-slate-50/80 px-3.5 py-2.5">
          <p className={T.label}>O'quvchi</p>
          <p className={cn(T.tdName, "mt-0.5")}>{studentName}</p>
        </div>
      ) : (
        <div>
          <p className={cn(T.label, "mb-1.5")}>O'quvchilar</p>
          <StudentPicker value={studentIds} onChange={setStudentIds} multiple />
        </div>
      )}

      <div>
        <p className={cn(T.label, "mb-1.5")}>Nima ochiladi</p>
        <Select
          value={state.kind}
          options={KINDS}
          onChange={(value) => setFields({ kind: value })}
        />
      </div>

      {state.kind === "app" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={cn(T.label, "mb-1.5")}>Ilova</p>
            <Select
              value={state.appId}
              options={appOptions}
              placeholder="Tanlang"
              onChange={(value) => setFields({ appId: value })}
            />
          </div>
          <div>
            <p className={cn(T.label, "mb-1.5")}>Qo'shimcha daqiqa</p>
            <Input
              type="number"
              min={1}
              max={1440}
              value={state.extraMinutes}
              onChange={(e) => setFields({ extraMinutes: e.target.value })}
            />
          </div>
        </div>
      )}

      <div>
        <p className={cn(T.label, "mb-1.5")}>Qancha vaqtga</p>
        <Select
          value={String(state.durationMinutes)}
          options={UNLOCK_DURATIONS.map((d) => ({ value: String(d.value), label: d.label }))}
          onChange={(value) => setFields({ durationMinutes: value })}
        />
        <p className={cn(T.hint, "mt-1 flex items-center gap-1")}>
          <Clock className="size-3" />
          Muddat tugagach avvalgi qoida o'z-o'zidan qaytadi
        </p>
      </div>

      <div>
        <p className={cn(T.label, "mb-1.5")}>Sabab *</p>
        <Input
          value={state.reason}
          onChange={(e) => setFields({ reason: e.target.value })}
          placeholder="Masalan: uy vazifasi uchun video kerak"
          maxLength={300}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1">
          <Unlock className="size-4" />
          Ruxsat berish
        </Button>
      </div>
    </form>
  );
};

export default UnlockModal;
