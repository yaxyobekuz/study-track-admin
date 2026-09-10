// Icons
import { Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import CircularScore from "./charts/CircularScore";

// Data
import { scoreColor } from "../data/diagnostics.data";

/**
 * "SINFLAR BO'YICHA QATNASHUV VA O'ZLASHTIRISH".
 *
 * ⚠️ "KELDI" — DAVOMAT EMAS. Bu yerda u "shu davrda kamida bitta
 * diagnostika ishladi" degani. Maktabda "keldi" so'zi davomatni
 * bildiradi va u BUTUNLAY boshqa jadvalda yashaydi, shuning uchun
 * ta'rif sarlavhaning yonida turadi — izohni pastga yashirish
 * chalkashlikni yo'q qilmasdi.
 *
 * ⚠️ IKKI O'LCHOV YONMA-YON: qatnashuv (nechtasi ishladi) va
 * o'zlashtirish (qanday ishladi). Faqat birinchisi ko'rsatilsa,
 * "hamma ishladi" degan yashil manzara ortida past natija yashirin
 * qolardi.
 */
const ClassParticipationCard = ({ data }) => {
  const overall = data?.overall;
  const classes = data?.classes ?? [];

  return (
    <Card>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-semibold text-gray-900">
          Sinflar bo'yicha qatnashuv va o'zlashtirish
        </h2>
        <p className="text-sm text-gray-500">
          "keldi" = shu davrda test ishlagan o'quvchi
        </p>
      </div>

      {!classes.length ? (
        <EmptyState
          icon={Users}
          title="Sinf ma'lumoti yo'q"
          description="O'quvchisi bor sinf topilmadi."
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* ── UMUMIY ─────────────────────── */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="flex justify-center">
              <CircularScore
                value={overall?.participation ?? 0}
                size={132}
                stroke={14}
                color="#10B981"
                ticks={false}
              >
                <span className="text-2xl font-bold tabular-nums text-gray-900">
                  {overall?.participation ?? 0}%
                </span>
                <span className="text-[11px] text-gray-400">keldi</span>
              </CircularScore>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <Stat label="Jami o'quvchi" value={overall?.total ?? 0} />
              <Stat
                label="O'rtacha o'zlashtirish"
                value={
                  overall?.averageScore != null
                    ? `${Math.round(overall.averageScore)}%`
                    : "—"
                }
                color={
                  overall?.averageScore != null
                    ? scoreColor(overall.averageScore)
                    : undefined
                }
              />
              <Stat label="Keldi (ishladi)" value={overall?.came ?? 0} color="#10B981" />
              <Stat label="Kelmadi" value={overall?.absent ?? 0} color="#EF4444" />
            </div>
          </div>

          {/* ── SINFLAR ────────────────────── */}
          <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
            {classes.map((row) => (
              <div key={row.classId} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {row.name}
                  </p>
                  <p className="shrink-0 text-xs text-gray-500">
                    <span className="font-semibold text-emerald-600">{row.came}</span>
                    {" / "}
                    {row.total} keldi ·{" "}
                    <span className="font-semibold text-primary">
                      {row.participation}%
                    </span>
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 motion-reduce:transition-none"
                    style={{ width: `${row.participation}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center gap-2.5">
                  <span className="w-[86px] shrink-0 text-[11px] text-gray-400">
                    O'zlashtirish
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                      style={{
                        width: `${Math.max(0, Math.min(100, row.averageScore ?? 0))}%`,
                        backgroundColor: scoreColor(row.averageScore),
                      }}
                    />
                  </span>
                  <span
                    className="w-10 shrink-0 text-right text-xs font-bold tabular-nums"
                    style={{
                      color:
                        row.averageScore != null
                          ? scoreColor(row.averageScore)
                          : "#9CA3AF",
                    }}
                  >
                    {row.averageScore != null
                      ? `${Math.round(row.averageScore)}%`
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const Stat = ({ label, value, color }) => (
  <div>
    <p className="text-lg font-bold tabular-nums" style={color ? { color } : undefined}>
      {value}
    </p>
    <p className="text-[11px] leading-tight text-gray-400">{label}</p>
  </div>
);

export default ClassParticipationCard;
