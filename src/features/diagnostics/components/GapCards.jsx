// Icons
import { Clock, TrendingUp } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { TONES } from "../data/diagnostics.data";

/**
 * "YOPISH KERAK BO'LGAN MAVZULAR" — ish ro'yxati, eng zaifidan boshlab.
 *
 * ⚠️ RO'YXAT VA MEHNAT BAHOSI SERVERDA (`result.gaps`). "Kutilayotgan
 * foyda" — mavzuni o'zlashtirish chizig'iga olib chiqish UMUMIY ballga
 * qancha qo'shishi; mavzuning joriy foizi emas.
 */
const GapCards = ({ gaps = [] }) => {
  if (!gaps.length) return null;

  return (
    <Card>
      <h2 className="font-semibold text-gray-900">Yopish kerak bo'lgan mavzular</h2>
      <p className="mt-0.5 text-sm text-gray-500">
        Eng zaifidan boshlab — o'qituvchi uchun ish ro'yxati
      </p>

      <div className="mt-4 space-y-2.5">
        {gaps.map((gap) => {
          const tone = TONES[gap.tone] || TONES.gap;

          return (
            <div
              key={gap.topicId || gap.topic}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-3.5"
            >
              <span
                className="h-8 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: tone.color }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-gray-900">{gap.topic}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${tone.color}1A`, color: tone.color }}
                  >
                    {tone.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {gap.questions} savol · {Math.round(gap.score)}% aniqlik
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4 text-xs">
                {gap.projectedGain > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <TrendingUp className="size-3.5" strokeWidth={2} />+
                    {gap.projectedGain}% umumiy ballga
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="size-3.5" strokeWidth={1.75} />
                  {gap.effortLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default GapCards;
