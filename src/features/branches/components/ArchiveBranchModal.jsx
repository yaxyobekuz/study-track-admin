// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useArchiveBranch } from "@/features/branches/queries/branches.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const ArchiveBranchModal = () => (
  <ResponsiveModal
    name="archiveBranch"
    title="Filialni arxivlash"
    description="Filial o'chirilmaydi — ma'lumoti hisobotlar uchun saqlanib qoladi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...branch }) => {
  const { mutate: archiveBranch } = useArchiveBranch();

  const { reason, setField } = useObjectState({ reason: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    archiveBranch(
      { id: branch.id, reason },
      {
        onSuccess: () => {
          close();
          toast.success(`"${branch.name}" arxivlandi`);
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
        <p className="font-medium">Arxivlangandan keyin:</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-amber-700">
          <li>bu filial xodimlari va o'quvchilari tizimga kira olmaydi;</li>
          <li>hisob-faktura va davomat shakllanmaydi;</li>
          <li>
            ma'lumot bazada QOLADI va yig'ma hisobotda ko'rinaveradi —
            keyin arxivdan qaytarish mumkin.
          </li>
        </ul>
      </div>

      {branch.counts && (
        <p className="text-sm text-gray-500">
          Hozir filialda {branch.counts.students} o'quvchi va{" "}
          {branch.counts.staff} xodim bor.
        </p>
      )}

      <InputField
        name="reason"
        value={reason}
        maxLength={200}
        label="Sabab"
        placeholder="Filial yopildi"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          variant="danger"
          disabled={isLoading}
          className="w-full xs:w-32"
        >
          Arxivlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ArchiveBranchModal;
