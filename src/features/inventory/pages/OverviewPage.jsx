// Router
import { Link } from "react-router-dom";

// Icons
import {
  Boxes,
  Wrench,
  TriangleAlert,
  Wallet,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EmptyState from "@/shared/components/ui/EmptyState";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { inventoryQueries } from "../queries/inventory.queries";

/**
 * UMUMIY MANZARA — bo'limning bosh ekrani.
 *
 * Uchta savolga javob beradi: bazamiz qanday holatda, qancha zarar
 * ko'rdik, qanchasini undirdik. Ustiga bugungi monitoring intizomi —
 * "kim hisobot bermadi" ro'yxati kun davomida eng ko'p kerak bo'ladigan blok.
 */
const OverviewPage = () => {
  const { data: summary, isLoading } = useQuery(inventoryQueries.summary());
  const { data: pending } = useQuery(inventoryQueries.pendingChecks());
  const { data: byLocation = [] } = useQuery(inventoryQueries.byLocation({ limit: 8 }));
  const { data: byItem = [] } = useQuery(inventoryQueries.byItem({ limit: 8 }));

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }
  if (!summary) return null;

  return (
    <div className="space-y-4">
      {/* ── Asosiy ko'rsatkichlar ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Boxes}
          label="Xatlovdagi jihozlar"
          value={`${summary.stock.totalQuantity} ta`}
          hint={`${summary.stock.serviceableQuantity} ta yaroqli`}
          tone="blue"
        />
        <StatCard
          icon={Wrench}
          label="Yaroqsiz holatda"
          value={`${summary.stock.brokenQuantity} ta`}
          hint="ta'mirlash yoki hisobdan chiqarish kutmoqda"
          tone={summary.stock.brokenQuantity > 0 ? "amber" : "gray"}
        />
        <StatCard
          icon={TriangleAlert}
          label="Zarar summasi"
          value={formatMoney(summary.damage.amount)}
          hint={`${summary.damage.count} ta hodisa`}
          tone="red"
        />
        <StatCard
          icon={Wallet}
          label="Undirilgan"
          value={formatMoney(summary.recovery.recoveredAmount)}
          hint={`qoldiq qarz: ${formatMoney(summary.recovery.outstandingAmount)}`}
          tone="green"
        />
      </div>

      {/* ── Undiruv holati ── */}
      <Card>
        <h2 className="font-semibold text-gray-900">Zararning taqdiri</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Har bir zarar uchta yo'ldan birini tanlaydi: aybdorga yoziladi,
          maktab hisobidan qoplanadi yoki hali qaror qabul qilinmagan.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniStat
            label="Aybdorlarga yozilgan"
            value={formatMoney(summary.damage.chargedAmount)}
            className="text-blue-700"
          />
          <MiniStat
            label="Maktab hisobidan"
            value={formatMoney(summary.damage.waivedAmount)}
            hint={`${summary.damage.waivedCount} ta hodisa`}
            className="text-gray-700"
          />
          <MiniStat
            label="Qaror kutmoqda"
            value={formatMoney(summary.damage.unchargedAmount)}
            hint="kim to'lashi hal qilinmagan"
            className="text-amber-700"
          />
        </div>
      </Card>

      {/* ── Bugungi monitoring intizomi ── */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-gray-900">Bugungi hisobotlar</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {summary.monitoring.submittedToday} / {summary.monitoring.totalLocations} xona
              hisobot berdi
            </p>
          </div>

          <Link
            to="/inventory/checks"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Hisobotlar
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {!pending || pending.pendingCount === 0 ? (
          <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
            Barcha xonalar bugungi hisobotni yubordi.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {pending.locations.map((location) => (
              <div
                key={location.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-amber-900">{location.name}</span>
                <span className="text-xs text-amber-700">
                  {location.responsible
                    ? `Mas'ul: ${location.responsible.firstName} ${
                        location.responsible.lastName ?? ""
                      }`.trim()
                    : "Mas'ul belgilanmagan"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Kesimlar ── */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-0 xs:p-0">
          <div className="px-4 pt-4 xs:px-5 xs:pt-5">
            <h2 className="font-semibold text-gray-900">Xonalar bo'yicha zarar</h2>
            <p className="mt-0.5 text-xs text-gray-500">Eng ko'p zarar ko'rilgan xonalar</p>
          </div>

          {byLocation.length === 0 ? (
            <EmptyState icon={Boxes} title="Ma'lumot yo'q" description="Hali zarar qayd etilmagan." />
          ) : (
            <Table
              className="mt-3 rounded-none"
              columns={[
                "Xona",
                { label: "Jihoz", align: "right" },
                { label: "Yaroqsiz", align: "right" },
                { label: "Zarar", align: "right" },
              ]}
            >
              {byLocation.map((row) => (
                <Tr key={row.locationId}>
                  <Td className="font-medium text-gray-900">
                    {row.locationName}
                    <span className="block text-xs font-normal text-gray-400">
                      {row.typeLabel}
                    </span>
                  </Td>
                  <Td className="text-right text-gray-500">{row.totalQuantity}</Td>
                  <Td
                    className={cn(
                      "text-right",
                      row.brokenQuantity > 0 ? "font-medium text-amber-700" : "text-gray-400",
                    )}
                  >
                    {row.brokenQuantity}
                  </Td>
                  <Td className="text-right font-semibold text-gray-900">
                    {formatMoney(row.damageAmount)}
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card className="p-0 xs:p-0">
          <div className="px-4 pt-4 xs:px-5 xs:pt-5">
            <h2 className="font-semibold text-gray-900">Jihozlar bo'yicha</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Nima ko'p sinadi va bu maktabga qancha turadi
            </p>
          </div>

          {byItem.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Ma'lumot yo'q"
              description="Hali zarar qayd etilmagan."
            />
          ) : (
            <Table
              className="mt-3 rounded-none"
              columns={[
                "Jihoz",
                { label: "Singan", align: "right" },
                { label: "Yo'qolgan", align: "right" },
                { label: "Zarar", align: "right" },
              ]}
            >
              {byItem.map((row) => (
                <Tr key={row.itemId}>
                  <Td className="font-medium text-gray-900">
                    {row.itemName}
                    {row.categoryName && (
                      <span className="block text-xs font-normal text-gray-400">
                        {row.categoryName}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right text-gray-500">{row.brokenQuantity}</Td>
                  <Td className="text-right text-gray-500">{row.missingQuantity}</Td>
                  <Td className="text-right font-semibold text-gray-900">
                    {formatMoney(row.amount)}
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  green: "bg-green-50 text-green-600",
  gray: "bg-gray-100 text-gray-500",
};

const StatCard = ({ icon: Icon, label, value, hint, tone = "gray" }) => (
  <Card>
    <div className="flex items-start gap-3">
      <span className={cn("rounded-xl p-2", TONES[tone])}>
        <Icon className="size-4" />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-gray-900">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  </Card>
);

const MiniStat = ({ label, value, hint, className }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={cn("mt-0.5 text-lg font-bold", className)}>{value}</p>
    {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
  </div>
);

export default OverviewPage;
