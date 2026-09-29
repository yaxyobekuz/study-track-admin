// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Pause, Play, Trash2, TriangleAlert } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens & queries
import { T } from "../data/guard.tokens";
import {
  usePauseDevice,
  useRemoveDevice,
  useResumeDevice,
} from "../queries/devices.mutations";

/**
 * QURILMA AMALLARI — to'xtatish, qayta yoqish, olib tashlash.
 *
 * ⚠️ UCH AMAL, UCH XIL OG'IRLIK va oyna buni matnda ajratadi:
 *   · TO'XTATISH  — vaqtinchalik, qurilma ro'yxatda qoladi;
 *   · YOQISH      — orqaga qaytarish, sababsiz;
 *   · OLIB TASHLASH — cheklov butunlay tugaydi, SABAB MAJBURIY.
 *
 * ⚠️ Sabab faqat olib tashlashda majburiy, chunki aynan u ORQAGA
 * QAYTARILMAYDIGAN qaror: qurilma qayta biriktirilishi uchun o'quvchiga
 * yangi kod kerak bo'ladi.
 */
const DeviceActionModals = () => (
  <>
    <ResponsiveModal
      name="devicePause"
      title="Cheklovni to'xtatish"
      description="Telefon cheklovsiz ishlaydi, lekin qurilma ro'yxatda qoladi va istalgan payt qayta yoqiladi."
    >
      <PauseForm />
    </ResponsiveModal>

    <ResponsiveModal
      name="deviceResume"
      title="Cheklovni qayta yoqish"
      description="Qurilmaga amaldagi siyosat yana qo'llanadi."
    >
      <ResumeForm />
    </ResponsiveModal>

    <ResponsiveModal
      name="deviceRemove"
      title="Qurilmani olib tashlash"
      description="Cheklov butunlay tugaydi. Qayta biriktirish uchun o'quvchiga yangi kod kerak bo'ladi."
    >
      <RemoveForm />
    </ResponsiveModal>
  </>
);

/** Qurilma sarlavhasi — uchala oynada bir xil. */
const DeviceHeading = ({ device }) => (
  <div className="rounded-xl bg-slate-50/80 px-3.5 py-2.5">
    <p className={T.tdName}>{device?.label || "Qurilma"}</p>
    <p className={cn(T.hint, "mt-0.5")}>
      {[device?.manufacturer, device?.model].filter(Boolean).join(" ") || device?.platform}
    </p>
  </div>
);

const PauseForm = ({ close, setIsLoading, device }) => {
  const [reason, setReason] = useState("");
  const { mutate: pauseDevice } = usePauseDevice();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    pauseDevice(
      { id: device.id, reason: reason.trim() },
      {
        onSuccess: () => {
          close();
          toast.success("Cheklov to'xtatildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "To'xtatilmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DeviceHeading device={device} />

      <div>
        <p className={cn(T.label, "mb-1.5")}>Sabab</p>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ixtiyoriy"
          maxLength={300}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1">
          <Pause className="size-4" />
          To'xtatish
        </Button>
      </div>
    </form>
  );
};

const ResumeForm = ({ close, setIsLoading, device }) => {
  const { mutate: resumeDevice } = useResumeDevice();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    resumeDevice(device.id, {
      onSuccess: () => {
        close();
        toast.success("Cheklov qayta yoqildi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Yoqilmadi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DeviceHeading device={device} />

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1">
          <Play className="size-4" />
          Qayta yoqish
        </Button>
      </div>
    </form>
  );
};

const RemoveForm = ({ close, setIsLoading, device }) => {
  const [reason, setReason] = useState("");
  const { mutate: removeDevice } = useRemoveDevice();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ⚠️ Server ham talab qiladi — bu yerda faqat tezroq aytish uchun.
    if (!reason.trim()) return toast.error("Olib tashlash sababi majburiy");

    setIsLoading(true);
    removeDevice(
      { id: device.id, reason: reason.trim() },
      {
        onSuccess: () => {
          close();
          toast.success("Qurilma olib tashlandi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Olib tashlanmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DeviceHeading device={device} />

      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={2} />
        <p className="text-[12px] leading-relaxed text-amber-900">
          Ekran vaqti tarixi saqlanib qoladi, lekin telefonda hech qanday
          cheklov qolmaydi.
        </p>
      </div>

      <div>
        <p className={cn(T.label, "mb-1.5")}>Sabab *</p>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Masalan: telefon almashtirildi"
          maxLength={300}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="destructive" className="flex-1">
          <Trash2 className="size-4" />
          Olib tashlash
        </Button>
      </div>
    </form>
  );
};

export default DeviceActionModals;
