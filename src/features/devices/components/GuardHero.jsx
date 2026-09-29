// Icons
import { ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens & data
import { DELAY, MOTION, SURFACE, T } from "../data/guard.tokens";
import { formatMinutes } from "../data/devices.data";

/**
 * HERO — "HIMOYA TURIBDIMI?" degan savolga bitta qarashda javob.
 *
 * ⚠️ QALQON, KUZATUV PANELI EMAS. Xavfsizlik bo'limining hero'si
 * "kim kirdi" ni kuzatadi va ustidan skan chizig'i o'tadi; bu yerda
 * savol boshqa — qoida bormi va u haqiqatda bajarilyaptimi. Shuning
 * uchun markazda halqa: u sekin nafas oladi, "izlamaydi".
 *
 * ⚠️ UCHTA HOLAT VA UCHALASI HAM ROSTINI AYTADI:
 *   · o'chiq       — modul yoqilmagan (hech narsa bajarilmayapti);
 *   · e'tibor      — qurilmalarda himoya o'chirilgan yoki qoida ostida
 *                    bo'lib turib telefoni ulanmagan o'quvchilar bor;
 *   · himoyada     — hammasi joyida.
 *
 * ⚠️ "HAMMASI JOYIDA" NI YOLG'ON KO'RSATMAYDI. Qamrov 100% bo'lsa-yu,
 * qurilmalar ulanmagan bo'lsa — bu HIMOYA EMAS: qoida qog'ozda bor,
 * telefonda yo'q. Aynan shu holat eng xavfli, chunki u "yashil" bo'lib
 * ko'rinishga eng moyil.
 */
const GuardHero = ({ data, isLoading, isError }) => {
  const coverage = data?.coverage;
  const devices = data?.devices;

  const degraded = devices?.health?.degraded || 0;
  const withoutDevice = devices?.coveredWithoutDevice || 0;
  const offline = devices?.health?.offline || 0;

  const state = !data?.enabled
    ? {
        key: "off",
        icon: ShieldOff,
        title: "Nazorat o'chirilgan",
        detail: "Siyosatlar saqlanib turibdi, lekin telefonlarda bajarilmayapti",
        ring: "text-slate-500",
        glow: "from-slate-500/20",
      }
    : degraded + withoutDevice > 0
      ? {
          key: "alert",
          icon: ShieldAlert,
          title: "E'tibor talab qiladi",
          detail: [
            degraded && `${degraded} ta qurilmada himoya o'chirilgan`,
            withoutDevice && `${withoutDevice} o'quvchining telefoni ulanmagan`,
          ]
            .filter(Boolean)
            .join(" · "),
          ring: "text-rose-400",
          glow: "from-rose-500/25",
        }
      : {
          key: "ok",
          icon: ShieldCheck,
          title: "Himoya ishlayapti",
          detail: offline
            ? `${offline} ta telefon hozir oflayn — oxirgi qoida ularda kuchda`
            : "Barcha ulangan qurilmalarda cheklov bajarilyapti",
          ring: "text-emerald-400",
          glow: "from-emerald-500/25",
        };

  const Icon = state.icon;

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-5 sm:px-6")}
      style={{ animationDelay: `${DELAY.hero}ms` }}
    >
      {/* Fon — sekin suzuvchi yorug'lik */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl",
          state.glow,
          MOTION.tide,
        )}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-5">
        {/* ── Chap: holat ── */}
        <div className="flex min-w-0 items-center gap-4">
          <span className="relative flex size-12 shrink-0 items-center justify-center">
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 rounded-full ring-1 ring-current opacity-40",
                state.ring,
                state.key === "ok" && "motion-safe:animate-pulse-ring",
              )}
            />
            <Icon className={cn("size-6", state.ring)} strokeWidth={1.8} />
          </span>

          <div className="min-w-0">
            <p className="text-[17px] font-semibold leading-tight tracking-[-0.02em]">
              {isLoading ? "Yuklanmoqda…" : isError ? "Ma'lumot olinmadi" : state.title}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-white/55">
              {isLoading || isError ? "—" : state.detail}
            </p>
          </div>
        </div>

        {/* ── O'ng: uchta raqam ── */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <HeroStat
            label="Qamrov"
            value={coverage ? `${coverage.percent}%` : "—"}
            hint={coverage ? `${coverage.covered} / ${coverage.students} o'quvchi` : ""}
          />
          <HeroStat
            label="Qurilmalar"
            value={devices ? devices.total : "—"}
            hint={devices ? `${devices.health?.healthy || 0} tasi himoyada` : ""}
          />
          <HeroStat
            label="Bugun ekranda"
            value={data ? formatMinutes(data.today?.avgMinutes) : "—"}
            hint={data ? `o'rtacha · ${data.today?.activeStudents || 0} o'quvchi` : ""}
          />
        </div>
      </div>
    </section>
  );
};

const HeroStat = ({ label, value, hint }) => (
  <div className="min-w-[92px]">
    <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-white/40">
      {label}
    </p>
    <p className="mt-1 text-[20px] font-semibold tabular-nums leading-none tracking-[-0.02em]">
      {value}
    </p>
    {hint && <p className="mt-1 text-[11px] text-white/45">{hint}</p>}
  </div>
);

export default GuardHero;
