// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateVacationMonth } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import { formatMonthKey } from "@/shared/helpers/month.helpers";

/**
 * Oyni ta'til deb belgilash.
 *
 * O'sha oyda hech bir o'quvchiga to'lov yozilmaydi va o'quvchi panelida
 * "Ta'til" deb ko'rinadi. Bitta o'quvchini to'xtatish uchun bu emas,
 * "Muzlatish" ishlatiladi.
 *
 * Agar o'sha oyga hisob-faktura ALLAQACHON chiqarilgan bo'lsa, server
 * ularni avtomatik bekor QILMAYDI — ogohlantirish qaytaradi va admin
 * ongli ravishda qaror qabul qiladi.
 */
const MarkVacationModal = () => (
  <ResponsiveModal name="markVacation" title="Ta'til oyi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, month, monthInput }) => {
  const { mutate: createVacation } = useCreateVacationMonth();

  const { title, setField } = useObjectState({ title: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createVacation(
      { month, title },
      {
        onSuccess: (result) => {
          close();
          toast.success(`${result.monthLabel} ta'til deb belgilandi`);
          result?.warnings?.forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">Oy</p>
        <p className="font-medium text-gray-900">
          {monthInput || formatMonthKey(month)}
        </p>
      </div>

      <InputField
        autoFocus
        name="title"
        label="Nomi"
        value={title}
        placeholder="Qishki ta'til"
        onChange={(e) => setField("title", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Bu oyda hech bir o'quvchiga to'lov yozilmaydi. Allaqachon
        chiqarilgan hisob-fakturalar avtomatik bekor qilinmaydi.
      </p>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={isLoading}>
          Belgilash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default MarkVacationModal;
