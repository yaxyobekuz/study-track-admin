// Router
import { Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { MonitorSmartphone } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { activityQueries } from "@/features/activityDashboard/queries/activity.queries";

/** Faollik bo'limi — kartadagi har bir qator aynan shu yerga olib boradi. */
const ACTIVITY_PATH = "/pulse";

/**
 * ⚠️ MAXRAJ — O'QISH DAVRI BO'YICHA ("hozir o'qiyotganlar"), yonidagi
 * "O'quvchilar" kartasining arxiv bayrog'i bo'yicha sanog'i EMAS. Ikkala
 * raqam odatda bir xil (har o'quvchiga davr avtomat ochiladi), lekin
 * ma'lumot to'liq bo'lmasa farq qilishi mumkin — shuning uchun maxraj
 * izohda OCHIQ aytiladi. Faollik bo'limidagi hamma foiz ham shu
 * ro'yxatdan hisoblanadi, ya'ni ikki ekran bir xil javob beradi.
 */
const TOTAL_HINT = "Hozir o'qiyotgan o'quvchilar soni";

/**
 * Foiz — PANELDA hisoblanadi va bu ataylab.
 *
 * ⚠️ Server foiz qaytarmaydi: umumiy ("barcha filiallar") ko'rinishida
 * sonlar QO'SHILADI, foiz esa O'RTACHALANADI
 * (`helpers/aggregateMerge.helpers.js`) — ya'ni serverdan kelgan foiz
 * ekrandagi "210 / 524" bilan mos kelmay qolardi. Ikkala sonni qo'shib,
 * foizni ulardan chiqarish esa har doim o'zaro muvofiq natija beradi.
 */
const pct = (part, whole) =>
  whole > 0 ? Math.round(((part ?? 0) / whole) * 100) : 0;

/**
 * KARTANING ICHKI QATORI — "7 kun ichida", "30 kun ichida".
 *
 * Shakli `UsersStats` dagi bot qatorlari bilan AYNI: yorliq, son,
 * maxraj va foiz. Ikki karta yonma-yon tursa, ular bir xil o'qilishi
 * kerak.
 */
const UsageRow = ({ label, value, total, title }) => (
  <div
    title={title}
    className="flex items-center justify-between gap-2 text-[11px]"
  >
    <span className="shrink-0 text-gray-500">{label}</span>

    <span className="flex items-center gap-1.5 tabular-nums">
      <span className="font-semibold text-gray-700">{value ?? 0}</span>
      {total ? (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">{total}</span>
        </>
      ) : null}
      <span className="font-semibold text-blue-600">
        {pct(value, total)}%
      </span>
    </span>
  </div>
);

/**
 * TIZIMGA KIRGAN O'QUVCHILAR — bosh sahifadagi karta.
 *
 * ⚠️ Bu karta "Premium foydalanuvchilar" ning O'RNIDA turadi (biznes
 * qarori, 2026-11-12). Sabab: premium soni rahbarga hech qanday qaror
 * bermasdi ("12" nima degani?), "nechta bola tizimga kiryapti" esa
 * modulning butun mohiyati — bot ham, o'quvchi paneli ham aynan shuning
 * uchun qurilgan. Premium o'z bo'limida (`/premium`) qoladi.
 *
 * ⚠️ UCHTA RAQAM BIRGA va bu ataylab: faqat "bugun" ko'rsatilsa,
 * yakshanba yoki ta'til kuni 0 chiqib, "tizimdan hech kim
 * foydalanmayapti" degan yolg'on xulosa berardi. 7 va 30 kunlik qatorlar
 * o'sha raqamga kontekst beradi.
 *
 * ⚠️ RUXSATSIZ UMUMAN CHIZILMAYDI (`StaffTasksCard` bilan AYNI qoida) —
 * tanlov `UsersStats` da qilinadi va u yerda o'rnini Premium kartasi
 * egallaydi, ya'ni to'rt ustunli maketda bo'sh joy qolmaydi.
 */
const StudentUsageCard = () => {
  const { can } = usePermissions();

  // Ma'lumot FAOLLIK bo'limidan keladi, shuning uchun ruxsat ham
  // o'shaniki: `users.view` sanoqchilarni ochadi, "kim foydalanyapti"
  // degan savol esa alohida bo'lim (`activity.view`).
  const canSee = can("activity.view");

  const { data, isLoading, isError } = useQuery({
    ...activityQueries.students(),
    enabled: canSee,
  });

  if (!canSee) return null;

  const total = data?.total ?? 0;

  return (
    <Card title="Tizimga kirgan o'quvchilar" className="space-y-3">
      <div className="flex items-center justify-between">
        <div
          title="O'z hisobidan (veb / ilova) yoki ota-onasining Telegram boti orqali"
          className="flex size-9 items-center justify-center rounded-full bg-blue-50"
        >
          <MonitorSmartphone className="size-5 text-blue-700" strokeWidth={1.5} />
        </div>

        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : isError ? (
          <span className="text-2xl font-bold text-gray-300">—</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <Counter
              value={data?.today?.active ?? 0}
              className="text-2xl font-bold tabular-nums text-gray-900"
            />
            {total > 0 && (
              <span className="text-sm font-semibold text-blue-600">
                {pct(data?.today?.active, total)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* ⚠️ Katta raqam — BUGUNGI son, pastdagi qatorlar esa 7 va 30 kunlik.
          Yorliqsiz qoldirilsa, uchtasidan qaysi biri ekani ko'rinmasdi.
          Izoh BIR QATOR: ikki qatorga cho'zilsa, yonidagi kartalar ham
          shu balandlikka tortilib, ekranda bo'sh joy qolardi. */}
      <p
        title={`O'z hisobidan (veb / ilova) yoki ota-onasining Telegram boti orqali${
          total ? ` · ${TOTAL_HINT}: ${total}` : ""
        }`}
        className="truncate text-[11px] leading-snug text-gray-400"
      >
        Bugun{data?.dateLabel ? ` — ${data.dateLabel}` : ""}
      </p>

      {/* 7 va 30 kunlik kesim — bosilsa Faollik bo'limi ochiladi */}
      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : data ? (
        <Link
          to={ACTIVITY_PATH}
          className="block space-y-1 rounded-lg border-t border-gray-100 pt-2 transition hover:bg-gray-50"
        >
          <UsageRow
            label={`${data.weekDays ?? 7} kun ichida`}
            value={data.week?.active}
            total={total}
            title={`Shu davrda kamida bir marta tizimga kirgan o'quvchilar — veb/ilovada ${data.week?.web ?? 0}, botda ${data.week?.bot ?? 0}`}
          />
          <UsageRow
            label={`${data.monthDays ?? 30} kun ichida`}
            value={data.month?.active}
            total={total}
            title={`Shu davrda kamida bir marta tizimga kirgan o'quvchilar — veb/ilovada ${data.month?.web ?? 0}, botda ${data.month?.bot ?? 0}`}
          />
        </Link>
      ) : null}

      {/* ⚠️ TARIX YIG'ILMAGAN BO'LSA EKRAN BUNI AYTADI: hodisa yozuvi
          yaqinda yoqilgan bo'lsa 30 kunlik raqam past chiqadi va uni
          "foydalanish tushib ketdi" deb o'qish mumkin edi. */}
      {data?.collecting && data?.sinceLabel && (
        <p className="text-[11px] leading-snug text-amber-600">
          Ma'lumot {data.sinceLabel} dan beri yig'ilmoqda
        </p>
      )}

      {/* Umumiy ko'rinishda: qaysi filialda qancha (bosilsa — o'sha
          filialga o'tib, Faollik bo'limini ochadi) */}
      <BranchSplit data={data} path="today.active" to={ACTIVITY_PATH} />
    </Card>
  );
};

export default StudentUsageCard;
