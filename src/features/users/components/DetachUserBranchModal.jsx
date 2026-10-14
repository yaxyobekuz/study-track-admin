// Toast
import { toast } from "sonner";

// React
import { useMemo } from "react";

// Icons
import { TriangleAlert } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useDetachUserBranch } from "@/features/users/queries/users.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * XODIMNI FILIALDAN CHIQARISH — istalgan filialdan, asosiysi ham.
 *
 * Asosiy filial alohida muomala talab qiladi: login AYNAN o'sha filialga
 * tushadi (`platform.user_directory.branchId`), ya'ni uni shunchaki olib
 * tashlash odamni tizimdan butunlay chiqarib yuborardi. Shuning uchun bu
 * modal "login endi qayerga tushadi" degan savolni SO'RAYDI va javobni
 * serverga `nextHomeBranchId` bilan uzatadi.
 *
 * Qolgan filial bittagina bo'lsa so'ralmaydi — boshqa variant yo'q.
 */
const DetachUserBranchModal = () => (
  <ResponsiveModal name="detachUserBranch" title="Filialdan chiqarish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, user, row, rows = [] }) => {
  const { mutate: detach } = useDetachUserBranch();

  // Chiqarilgandan keyin qoladigan filiallar — yangi "asosiy" shulardan
  // tanlanadi.
  const rest = useMemo(
    () => rows.filter((r) => r.branch.id !== row?.branch.id),
    [rows, row],
  );

  const needsHome = Boolean(row?.isHome) && rest.length > 1;

  const { nextHomeBranchId, setField } = useObjectState({
    nextHomeBranchId: rest.length === 1 ? rest[0].branch.id : "",
  });

  const options = useMemo(
    () => rest.map((r) => ({ label: r.branch.name, value: r.branch.id })),
    [rest],
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (needsHome && !nextHomeBranchId) {
      return toast.error("Login qaysi filialga tushishini tanlang");
    }

    setIsLoading(true);

    detach(
      {
        id: user.id,
        branchId: row.branch.id,
        // Asosiy bo'lmagan filialda bu kerak emas — server ham so'ramaydi
        nextHomeBranchId: row.isHome ? nextHomeBranchId : undefined,
      },
      {
        onSuccess: () => {
          close();
          toast.success(`"${row.branch.name}" filialidan chiqarildi`);
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  // Yagona filial — chiqarib bo'lmaydi: ko'chiriladigan "uy" qolmaydi.
  // Server ham rad etadi, lekin tugmani bosib xato olishdan ko'ra sababni
  // oldindan aytish to'g'riroq.
  if (rest.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Bu xodimning yagona filiali — chiqarilsa tizimga kira olmaydi. Uni
          butunlay chiqarish uchun <b>arxivlang</b>.
        </p>
        <Button type="button" onClick={close} className="w-full">
          Yopish
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <p className="text-sm text-gray-600">
        Xodim <b>"{row.branch.name}"</b> filialidan chiqariladi va u yerda
        tizimga kira olmaydi.
      </p>

      {needsHome && (
        <SelectField
          required
          label="Login qaysi filialga tushsin?"
          value={nextHomeBranchId}
          options={options}
          placeholder="Filialni tanlang"
          description="Xodim tizimga aynan shu filial orqali kiradi"
          onChange={(value) => setField("nextHomeBranchId", value)}
        />
      )}

      {row.isHome && !needsHome && (
        <p className="rounded-xl bg-blue-50 px-3.5 py-3 text-sm text-blue-800">
          Login <b>"{rest[0].branch.name}"</b> filialiga o'tadi — xodimning
          qolgan yagona filiali shu.
        </p>
      )}

      {row.isHome && (
        <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          <TriangleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          Botdagi bog'lanish uziladi — xodim botga qaytadan kirishi kerak.
        </p>
      )}

      <p className="text-sm text-gray-500">
        Davomat, jarima va oylik tarixi <b>"{row.branch.name}"</b> filialida
        qoladi — hisobotlardan yo'qolmaydi. Keyinroq qaytarib biriktirish
        mumkin.
      </p>

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          onClick={close}
          className="flex-1"
        >
          Bekor qilish
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          Chiqarish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default DetachUserBranchModal;
