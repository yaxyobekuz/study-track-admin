// Icons
import { History, Smartphone, Timer, Unlock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Tokens, data & queries
import { CHIP, SURFACE, T, healthOf } from "../data/guard.tokens";
import { auditLabel, weekdayShort } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";

/**
 * BITTA O'QUVCHI — qurilmalari, amaldagi qoidasi va ekran vaqti.
 *
 * ⚠️ "NEGA SHU SIYOSAT" ENG YUQORIDA. Bu oynaga admin ko'pincha aynan
 * shu savol bilan keladi ("nega bu bolada boshqa qoida"), shuning uchun
 * javob birinchi ekranda turadi — pastga aylantirib qidirilmaydi.
 *
 * ⚠️ FAQAT YIG'MA VAQT: qaysi ilova, necha daqiqa. "Soat nechada ochdi"
 * degan kesim yo'q, chunki bunday ma'lumot umuman saqlanmaydi
 * (`devices.md` §0.2).
 */
const StudentDeviceModal = () => (
  <ResponsiveModal name="studentDevice" title="O'quvchi qurilmalari" className="max-w-2xl">
    <StudentDeviceBody />
  </ResponsiveModal>
);

const StudentDeviceBody = ({ studentId, name }) => {
  const { data, isLoading, isError } = useQuery(devicesQueries.studentOverview(studentId, {}));

  if (isLoading) {
    return <p className="py-8 text-center text-[12.5px] text-slate-400">Yuklanmoqda…</p>;
  }
  if (isError || !data) {
    return (
      <p className="py-8 text-center text-[12.5px] text-slate-400">
        Ma'lumotni yuklab bo'lmadi
      </p>
    );
  }

  const maxMinutes = Math.max(1, ...(data.usage || []).map((u) => u.minutes));

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      {/* ── Amaldagi qoida ── */}
      <section className={cn(SURFACE.inset, "px-4 py-3.5")}>
        <p className={T.label}>Amaldagi qoida</p>
        {data.policy ? (
          <>
            <p className="mt-1 text-[14px] font-semibold text-slate-900">{data.policy.name}</p>
            <p className={cn(T.hint, "mt-0.5")}>{data.policyReason}</p>

            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
              <Fact
                label="Ro'yxat turi"
                value={data.policy.defaultMode === "block" ? "Oq ro'yxat" : "Qora ro'yxat"}
              />
              <Fact label="Ilovalar" value={`${data.policy.appCount} ta qoida`} />
              <Fact
                label="Kunlik limit"
                value={
                  data.policy.dailyLimitMinutes
                    ? `${data.policy.dailyLimitMinutes} daq`
                    : "Chegarasiz"
                }
              />
            </div>

            {data.policy.windows?.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {data.policy.windows.map((w, index) => (
                  <span key={index} className={cn(CHIP, "bg-sky-50 text-sky-700")}>
                    {weekdayShort(w.weekday)} {w.start}–{w.end}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className={cn(T.hint, "mt-1")}>
            Hech qanday siyosat biriktirilmagan — cheklov qo'llanmaydi.
          </p>
        )}
      </section>

      {/* ── Qurilmalar ── */}
      <Section icon={Smartphone} title="Qurilmalar">
        {data.devices.length === 0 ? (
          <Empty text="Biriktirilgan qurilma yo'q" />
        ) : (
          <ul className="space-y-1.5">
            {data.devices.map((device) => {
              const health = healthOf(device.health?.key);
              return (
                <li
                  key={device.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className={T.tdName}>{device.label || "Qurilma"}</p>
                    <p className={cn(T.hint, "truncate")}>
                      {[device.manufacturer, device.model].filter(Boolean).join(" ") ||
                        device.platform}
                      {device.lastSeenAt && ` · ${formatDateTimeUz(device.lastSeenAt)}`}
                    </p>
                  </div>
                  <span className={cn(CHIP, "shrink-0", health.chip)}>
                    <span className={cn("size-1.5 rounded-full", health.dot)} />
                    {health.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Ekran vaqti ── */}
      <Section icon={Timer} title="Ekran vaqti (7 kun)">
        {data.usage.length === 0 ? (
          <Empty text="Hisobot hali kelmagan" />
        ) : (
          <ul className="space-y-2">
            {data.usage.slice(0, 8).map((row) => (
              <li key={row.appKey}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[12.5px] text-slate-700">{row.name}</p>
                  <p className={T.tdNum}>{row.label}</p>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${Math.round((row.minutes / maxMinutes) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Vaqtinchalik ruxsatlar ── */}
      {data.unlocks?.length > 0 && (
        <Section icon={Unlock} title="Vaqtinchalik ruxsatlar">
          <ul className="space-y-1.5">
            {data.unlocks.slice(0, 5).map((unlock) => (
              <li key={unlock.id} className="rounded-xl bg-slate-50/80 px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12.5px] font-medium text-slate-900">
                    {unlock.kind === "full"
                      ? "Butun cheklov to'xtatilgan"
                      : `${unlock.app?.name || "Ilova"} · +${unlock.extraMinutes} daq`}
                  </p>
                  <span
                    className={cn(
                      CHIP,
                      unlock.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {unlock.status === "active"
                      ? "Amalda"
                      : unlock.status === "cancelled"
                        ? "Bekor qilingan"
                        : "Tugagan"}
                  </span>
                </div>
                <p className={cn(T.hint, "mt-0.5")}>
                  {formatDateTimeUz(unlock.endsAt)} gacha · {unlock.reason}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Tarix ── */}
      <Section icon={History} title="O'zgarishlar tarixi">
        {data.audit.length === 0 ? (
          <Empty text="Hozircha yozuv yo'q" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.audit.map((row) => (
              <li key={row.id} className="flex items-start gap-3 py-2 first:pt-0">
                <span className={cn(CHIP, "mt-0.5 shrink-0 bg-slate-100 text-slate-600")}>
                  {auditLabel(row.action)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] leading-snug text-slate-700">{row.summary}</p>
                  {row.reason && <p className={cn(T.hint, "mt-0.5")}>Sabab: {row.reason}</p>}
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                  {formatDateTimeUz(row.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <section>
    <div className="mb-2 flex items-center gap-1.5">
      <Icon className="size-3.5 text-slate-400" strokeWidth={2} />
      <p className={T.label}>{title}</p>
    </div>
    {children}
  </section>
);

const Fact = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.06em] text-slate-400">{label}</p>
    <p className="mt-0.5 text-[12.5px] font-medium text-slate-800">{value}</p>
  </div>
);

const Empty = ({ text }) => (
  <p className="rounded-xl bg-slate-50/80 px-3.5 py-4 text-center text-[12px] text-slate-400">
    {text}
  </p>
);

export default StudentDeviceModal;
