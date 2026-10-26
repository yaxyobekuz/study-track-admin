// Icons
import { ChevronRight, School } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * "QAYSI SINFDAN NECHTA QOLDI" — sinflar kesimi.
 *
 * ⚠️ Kesim BUTUN MAKTAB bo'yicha va sinf filtriga BOG'LIQ EMAS (alohida
 * so'rov): sinf tanlanganda ham rahbariyat umumiy manzarani ko'rishi kerak.
 * Qator bosilsa — o'sha sinfning ro'yxati ochiladi.
 *
 * ⚠️ IKKI SINFDAGI O'QUVCHI har ikki qatorda sanaladi, pastdagi "Jami" da
 * esa BIR MARTA — shuning uchun qatorlar yig'indisi jamidan katta bo'lishi
 * mumkin. Buni ekran O'ZI aytadi: aks holda "raqamlar qo'shilmaydi" degan
 * savol javobsiz qolardi.
 *
 * @param {object} props
 * @param {Array} props.classes - `[{ id, name, total, present, absent, excused, unmarked }]`
 * @param {object} [props.totals]
 * @param {string} props.selected - joriy sinf filtri
 * @param {(classId: string) => void} props.onSelect
 */
const DormClassBreakdown = ({ classes = [], totals, selected, onSelect }) => {
  if (classes.length === 0) return null;

  const multiClass = classes.reduce((sum, row) => sum + row.total, 0) > (totals?.total ?? 0);

  return (
    // ⚠️ `Card` EMAS: uning sukut paddingi (`p-4 xs:p-5`) sarlavha
    // chizig'ini ichkariga surib, bo'linma chetlariga yetmasdi
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <School className="size-4" strokeWidth={1.75} />
          Sinflar kesimi
        </div>
        <p className="text-xs text-gray-500">
          Jami {totals?.total ?? 0} o&apos;quvchidan {totals?.stayed ?? 0} tasi
          yotoqxonada
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {classes.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(selected === row.id ? "" : row.id)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition",
              selected === row.id
                ? "border-blue-300 bg-blue-50"
                : "border-gray-100 hover:bg-gray-50",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{row.name}</p>
              <p className="text-xs text-gray-500">{row.total} o&apos;quvchi</p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Count value={row.present} className="bg-green-100 text-green-700" title="Qoldi" />
              <Count value={row.absent} className="bg-red-100 text-red-700" title="Kelmadi" />
              <Count value={row.excused} className="bg-blue-100 text-blue-700" title="Sababli" />
              <Count
                value={row.unmarked}
                className="bg-gray-100 text-gray-500"
                title="Belgilanmagan"
              />
              <ChevronRight className="size-4 text-gray-300" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>

      {multiClass && (
        <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          Ikki sinfda o&apos;qiydigan o&apos;quvchi har ikki qatorda sanaladi,
          &quot;Jami&quot; da esa bir marta — shuning uchun qatorlar
          yig&apos;indisi jamidan katta bo&apos;lishi mumkin.
        </p>
      )}
    </div>
  );
};

const Count = ({ value, className, title }) => (
  <span
    title={title}
    className={cn(
      "inline-flex min-w-7 justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold",
      className,
      value === 0 && "opacity-40",
    )}
  >
    {value}
  </span>
);

export default DormClassBreakdown;
