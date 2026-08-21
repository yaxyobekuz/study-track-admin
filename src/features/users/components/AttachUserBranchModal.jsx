// Toast
import { toast } from "sonner";

// React
import { useMemo } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useAttachUserBranch } from "@/features/users/queries/users.mutations";
import { useBranches } from "@/features/branches/queries/branches.queries";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const AttachUserBranchModal = () => (
  <ResponsiveModal
    name="attachUserBranch"
    title="Filialga biriktirish"
    description="Xodim yangi filialda ishlay boshlaydi — u yerda o'z roli va ruxsatlari bo'ladi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, user, rows = [] }) => {
  const { mutate: attach } = useAttachUserBranch();
  const { data: branches = [] } = useBranches();
  const { data: roles = [] } = useRoles();

  const { branchId, role, setField } = useObjectState({
    branchId: "",
    role: user?.role ?? "",
  });

  // Allaqachon biriktirilgan filiallar ro'yxatda ko'rinmaydi — takroriy
  // biriktirish baribir serverda rad etiladi.
  const attachedIds = new Set(rows.map((r) => r.branch.id));

  const options = useMemo(
    () =>
      branches
        .filter(
          (b) => !attachedIds.has(b.id) && !b.isArchived && b.status === "ready",
        )
        .map((b) => ({ label: b.name, value: b.id })),
    [branches, rows],
  );

  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => r.value !== "owner" && r.value !== "student")
        .map((r) => ({ label: r.name, value: r.value })),
    [roles],
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!branchId) return toast.error("Filialni tanlang");
    if (!role) return toast.error("Rolni tanlang");

    setIsLoading(true);

    attach(
      { id: user.id, branchId, role },
      {
        onSuccess: () => {
          close();
          toast.success("Xodim filialga biriktirildi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (options.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Biriktirish uchun boshqa filial yo'q — xodim mavjud filiallarning
          hammasida ishlaydi.
        </p>
        <Button type="button" onClick={close} className="w-full">
          Yopish
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <SelectField
        required
        label="Filial"
        value={branchId}
        options={options}
        placeholder="Filialni tanlang"
        onChange={(value) => setField("branchId", value)}
      />

      <SelectField
        required
        label="Shu filialdagi roli"
        value={role}
        options={roleOptions}
        placeholder="Rolni tanlang"
        description="Boshqa filialdagi rolidan farq qilishi mumkin"
        onChange={(value) => setField("role", value)}
      />

      <div className="rounded-xl bg-blue-50 px-3.5 py-3 text-sm text-blue-800">
        Ruxsatlar yangi filialda <b>rolning standart to'plamidan</b>
        boshlanadi. Boshqa filialdagi ruxsatlar ko'chirilmaydi — keyin
        "Ruxsatlar" tugmasi orqali sozlaysiz.
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-36" disabled={isLoading}>
          Biriktirish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default AttachUserBranchModal;
