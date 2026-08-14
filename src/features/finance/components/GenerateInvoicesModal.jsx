// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert } from "lucide-react";

// Hooks
import { useGenerateInvoices } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatMonthKey } from "@/shared/helpers/month.helpers";

/**
 * Oylik majburiyatlarni shakllantirish.
 *
 * Ikki bosqichli: avval `dryRun` — kimga qancha yozilishi va kim tushib
 * qolishi ko'rsatiladi, keyin tasdiq. Bu amal real qarz yaratadi, shuning
 * uchun ko'r-ko'rona bosiladigan tugma bo'lmasligi kerak.
 */
const GenerateInvoicesModal = () => (
  <ResponsiveModal
    name="generateInvoices"
    title="Majburiyat shakllantirish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, month }) => {
  const [preview, setPreview] = useState(null);
  const { mutate: generate } = useGenerateInvoices();

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const runPreview = () => {
    setIsLoading(true);
    generate(
      { month, dryRun: true },
      {
        onSuccess: (summary) => setPreview(summary),
        onError: handleError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const runReal = () => {
    setIsLoading(true);
    generate(
      { month },
      {
        onSuccess: (summary) => {
          close();
          toast.success(
            `${summary.created} ta majburiyat shakllantirildi (${formatMoney(summary.totalAmount)})`,
          );
        },
        onError: handleError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const skipped = preview?.skipped;
  const hasIssues =
    skipped && (skipped.noTariff > 0 || skipped.noPrice > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">Oy</p>
        <p className="font-medium text-gray-900">{formatMonthKey(month)}</p>
      </div>

      {!preview ? (
        <p className="text-sm text-gray-500">
          Avval qaysi o'quvchilarga qancha summa yozilishini ko'ramiz. Bu
          bosqichda bazaga hech narsa yozilmaydi.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Yaratiladi</p>
              <p className="text-lg font-semibold text-gray-900">
                {preview.created}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Umumiy summa</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatMoney(preview.totalAmount)}
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-0.5">
            <p>Allaqachon mavjud: {skipped.alreadyExists}</p>
            <p>Muzlatilgan: {skipped.frozen} · Chetlatilgan: {skipped.expelled}</p>
            <p>Tarifsiz: {skipped.noTariff} · Narxsiz: {skipped.noPrice}</p>
          </div>

          {/* Tarifsiz/narxsiz o'quvchilar — konfiguratsiya bo'shlig'i, admin
              avval tuzatib, keyin qayta ishga tushirishi mumkin */}
          {hasIssues && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <TriangleAlert className="size-4 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium">
                  Ba'zi o'quvchilarga majburiyat yozilmaydi
                </p>
                <p className="mt-0.5 line-clamp-3">
                  {[...preview.details.noTariff, ...preview.details.noPrice]
                    .slice(0, 8)
                    .map((s) => s.fullName)
                    .join(", ")}
                  {preview.details.truncated && " va boshqalar"}
                </p>
              </div>
            </div>
          )}

          {preview.created === 0 && (
            <p className="text-sm text-gray-500">
              Yangi majburiyat yaratilmaydi — hammasi allaqachon shakllantirilgan.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        {!preview ? (
          <Button
            type="button"
            autoFocus
            onClick={runPreview}
            disabled={isLoading}
            className="w-full xs:w-40"
          >
            Ko'rib chiqish
            {isLoading && "..."}
          </Button>
        ) : (
          <Button
            type="button"
            autoFocus
            onClick={runReal}
            disabled={isLoading || preview.created === 0}
            className="w-full xs:w-40"
          >
            Tasdiqlash
            {isLoading && "..."}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GenerateInvoicesModal;
