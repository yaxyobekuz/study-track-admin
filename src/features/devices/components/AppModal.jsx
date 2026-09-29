// Toast
import { toast } from "sonner";

// Icons
import { Save, ShieldCheck } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens, data & queries
import { T } from "../data/guard.tokens";
import { APP_CATEGORIES } from "../data/devices.data";
import { useCreateApp, useUpdateApp } from "../queries/devices.mutations";

/**
 * ILOVA KARTOCHKASI — bitta ilova, IKKALA identifikator bilan.
 *
 * ⚠️ BITTA ILOVA — BITTA QATOR. Android paketi va iOS bundle id bitta
 * yozuvda turadi: admin "YouTube" ni tanlaydi, server esa qurilma
 * platformasiga mosini yuboradi. Ikki alohida yozuv bo'lsa, siyosatni
 * ikki marta sozlash kerak bo'lardi va biri albatta unutilardi.
 *
 * ⚠️ «MAJBURIY» BELGISI — KUCHLI QAROR: bunday ilovani hech bir siyosat
 * bloklay olmaydi. Raqam terish, kontaktlar va MBSI ilovasi uchun.
 * Oyna buni ochiq yozadi, chunki belgini tasodifan qo'yish cheklovda
 * teshik qoldirardi.
 */
const AppModal = () => (
  <ResponsiveModal
    name="deviceApp"
    title="Ilova"
    description="Identifikatorni telefon aytadi — uni «Yangi aniqlangan» ro'yxatidan olish eng oson yo'l."
    className="max-w-lg"
  >
    <AppForm />
  </ResponsiveModal>
);

/**
 * ⚠️ FORMA `key` BILAN QAYTA YARATILADI, effekt bilan to'ldirilmaydi.
 * `ResponsiveModal` bolani `cloneElement` bilan yangi proplar berib
 * chizadi, ya'ni komponent qayta o'rnatilmaydi — boshqa ilova tanlansa
 * eski qiymatlar formada qolib ketardi. `key` shu muammoni ildizidan
 * yechadi (`PolicyEditorModal` bilan AYNI naqsh).
 */
const AppForm = ({ close, setIsLoading, app }) => (
  <AppFormBody key={app?.id ?? "new"} app={app} close={close} setIsLoading={setIsLoading} />
);

const AppFormBody = ({ close, setIsLoading, app }) => {
  const isEdit = Boolean(app?.id);

  const { state, setFields } = useObjectState({
    name: app?.name ?? "",
    category: app?.category ?? "boshqa",
    androidPackage: app?.androidPackage ?? "",
    iosBundleId: app?.iosBundleId ?? "",
    isEssential: Boolean(app?.isEssential),
  });

  const { mutate: createApp } = useCreateApp();
  const { mutate: updateApp } = useUpdateApp();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!state.name.trim()) return toast.error("Ilova nomini kiriting");
    if (!state.androidPackage.trim() && !state.iosBundleId.trim()) {
      return toast.error("Kamida bitta identifikator kerak");
    }

    const payload = {
      name: state.name.trim(),
      category: state.category,
      androidPackage: state.androidPackage.trim(),
      iosBundleId: state.iosBundleId.trim(),
      isEssential: state.isEssential,
    };

    setIsLoading(true);
    const onDone = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Ilova saqlandi" : "Ilova qo'shildi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Saqlanmadi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updateApp({ id: app.id, data: payload }, onDone);
    else createApp(payload, onDone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={cn(T.label, "mb-1.5")}>Nomi *</p>
          <Input
            value={state.name}
            onChange={(e) => setFields({ name: e.target.value })}
            placeholder="YouTube"
            maxLength={120}
          />
        </div>
        <div>
          <p className={cn(T.label, "mb-1.5")}>Turi</p>
          <Select
            value={state.category}
            options={APP_CATEGORIES}
            onChange={(value) => setFields({ category: value })}
          />
        </div>
      </div>

      <div>
        <p className={cn(T.label, "mb-1.5")}>Android paketi</p>
        <Input
          value={state.androidPackage}
          onChange={(e) => setFields({ androidPackage: e.target.value })}
          placeholder="com.google.android.youtube"
          className="font-mono text-[12px]"
        />
      </div>

      <div>
        <p className={cn(T.label, "mb-1.5")}>iOS bundle id</p>
        <Input
          value={state.iosBundleId}
          onChange={(e) => setFields({ iosBundleId: e.target.value })}
          placeholder="com.google.ios.youtube"
          className="font-mono text-[12px]"
        />
        <p className={cn(T.hint, "mt-1")}>
          Ikkalasini to'ldirish tavsiya etiladi: bo'sh qolgan platformada qoida
          qo'llanmaydi.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3">
        <input
          type="checkbox"
          checked={state.isEssential}
          onChange={(e) => setFields({ isEssential: e.target.checked })}
          className="mt-0.5 size-4 shrink-0 accent-emerald-600"
        />
        <span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-900">
            <ShieldCheck className="size-3.5" strokeWidth={2} />
            Majburiy ilova — hech qachon bloklanmaydi
          </span>
          <span className={cn(T.hint, "mt-0.5 block text-emerald-700")}>
            Raqam terish, kontaktlar va MBSI ilovasi uchun. Bunday ilovani
            birorta siyosat yopa olmaydi.
          </span>
        </span>
      </label>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="size-4" />
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default AppModal;
