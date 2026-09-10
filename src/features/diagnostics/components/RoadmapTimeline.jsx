// Icons
import { Route, Flag, Check } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Sparkline from "./charts/Sparkline";

/**
 * "SHAXSIY O'QUV YO'LI" — bashorat egri chizig'i va haftalik qadamlar.
 *
 * ⚠️ REJA URINISH TOPSHIRILGANDA MUHRLANADI, egri chiziq esa o'sha
 * rejaning bashoratlaridan yig'iladi (server `predictionCurve`).
 * Ikkalasi bitta manbadan — grafik bir narsa, ro'yxat boshqa narsa
 * deydigan holat bo'lmaydi.
 */
const RoadmapTimeline = ({ roadmap, curve = [] }) => {
  const steps = roadmap?.steps ?? [];
  if (!steps.length) return null;

  const from = curve[0];
  const to = curve[curve.length - 1];

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Route className="size-5 text-primary" strokeWidth={1.5} />
        <div>
          <h2 className="font-semibold text-gray-900">Shaxsiy o'quv yo'li</h2>
          <p className="text-sm text-gray-500">
            Har test natijasidan keyin yangilanadi
          </p>
        </div>
      </div>

      {curve.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Bashorat egri chizig'i
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900">
              {from}% <span className="font-normal text-gray-400">→</span>{" "}
              <span className="text-emerald-600">{to}%</span>
            </p>
          </div>
          <Sparkline data={curve} width={160} height={44} color="#2563eb" />
        </div>
      )}

      <ol className="mt-4">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.week} className="flex gap-3 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  className={
                    last
                      ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                      : "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-semibold text-primary"
                  }
                >
                  {last ? <Check className="size-4" strokeWidth={2.5} /> : step.week}
                </span>
                {!last && <span className="w-0.5 flex-1 bg-gray-100" />}
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-900">{step.title}</p>
                  <span className="shrink-0 text-[11px] uppercase tracking-wide text-gray-400">
                    {step.week}-hafta
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">{step.detail}</p>

                {step.checkpoint && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary">
                    <Flag className="size-3" strokeWidth={2} />
                    {step.checkpoint}
                    {step.projected != null && ` · ~${step.projected}%`}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};

export default RoadmapTimeline;
