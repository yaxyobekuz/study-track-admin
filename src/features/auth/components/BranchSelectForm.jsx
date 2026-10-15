// Icons
import { Building2, ChevronRight } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";

/**
 * FILIALNI TANLASH — login'ning IKKINCHI qadami.
 *
 * Xodim ikki yoki undan ortiq filialga biriktirilgan bo'lsa, server
 * birinchi qadamda token BERMAYDI (`branchSelectionRequired`): parol
 * to'g'ri bo'lsa ham seans OCHILMAYDI va qaysi filialda ishlashi
 * so'raladi. Shu sababli oyna HAR KIRISHDA ko'rinadi — tanlov eslab
 * qolinmaydi, ya'ni kechagi filialda bexosdan ishlab ketish holati
 * bo'lmaydi.
 *
 * ⚠️ TANLOV TOKENI DISKKA YOZILMAYDI (`LoginPage` da xotirada turadi):
 * sahifa yangilansa oqim parol qadamidan boshlanadi. Token 5 daqiqa
 * yashaydi; muddati tugasa server `selection_expired` qaytaradi va
 * forma parolga qaytariladi.
 *
 * ⚠️ BITTA BOSISH — darhol kiradi. Oraliq "Davom etish" tugmasi
 * qo'yilsa, har kirishga ikkinchi bosish qo'shilardi.
 */
const BranchSelectForm = ({
  fullName,
  branches = [],
  homeBranchId,
  pendingId = null,
  isLoading = false,
  onSelect,
  onBack,
}) => (
  <div className="max-w-md w-full space-y-5 animate__animated animate__fadeIn">
    {/* Header */}
    <div className="text-center space-y-2">
      <h2 className="text-lg font-medium md:text-xl">
        {fullName ? `${fullName}, qaysi filialda ishlaysiz?` : "Qaysi filialda ishlaysiz?"}
      </h2>

      <p className="text-gray-600">
        Siz bir nechta filialga biriktirilgansiz. Ish filialini tanlang —
        barcha ma'lumotlar shu filialdan ko'rsatiladi.
      </p>
    </div>

    {/* Branches */}
    <div className="space-y-3">
      {branches.map((branch) => {
        const isPending = pendingId === branch.id;

        return (
          <Button
            key={branch.id}
            variant="outline"
            disabled={isLoading}
            onClick={() => onSelect?.(branch)}
            className={cn(
              "w-full justify-start gap-3 h-auto py-3 border-2 text-left",
              isPending && "border-primary text-primary hover:text-primary",
            )}
          >
            <Building2 size={18} strokeWidth={1.5} className="shrink-0 opacity-70" />

            <span className="flex-1 min-w-0">
              <span className="block truncate font-medium">{branch.name}</span>
              {branch.id === homeBranchId && (
                <span className="block text-xs opacity-60">Asosiy filial</span>
              )}
            </span>

            {isPending ? (
              <span className="shrink-0 text-xs opacity-70">Kirilmoqda...</span>
            ) : (
              <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 opacity-50" />
            )}
          </Button>
        );
      })}
    </div>

    {/* Back */}
    <Button
      variant="secondary"
      disabled={isLoading}
      onClick={onBack}
      className="w-full max-md:bg-white max-md:hover:bg-white/70"
    >
      Ortga qaytish
    </Button>
  </div>
);

export default BranchSelectForm;
