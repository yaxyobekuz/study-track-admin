// Icons
import { Layers } from "lucide-react";

// Hooks
import useBranch from "@/shared/hooks/useBranch";

/**
 * UMUMIY KO'RINISH ESLATMASI — ekran tepasidagi yupqa chiziq.
 *
 * ⚠️ NIMA UCHUN KERAK: umumiy rejimda ro'yxatlarda bir nechta filialning
 * ma'lumoti birga turadi. Odam buni bilmasa, "nega bu o'quvchi ikki marta
 * ko'rinadi" yoki "nega bu yerda tanimagan sinf bor" degan savol tug'ilardi.
 * Eslatma uchta narsani OCHIQ aytadi: nechta filial birlashgan, qatordagi
 * filial belgisi nimani bildiradi va yozuv qaysi filialga ketadi.
 *
 * ⚠️ Yopib qo'yiladigan (dismiss) qilinmagan: bu reklama emas, ekrandagi
 * ma'lumotning ta'rifi. Rejimdan chiqish uchun sidebardagi almashtirgich bor.
 */
const AggregateNotice = () => {
  const { isAggregate, branches } = useBranch();

  if (!isAggregate) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-sm text-blue-900">
      <Layers size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 opacity-70" />
      <p className="leading-snug">
        <span className="font-medium">Umumiy ko'rinish</span>
        {branches.length > 0 && (
          <span className="opacity-80"> — {branches.length} filial birga</span>
        )}
        <span className="opacity-80">
          . Har qatorda u qaysi filialga tegishli ekani ko'rsatiladi; tahrir
          va to'lov o'sha qatorning filialiga yoziladi. Sanoqchi ostidagi
          filial qatorini bossangiz — o'sha filialga o'tib, shu bo'lim
          ochiladi. Yangi yozuv qo'shish, sozlamalar va fayl yuklab olish
          uchun filialni tanlang.
        </span>
      </p>
    </div>
  );
};

export default AggregateNotice;
