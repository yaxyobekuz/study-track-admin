// Icons
import { CheckCircle2, AlertTriangle, Sparkles, Database } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { BLUEPRINT_LEVELS } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * REJA — "TESTNI YARATISH" DAN OLDIN NIMA BO'LISHI.
 *
 * ⚠️ BU QADAM MAJBURIY VA SHUNDAY QOLDIRILGAN. Yaratish qaytarib
 * bo'lmaydigan ikki narsaga tegadi: pullik model chaqiruvlariga va
 * bankka yoziladigan savollarga. Shuning uchun odam avval sinf qaysi
 * mavzuga kelganini, bankda nechta mos savol borligini va AI nechtasini
 * yozishini KO'RADI (loyihadagi `preview` → `confirm` naqshi:
 * filiallararo ko'chirish, sertifikat importi).
 *
 * ⚠️ RAQAMLAR SERVERDAN. Panel na joriy mavzuni, na bankdagi sonni
 * o'zi hisoblaydi — aks holda oynadagi raqam test ichidagi haqiqat
 * bilan farq qilardi.
 */
const TestPlanCard = ({ plan, stale = false }) => {
  if (!plan) return null;

  const { totals, rows = [], errors = [], warnings = [], aiEnabled } = plan;

  return (
    <Card className={cn("space-y-4", stale && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Tekshiruv natijasi
            {plan.class?.name ? ` — ${plan.class.name}` : ""}
          </h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {stale
              ? "Taqsimot o'zgardi — qaytadan tekshiring"
              : plan.canBuild
                ? "Hammasi joyida, testni yaratishingiz mumkin"
                : "Quyidagi muammolar tuzatilmaguncha test yaratilmaydi"}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1",
            plan.canBuild && !stale
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-amber-200",
          )}
        >
          {plan.canBuild && !stale ? (
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
          ) : (
            <AlertTriangle className="size-3.5" strokeWidth={2} />
          )}
          {plan.canBuild && !stale ? "Tayyor" : "E'tibor talab qiladi"}
        </span>
      </div>

      {/* ── SANOQ QATORI ─────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="So'ralgan savol" value={totals?.requested ?? 0} />
        <Metric
          label="Bankdan olinadi"
          value={totals?.fromBank ?? 0}
          icon={Database}
          tone="emerald"
        />
        <Metric
          label="AI yozadi"
          value={totals?.needsAi ?? 0}
          icon={Sparkles}
          tone="violet"
        />
        <Metric
          label="Yetmaydi"
          value={totals?.shortfall ?? 0}
          tone={totals?.shortfall ? "rose" : "gray"}
        />
      </div>

      {/* ── QATORLAR ─────────────────────── */}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.index}
            className={cn(
              "rounded-xl border p-3",
              row.ready ? "border-gray-100 bg-gray-50/60" : "border-rose-200 bg-rose-50/60",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-gray-900">
                {row.label}
                {row.grade ? (
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    ({row.grade}-sinf bazasi)
                  </span>
                ) : null}
              </span>

              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                {row.source === "ai" ? (
                  <Sparkles className="size-3.5 text-violet-500" strokeWidth={2} />
                ) : (
                  <Database className="size-3.5 text-emerald-500" strokeWidth={2} />
                )}
                {row.sourceLabel}
                <span className="text-gray-300">·</span>
                {row.want} ta savol
              </span>
            </div>

            {/* Qiyinlik kesimi: so'ralgan va bankda bor */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {BLUEPRINT_LEVELS.map((lvl) => {
                const want = row.counts?.[lvl.key] ?? 0;
                if (!want) return null;
                const available = row.bank?.levels?.[lvl.key]?.available;
                return (
                  <span key={lvl.key}>
                    {lvl.label}:{" "}
                    <b className="text-gray-700">{want}</b>
                    {available != null && (
                      <span
                        className={cn(
                          "ml-1",
                          available < want ? "text-rose-600" : "text-gray-400",
                        )}
                      >
                        (bankda {available})
                      </span>
                    )}
                  </span>
                );
              })}

              {row.topicCount > 0 && (
                <span>
                  Qamrov: <b className="text-gray-700">{row.topicCount}</b> mavzu
                </span>
              )}
            </div>

            {row.reason && (
              <p className="mt-2 text-xs font-medium text-rose-700">{row.reason}</p>
            )}
          </li>
        ))}
      </ul>

      {!aiEnabled && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          AI o'chirilgan: savollarni faqat bankdan olish mumkin.
        </p>
      )}

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 ring-1 ring-rose-200">
          {errors.map((error, index) => (
            <li key={index}>• {error.message}</li>
          ))}
        </ul>
      )}

      {/* ⚠️ OGOHLANTIRISH XATO EMAS: test yaratiladi, faqat so'ralgancha
          savol topilmaydi. Ularni xato deb ko'rsatish foydalanuvchini
          "test yaratilmaydi" deb o'ylashga majbur qilardi. */}
      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          {warnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const TONES = {
  gray: "text-gray-900",
  emerald: "text-emerald-600",
  violet: "text-violet-600",
  rose: "text-rose-600",
};

const Metric = ({ label, value, icon: Icon, tone = "gray" }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      {Icon && <Icon className="size-3.5" strokeWidth={1.5} />}
      {label}
    </span>
    <span className={cn("mt-0.5 block text-xl font-bold tabular-nums", TONES[tone])}>
      {value}
    </span>
  </div>
);

export default TestPlanCard;
