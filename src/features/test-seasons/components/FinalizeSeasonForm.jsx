// Toast
import { toast } from "sonner";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Components
import Button from "@/shared/components/ui/button/Button";

/**
 * Mavsumni to'liq yakunlash tasdiq formasi.
 * Yakunlashda mukofot tangalari tarqatiladi va o'quvchilarga bot orqali
 * batafsil natija yuboriladi. Bu amalni orqaga qaytarib bo'lmaydi.
 */
const FinalizeSeasonForm = ({ onSuccess, close, isLoading, setIsLoading, ...season }) => {
  const handleFinalize = async () => {
    setIsLoading(true);
    try {
      const res = await testSeasonsAPI.finalize(season._id);
      onSuccess?.(res.data.data);
      toast.success(res.data.message || "Mavsum yakunlandi");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Yakunlashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Diqqat: mavsum to'liq yakunlanadi - o'quvchilar bundan keyin test ishlay
        olmaydi, mukofot tangalari avtomatik tarqatiladi va har bir o'quvchiga
        bot orqali yakuniy natija yuboriladi. Bu amalni orqaga qaytarib
        bo'lmaydi.
      </p>
      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={close} disabled={isLoading}>
          Bekor qilish
        </Button>
        <Button onClick={handleFinalize} disabled={isLoading}>
          {isLoading ? "Yakunlanmoqda..." : "To'liq yakunlash"}
        </Button>
      </div>
    </div>
  );
};

export default FinalizeSeasonForm;
