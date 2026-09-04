// Router
import { useNavigate } from "react-router-dom";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { inventoryQueries } from "../queries/inventory.queries";
import { useOpenCheck } from "../queries/inventory.mutations";

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const OpenCheckModal = () => (
  <ResponsiveModal name="inventoryOpenCheck" title="Kunlik hisobot ochish">
    <OpenCheckForm />
  </ResponsiveModal>
);

/**
 * Varaq ochish IDEMPOTENT: shu xona va shu kun uchun varaq allaqachon
 * bo'lsa, server o'shani qaytaradi. Shuning uchun "allaqachon mavjud"
 * degan xato yo'q — foydalanuvchi to'g'ridan-to'g'ri varaqqa o'tadi.
 */
const OpenCheckForm = ({ close, isLoading, setIsLoading, locationId: initialLocationId }) => {
  const navigate = useNavigate();

  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const { mutate: openCheck } = useOpenCheck();

  const { locationId, date, setField } = useObjectState({
    locationId: initialLocationId ?? "",
    date: todayInputValue(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    openCheck(
      { locationId, date },
      {
        onSuccess: (check) => {
          close();
          navigate(`/inventory/checks/${check.id}`);
          if (check.isSubmitted) {
            toast.info("Bu kun uchun hisobot allaqachon yuborilgan");
          }
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Xona</p>
        <Select
          value={locationId}
          placeholder="Xonani tanlang"
          onChange={(v) => setField("locationId", v)}
          options={locations.map((l) => ({ label: l.name, value: l.id }))}
        />
      </div>

      <InputField
        required
        type="date"
        name="date"
        label="Sana"
        value={date}
        max={todayInputValue()}
        description="Kechagi hisobotni bugun kiritish mumkin — kelajakdagi kun uchun emas"
        onChange={(e) => setField("date", e.target.value)}
      />

      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
        Varaq xatlovdan oldindan to'ldiriladi: siz faqat o'zgargan raqamlarni
        kiritasiz. Bir kunda bir xonaga bitta hisobot bo'ladi.
      </p>

      <Button type="submit" disabled={isLoading || !locationId}>
        Varaqni ochish
      </Button>
    </InputGroup>
  );
};
