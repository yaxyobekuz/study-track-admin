// Icons
import { CalendarX2 } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import StatTile from "./StatTile";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import {
  DAY_LABEL,
  WORKLOAD_CLASS_COLUMNS,
  buildWorkloadTiles,
} from "../../data/staffWorkload.data";
import { schedulesQueries } from "@/features/schedules/queries/schedules.queries";

/**
 * O'qituvchining DARS YUKLAMASI — "necha soat, qaysi sinflarda, qachon".
 *
 * Manba — AMALDAGI dars jadvali, rejalashtirish qatlami emas: profilda
 * "nima rejalashtirilgan" emas, "hozir nima o'tilyapti" ko'rsatiladi.
 *
 * Uch qavat ATAYLAB shu tartibda: avval jami ko'rsatkich (bir qarashda
 * yuklama), keyin sinflar kesimi ("kimga dars beradi"), oxirida haftalik
 * jadval (tafsilot). Yuqoridan pastga — umumiydan xususiyga.
 *
 * Oylik kartasi javobda BO'LSAGINA chiziladi: uni `payroll.view` bo'yicha
 * server kesadi, shuning uchun bu yerda ruxsat tekshiruvi takrorlanmaydi.
 */
const StaffWorkloadTab = ({ user }) => {
  const { data, isLoading, isError } = useQuery(
    schedulesQueries.teacherWorkload(user.id),
  );

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  if (isError || !data) {
    return (
      <Card className="text-center">
        <p className="text-sm text-red-500">Dars yuklamasini yuklab bo'lmadi</p>
      </Card>
    );
  }

  const tiles = buildWorkloadTiles(data);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "grid grid-cols-1 gap-3 xs:grid-cols-2",
          tiles.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {tiles.map((tile) => (
          <StatTile key={tile.key} {...tile} />
        ))}
      </div>

      {data.totals.weeklyHours === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={CalendarX2}
            title="Dars jadvalida yo'q"
            description="Bu o'qituvchiga hali dars biriktirilmagan. Darslar sinfning dars jadvalida belgilanadi."
          />
        </Card>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-semibold text-gray-900">
              Sinflar bo'yicha yuklama
            </h2>

            <Table columns={WORKLOAD_CLASS_COLUMNS}>
              {data.classes.map((row) => (
                <Tr key={row.id}>
                  <Td className="font-medium text-gray-900">{row.name}</Td>

                  <Td nowrap={false} className="text-gray-500">
                    {row.subjects.length > 0
                      ? row.subjects
                          .map((subject) => `${subject.name} (${subject.hours})`)
                          .join(", ")
                      : "—"}
                  </Td>

                  <Td align="right" className="font-medium">
                    {row.hours}
                  </Td>
                </Tr>
              ))}
            </Table>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-gray-900">Haftalik jadval</h2>

            {/* Kun — karta. Odam jadvalni aynan shunday o'qiydi:
                "dushanbada nima bor?". Darssiz kun ham chiziladi:
                "payshanbada dars yo'q" ham javob. */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.days.map((day) => (
                <div key={day.day} className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {DAY_LABEL[day.day] ?? day.day}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {day.hours > 0 ? `${day.hours} soat` : "Dars yo'q"}
                    </span>
                  </div>

                  {day.lessons.length === 0 ? (
                    <p className="mt-3 text-xs text-gray-300">—</p>
                  ) : (
                    <ul className="mt-3 space-y-1.5">
                      {day.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-start gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5"
                        >
                          <span className="w-4 shrink-0 pt-0.5 text-[11px] font-medium tabular-nums text-gray-400">
                            {lesson.order}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {lesson.subject?.name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {lesson.class?.name ?? "—"}
                            </p>
                          </div>

                          {lesson.startTime && lesson.endTime && (
                            <span className="shrink-0 pt-0.5 text-[11px] tabular-nums text-gray-400">
                              {lesson.startTime}–{lesson.endTime}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StaffWorkloadTab;
