// Router
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";

// Icons
import { ArrowLeft, Gift, Users, Wallet, TrendingDown, Coins } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Data & queries
import {
  FINANCE_STATUS_META,
  CLASS_FINANCE_TABLE_COLUMNS,
  NO_INVOICE_REASON_LABELS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/**
 * SINF MOLIYAVIY SAHIFASI.
 *
 * Moliya bosh sahifasidagi sinf qatorini bosganda ochiladi. Bir sinfning
 * BARCHA o'quvchisi (grantdagilar ham — 0 so'm to'lasa ham) va har birining
 * shu oydagi moliyaviy holati: tarif, oylik summa, qarz, holat.
 *
 * ⚠️ Manba — o'quvchilar REGISTRI, hisob-faktura ro'yxati emas: registr sinfning
 * jonli a'zoligidan chiqadi, shuning uchun hisob-fakturasi hali yo'q yoki 0
 * so'mlik (grant) o'quvchi ham ro'yxatda qoladi.
 *
 * ⚠️ PUL RAQAMLARI TANLANGAN OYGA tegishli (`totals.month*` va qatorning
 * `monthAmount` / `monthPaid` / `monthDebt`). Yagona istisno — "Umumiy qarz":
 * u ataylab barcha oylar bo'yicha, chunki kassir undiradigan summa shu.
 * Ilgari butun sahifa faqat umumiy qarzni ko'rsatardi va oy tanlash pul
 * raqamlariga umuman ta'sir qilmasdi — bosh sahifadagi o'sha sinf qatori
 * (oy kesimida) boshqa raqam berardi.
 */
const ClassFinancePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = Number(searchParams.get("month")) || currentMonthKey();

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data, isLoading } = useQuery(
    financeQueries.studentRegistry({ classId, month, limit: 500 }),
  );

  const students = data?.data ?? [];
  const totals = data?.totals;
  const className =
    classes.find((c) => c.id === classId)?.name ??
    students[0]?.className ??
    "Sinf";

  const grantCount = students.filter((s) => s.isGrant).length;
  // Butun oy o'tkazib yuborilgan bo'lsa (ta'til / tizimga o'tishdan oldin)
  // nol raqamlar sabab bilan izohlanadi, aks holda "nega bo'sh?" savoli
  // tug'ilardi.
  const monthSkipLabel = data?.monthSkipReason
    ? NO_INVOICE_REASON_LABELS[data.monthSkipReason]
    : null;

  const setMonth = (v) =>
    setSearchParams((prev) => {
      prev.set("month", String(v));
      return prev;
    });

  return (
    <div className="space-y-4">
      {/* Sarlavha + orqaga + oy */}
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/finance/main/overview"
            className="flex size-9 items-center justify-center rounded-xl text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{className}</h1>
            {/* Oy yorlig'i sarlavha ostida: pul raqamlari AYNAN shu oyga
                tegishli ekani ko'rinib turishi kerak */}
            <p className="text-xs text-gray-400">
              Sinfning moliyaviy holati
              {data?.monthLabel ? ` · ${data.monthLabel}` : ""}
            </p>
          </div>
        </div>

        <Select
          value={String(month)}
          triggerClassName="min-w-40"
          options={MONTH_OPTIONS}
          onChange={(v) => setMonth(Number(v))}
        />
      </div>

      {monthSkipLabel && (
        <Card className="border-amber-200 bg-amber-50 py-3 text-sm text-amber-800">
          {monthSkipLabel} — bu oyga hisob-faktura shakllantirilmaydi, shuning
          uchun oy bo'yicha pul raqamlari nol.
        </Card>
      )}

      {/* Qisqa sanoq — pul qismi TANLANGAN OY bo'yicha */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat icon={Users} accent="text-slate-600" label="O'quvchi" value={students.length} />
        <MiniStat icon={Gift} accent="text-purple-600" label="Grant" value={grantCount} />
        <MiniStat
          icon={Wallet}
          accent="text-blue-600"
          label="To'lovchi"
          value={students.length - grantCount}
        />
        <MiniStat
          icon={Coins}
          accent="text-slate-600"
          label="Kutilgan"
          value={formatMoney(totals?.monthExpected ?? 0)}
          isMoney
        />
        <MiniStat
          icon={Wallet}
          accent="text-green-600"
          label="Yig'ilgan"
          value={formatMoney(totals?.monthCollected ?? 0)}
          isMoney
        />
        <MiniStat
          icon={TrendingDown}
          accent="text-red-600"
          label="Oy qarzi"
          value={formatMoney(totals?.monthDebt ?? 0)}
          isMoney
        />
      </div>

      {/* "Umumiy qarz" — ATAYLAB oy filtridan tashqarida: kassir undiradigan
          summa barcha oylardan yig'iladi. Oy kesimidagi kartalar bilan
          yonma-yon qo'yilmaydi, aks holda ikkisi bitta raqam deb o'qilardi. */}
      <Card className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Umumiy qarz (barcha oylar)
          </p>
          <p className="text-xs text-gray-400">
            Oy filtriga bog'liq emas · {totals?.debtorCount ?? 0} qarzdor
          </p>
        </div>
        <p
          className={cn(
            "text-base font-bold",
            Number(totals?.totalDebt ?? 0) > 0 ? "text-red-600" : "text-gray-900",
          )}
        >
          {formatMoney(totals?.totalDebt ?? 0)}
        </p>
      </Card>

      {/* O'quvchilar jadvali */}
      {isLoading ? (
        <Card className="py-10 text-center text-sm text-gray-500">Yuklanmoqda...</Card>
      ) : students.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Users}
            title="O'quvchi yo'q"
            description="Bu sinfda o'quvchi topilmadi."
          />
        </Card>
      ) : (
        <Table columns={CLASS_FINANCE_TABLE_COLUMNS} className="ring-1 ring-gray-100">
          {students.map((s) => {
            const badge = FINANCE_STATUS_META[s.status] ?? null;
            // Faktura yo'q bo'lsa summa JONLI hisobdan ko'rsatiladi — sababi
            // bilan, "bu raqam hali muhrlanmagan" degani
            const reasonLabel = s.monthInvoice
              ? null
              : (NO_INVOICE_REASON_LABELS[s.noInvoiceReason] ?? null);

            return (
              <Tr
                key={s.id}
                onClick={() => navigate(`/users/${s.id}`)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{s.fullName}</span>
                    {s.isGrant && (
                      <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                        Grant
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{s.username}</span>
                </Td>

                <Td className="text-gray-600">{s.tariff?.name ?? "—"}</Td>

                <Td align="right">
                  <span className={s.monthInvoice ? "text-gray-900" : "text-gray-400"}>
                    {s.monthAmount != null ? formatMoney(s.monthAmount) : "—"}
                  </span>
                  {reasonLabel && (
                    <span className="block text-xs text-gray-400">{reasonLabel}</span>
                  )}
                </Td>

                <Td align="right" className="text-gray-500">
                  {formatMoney(s.monthPaid)}
                </Td>

                <Td
                  align="right"
                  className={cn(
                    "font-medium",
                    s.hasMonthDebt ? "text-red-600" : "text-gray-400",
                  )}
                >
                  {formatMoney(s.monthDebt)}
                </Td>

                <Td
                  align="right"
                  className={s.hasDebt ? "text-red-500" : "text-gray-400"}
                >
                  {formatMoney(s.debt)}
                </Td>

                <Td>
                  {badge && (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};

/** Kichik sanoq katakchasi (sinf sarlavhasi ostida). */
const MiniStat = ({ icon: Icon, accent, label, value, isMoney }) => (
  <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100">
    <div className="flex items-center gap-1.5 text-gray-500">
      <Icon className={cn("size-3.5", accent)} />
      <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p
      className={cn(
        "mt-1 font-bold text-gray-900",
        isMoney ? "text-base" : "text-xl",
      )}
    >
      {value}
    </p>
  </div>
);

export default ClassFinancePage;
