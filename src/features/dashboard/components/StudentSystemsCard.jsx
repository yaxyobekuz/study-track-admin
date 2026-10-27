// Router
import { Link, useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ClipboardList, FileText } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries & data
import { studentSystemsQueries } from "@/features/studentSystems/queries/studentSystems.queries";
import {
  STUDENT_SYSTEMS,
  SYSTEMS_REPORT_PATH,
} from "@/features/studentSystems/data/studentSystems.data";

/**
 * ERP VA KUNDALIK.COM — bosh sahifadagi karta.
 *
 * ⚠️ Bu karta "Bog'lanmaganlar" ning O'RNIDA turadi (biznes qarori,
 * 2026-10-27). Botga bog'lanmaganlar raqami YO'QOLMADI — u Faollik
 * bo'limida, o'quvchilar ro'yxati bilan birga qoldi
 * (`activityDashboard` → "Bog'lanmaganlar").
 *
 * ⚠️ ASOSIY RAQAM — "kamida bitta tizimga kiritilmagan". Aynan u ish
 * talab qiladi; "ikkalasida ham bor" esa allaqachon bajarilgan ish.
 * Kartaning o'zida har tizim bo'yicha aniq sonlar ham turadi (bor / yo'q),
 * chunki ish ikki xil: ERP ga kiritish va Kundalik.com ga kiritish.
 *
 * ⚠️ IKKI SONNI QO'SHIB BO'LMAYDI: "ERP da yo'q 82" va "Kundalik da yo'q
 * 52" ning yig'indisi 134 EMAS — ikkala tizimga ham kiritilmagan bola u
 * paytda ikki marta sanalardi. Shuning uchun katta raqam serverdan
 * keladi (`students − ikkalasida ham bor`), panelda hisoblanmaydi.
 *
 * ⚠️ RUXSATSIZ UMUMAN CHIZILMAYDI (`BotActivityStats` bilan AYNI qoida):
 * bosh sahifada "ruxsatingiz yo'q" degan quti keraksiz shovqin bo'lardi.
 */
const StudentSystemsCard = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const allowed = can("studentSystems.view");

  const { data, isLoading, isError } = useQuery({
    ...studentSystemsQueries.summary(),
    enabled: allowed,
  });

  if (!allowed) return null;

  const title = "ERP va Kundalik.com hisobotini ochish";

  return (
    <Card title="ERP va Kundalik.com" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {/* Belgi — hisobotga olib boradi. Ustiga kelganda hujjat
            belgisiga almashadi: dizayn o'zgarmaydi, lekin bosiladigani
            ko'rinib turadi (`UsersStats` bilan AYNI naqsh). */}
        <button
          type="button"
          title={title}
          aria-label={title}
          onClick={() => navigate(SYSTEMS_REPORT_PATH)}
          className="group relative flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 outline-none transition hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <ClipboardList
            className="size-5 text-amber-700 transition-opacity group-hover:opacity-0"
            strokeWidth={1.5}
          />
          <FileText
            className="absolute size-4 text-amber-700 opacity-0 transition-opacity group-hover:opacity-100"
            strokeWidth={1.5}
          />
        </button>

        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : isError ? (
          <span className="text-2xl font-bold text-gray-300">—</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <Counter
              value={data?.missingAny ?? 0}
              className="text-2xl font-bold tabular-nums text-gray-900"
            />
            {data?.students ? (
              <span className="text-sm font-medium text-gray-400">
                / {data.students}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-gray-500">
        Kamida bitta tizimga kiritilmagan o&apos;quvchilar
      </p>

      {/* HAR TIZIM BO'YICHA ANIQ SONLAR: yashil — bor, qizil — yo'q.
          Bosilsa hisobot ochiladi. */}
      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : data ? (
        <Link
          to={SYSTEMS_REPORT_PATH}
          className="block space-y-1 rounded-lg border-t border-gray-100 pt-2 transition hover:bg-gray-50"
        >
          {STUDENT_SYSTEMS.map(({ key, label }) => (
            <SystemRow key={key} label={label} counts={data.systems?.[key]} />
          ))}
        </Link>
      ) : null}

      {/* Umumiy ko'rinishda: qaysi filialda qancha (bosilsa — o'sha
          filialga o'tadi va bo'limni ochadi) */}
      <BranchSplit data={data} path="missingAny" to="/student-systems" />
    </Card>
  );
};

/**
 * Bitta tizim qatori: "ERP   380 / 82".
 *
 * ⚠️ Ikki son BIRGA turadi va bu ataylab: faqat "yo'q" ko'rsatilsa, 82
 * raqami 100 o'quvchili maktabda ham, 500 o'quvchilida ham bir xil
 * ko'rinardi — holbuki ular butunlay boshqa holat.
 */
const SystemRow = ({ label, counts }) => (
  <div
    title={`${label}: ${counts?.yes ?? 0} ta bor, ${counts?.no ?? 0} ta yo'q`}
    className="flex items-center justify-between gap-2 text-[11px]"
  >
    <span className="min-w-0 truncate text-gray-500">{label}</span>

    <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
      <span className="font-semibold text-emerald-600">{counts?.yes ?? 0}</span>
      <span className="text-gray-300">/</span>
      <span className="font-semibold text-red-500">{counts?.no ?? 0}</span>
    </span>
  </div>
);

export default StudentSystemsCard;
