// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";

// Icons
import { Database } from "lucide-react";

// Data
import { gradeColor } from "../data/diagnostics.data";

/**
 * "FANLAR BO'YICHA O'RTACHA NATIJA" — gorizontal chiziqlar ro'yxati.
 *
 * ⚠️ TARTIB ENG ZAIFDAN BOSHLANADI. Bu karta "qaysi fanga yordam
 * kerak" degan savolga javob beradi, "kim yutdi" degan savolga emas:
 * eng past natija ro'yxatning tepasida turishi kerak, aks holda
 * rahbar ro'yxatning oxirigacha varaqlab qidirardi. O'lchanmagan fan
 * (natijasi `null`) eng oxirida — u zaif emas, shunchaki noma'lum.
 *
 * ⚠️ VERTIKAL DIAGRAMMA EMAS. Ilgari bu yerda ustunli diagramma
 * turardi va fan nomlari ustun tagida qiyshaygan holda sig'masdi;
 * gorizontal chiziqda nom to'liq o'qiladi va yangi fan qo'shilsa
 * ro'yxat shunchaki uzayadi.
 *
 * ⚠️ RANG NATIJA CHEGARASI BO'YICHA (`gradeColor`), mavzu chegarasi
 * bo'yicha emas — yonidagi "Natijalar taqsimoti" kartasi bilan bir xil
 * tilda gapirishi uchun.
 */
const SubjectBars = ({ rows = [], thresholds, action = null, limit = 10 }) => {
  const data = [...rows]
    .sort((a, b) => (a.averageScore ?? 101) - (b.averageScore ?? 101))
    .slice(0, limit);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">
          Fanlar bo'yicha o'rtacha natija
        </h2>
        {action}
      </div>

      {!data.length ? (
        <EmptyState
          icon={Database}
          title="Ma'lumot yo'q"
          description="Tanlangan davrda fan kesimida natija yo'q."
        />
      ) : (
        <div className="mt-4 space-y-3">
          {data.map((row) => {
            const value = row.averageScore;
            const color = gradeColor(value, thresholds);
            const width = Math.max(0, Math.min(100, value ?? 0));

            return (
              <div key={row.key ?? row.label} className="flex items-center gap-3">
                <span
                  className="w-[96px] shrink-0 truncate text-[13px] text-gray-700"
                  title={row.label}
                >
                  {row.label}
                </span>

                <span className="relative h-1.5 flex-1 rounded-full bg-gray-100">
                  <span
                    className="block h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                    style={{ width: `${width}%`, backgroundColor: color }}
                  />
                  {/* Chiziq uchidagi nuqta — qiymat qayerda tugaganini
                      aniq ko'rsatadi (yupqa chiziqda chekka ko'zga
                      tashlanmaydi). */}
                  {value != null && (
                    <span
                      className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-white"
                      style={{ left: `calc(${width}% - 5px)`, backgroundColor: color }}
                    />
                  )}
                </span>

                <span className="w-10 shrink-0 text-right text-[13px] font-semibold tabular-nums text-gray-900">
                  {value != null ? `${Math.round(value)}%` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default SubjectBars;
