// React
import { useMemo, useState } from "react";

// Icons
import { CalendarRange, Lock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Select from "@/shared/components/ui/select/Select";
import SentinelHero from "../components/SentinelHero";
import MetricStrip from "../components/MetricStrip";
import LoginTrend from "../components/LoginTrend";
import AlertsPanel from "../components/AlertsPanel";
import UserSecuritySheet from "../components/UserSecuritySheet";
import { MultiSessionPanel, LiveSessionsPanel } from "../components/SessionsPanel";
import {
  AttemptsFeed,
  ReasonsPanel,
  DevicesPanel,
} from "../components/AttemptsPanel";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { securityQueries } from "../queries/security.queries";
import {
  useUpdateAlert,
  useRevokeSession,
  useRevokeUserSessions,
} from "../queries/security.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { DELAY, MOTION, T, gridDelay } from "../data/sentinel.tokens";

/**
 * XAVFSIZLIK — "hisobga KIM kirdi?".
 *
 * ⚠️ FAOLLIKDAN ALOHIDA BO'LIM va bu ataylab. Faollik "tizimdan kim
 * FOYDALANYAPTI" ni o'lchaydi — bu kadrlar savoli va uni bo'lim
 * boshlig'i ham ko'rishi mumkin. Bu yerda esa IP, qurilma va kirish
 * vaqti turadi — shaxsiy ma'lumot, va uni ko'rish huquqi alohida
 * berilishi kerak.
 *
 * ⚠️ TIZIM HECH NARSANI TO'XTATMAYDI. Ikkinchi seans avtomatik
 * uzilmaydi (`security.service.js` doktrinasi: qayd etadi, tuzatmaydi):
 * direktor telefonidan kirsa, kompyuteridagi ochiq ishi yopilib
 * qolmasligi kerak. Uzish tugmasi bor, lekin uni ODAM bosadi va
 * buning uchun alohida ruxsat kerak (`security.revoke`).
 *
 * ⚠️ FILIAL DARVOZASI SERVERDA. Ekran nima ko'rsatishini `scope`
 * maydoni aytadi (owner — hamma filial, qolganlar — joriysi) va u
 * hero'da yozib qo'yiladi: ma'lumot chegaralanganini yashirish
 * yolg'on bo'lardi.
 */

/** 12-ustunli bento to'r. */
const GRID = "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12";

const PERIOD_OPTIONS = [
  { value: "7", label: "7 kun" },
  { value: "14", label: "14 kun" },
  { value: "30", label: "30 kun" },
  { value: "90", label: "90 kun" },
];

const SecurityPage = () => {
  const { can } = usePermissions();

  const allowed = can("security.view");
  const canRevoke = can("security.revoke");
  const canManageAlerts = can("security.alerts");

  // ⚠️ IP, qurilma va aniq odamlar ro'yxati ALOHIDA ruxsat bilan
  // (`security.sessions`). Server ularni javobdan butunlay chiqarib
  // tashlaydi (`sessions.available === false`), bu yerdagi tekshiruv
  // esa bloklarni umuman chizmaslik uchun: bo'sh ro'yxat "hech kim
  // tizimda emas" degan yolg'on taassurot berardi.
  const canSeeDetails = can("security.sessions");

  const [days, setDays] = useState("30");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const overview = useQuery({
    ...securityQueries.overview({ days: Number(days) }),
    enabled: allowed,
  });

  const updateAlert = useUpdateAlert();
  const revokeSession = useRevokeSession();
  const revokeUserSessions = useRevokeUserSessions();

  const state = useMemo(
    () => ({
      data: overview.data,
      isLoading: overview.isLoading,
      isError: overview.isError,
    }),
    [overview.data, overview.isLoading, overview.isError],
  );

  // Hozir yuborilayotgan so'rovning nishoni — tugma o'sha qatorda
  // bloklanadi, butun ro'yxat emas
  const busySessionId = revokeSession.isPending
    ? revokeSession.variables
    : revokeUserSessions.isPending
      ? revokeUserSessions.variables
      : null;

  const busyAlertId = updateAlert.isPending ? updateAlert.variables?.id : null;

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Xavfsizlik bo'limini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const sessionProps = {
    canRevoke,
    busyId: busySessionId,
    onRevoke: (session) => revokeSession.mutate(session.id),
    onRevokeUser: (userId) => revokeUserSessions.mutate(userId),
    // Foydalanuvchi kartasi ham `security.sessions` talab qiladi —
    // ruxsatsiz ism bosilmaydigan matn bo'lib qoladi
    onSelectUser: canSeeDetails ? setSelectedUserId : undefined,
  };

  return (
    <div className="flex flex-col gap-3 pb-6">
      {/* ── Sarlavha ─────────────────────────────────────────────── */}
      <header
        className={cn(
          "flex flex-wrap items-end justify-between gap-3 px-0.5 pt-0.5",
          MOTION.enter,
        )}
        style={{ animationDelay: `${DELAY.header}ms` }}
      >
        <div className="min-w-0">
          <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
            Xavfsizlik
          </h1>
          <p className={cn(T.hint, "mt-0.5")}>
            Seanslar, kirish urinishlari va shubhali holatlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 shrink-0 text-slate-400" />
          <Select
            triggerClassName="h-9 min-w-32"
            value={days}
            options={PERIOD_OPTIONS}
            onChange={setDays}
          />
        </div>
      </header>

      {/* ── Hero: kuzatuv paneli ─────────────────────────────────── */}
      <SentinelHero {...state} />

      {/* ── Oltita ko'rsatkich ───────────────────────────────────── */}
      <MetricStrip {...state} />

      {/* ── Bento to'r ───────────────────────────────────────────────
          Kenglik = og'irlik.

          • Ogohlantirishlar 7 ustun — bo'limning MARKAZIY bloki: har
            qator uch qatorli matn va uni tor ustunda o'qib bo'lmasdi.
          • Bir vaqtdagi seanslar 5 — foydalanuvchi so'ragan asosiy
            signal, ogohlantirishlar bilan YONMA-YON turishi kerak.
          • Dinamika 7, sabablar 5 — ikkalasi ham davr kesimi.
          • Ochiq seanslar butun kenglik — jadval va u kengaymasa
            gorizontal scroll hosil bo'lardi. */}
      <div className={GRID}>
        <AlertsPanel
          {...state}
          delay={gridDelay(0)}
          className={canSeeDetails ? "xl:col-span-7" : "xl:col-span-12"}
          canManage={canManageAlerts}
          busyId={busyAlertId}
          onAcknowledge={(alert) =>
            updateAlert.mutate({ id: alert.id, status: "acknowledged" })
          }
          onResolve={(alert) =>
            updateAlert.mutate({ id: alert.id, status: "resolved" })
          }
          onSelectUser={canSeeDetails ? setSelectedUserId : undefined}
        />

        {canSeeDetails && (
          <MultiSessionPanel
            {...state}
            {...sessionProps}
            delay={gridDelay(1)}
            className="xl:col-span-5"
          />
        )}

        <LoginTrend
          {...state}
          delay={gridDelay(2)}
          className={canSeeDetails ? "xl:col-span-7" : "xl:col-span-12"}
        />
        {/* Sabab kesimi — bu RAQAM, shaxsiy ma'lumot emas: u
            `security.view` bilan ham ko'rinadi */}
        <ReasonsPanel
          {...state}
          delay={gridDelay(3)}
          className={canSeeDetails ? "xl:col-span-5" : "xl:col-span-12"}
        />

        {canSeeDetails && (
          <>
            <LiveSessionsPanel
              {...state}
              {...sessionProps}
              delay={gridDelay(4)}
              className="xl:col-span-12"
            />

            <AttemptsFeed
              {...state}
              delay={gridDelay(5)}
              className="xl:col-span-8"
              onSelectUser={setSelectedUserId}
            />
            <DevicesPanel {...state} delay={gridDelay(6)} className="xl:col-span-4" />
          </>
        )}
      </div>

      {/* Foydalanuvchi kartasi — ro'yxatlardan ochiladi */}
      <UserSecuritySheet
        open={Boolean(selectedUserId)}
        onOpenChange={(next) => !next && setSelectedUserId(null)}
        userId={selectedUserId}
        days={Number(days)}
        canRevoke={canRevoke}
        busyId={busySessionId}
        onRevoke={(session) => revokeSession.mutate(session.id)}
        onRevokeUser={(userId) => revokeUserSessions.mutate(userId)}
      />
    </div>
  );
};

export default SecurityPage;
