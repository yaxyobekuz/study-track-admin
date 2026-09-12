// Router
import { Link } from "react-router-dom";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateRangeUz } from "@/shared/utils/date.utils";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import IssueList from "./IssueList";
import Notice from "./Notice";
import Pill from "./Pill";

// Helpers & data
import { dayOf, nameOf } from "../helpers/scheduleSync.helpers";
import {
  SLOT_STATUS,
  SLOT_COLUMNS,
  PAYROLL_FLAGS,
  PAYROLL_COLUMNS,
  SUBSTITUTION_KIND,
  ORPHAN_CLASS_META,
} from "../data/scheduleSync.data";

/**
 * Sheet'da UMUMAN yo'q sinflar — ularning amaldagi darslari olib tashlanadi.
 *
 * ⚠️ Sheet rejimida jadval = sheet, butun maktab uchun: sheet'da ustuni
 * yo'q (yoki bo'sh) sinf "darssiz" bo'lib qoladi. Buni odam aniq ko'rishi
 * kerak — jim o'chirish ma'lumot yo'qotish bilan bir xil ko'rinardi.
 */
export const RemovedClasses = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <Notice
      tone="warning"
      title={`Sheet'da yo'q sinflar — jadvali olib tashlanadi (${items.length})`}
    >
      <p className="mb-1.5">
        Bu sinflarning amaldagi darslari o'chiriladi. Oldingi holat
        "Versiyalar" ga saqlanadi — kerak bo'lsa tiklash mumkin.
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.classId || item.className}
            className="flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="font-medium text-gray-900">{item.className}</span>
            <span className="text-gray-500">{item.lessonCount} ta dars</span>
            {item.orphan && <Pill meta={ORPHAN_CLASS_META} />}
          </li>
        ))}
      </ul>
    </Notice>
  );
};

/** Bugungi darslarga ta'sir — dars ketayotgan kuni jadval almashadi. */
export const TodayImpact = ({ impact }) => {
  if (!impact || !impact.changedCells) return null;

  return (
    <Notice
      tone="warning"
      title={`Bugungi darslar o'zgaradi (${impact.dayLabel}): ${impact.changedCells} ta dars`}
    >
      {impact.classes?.length > 0 && (
        <p>
          <span className="font-medium text-gray-900">Sinflar:</span>{" "}
          {impact.classes.join(", ")}
        </p>
      )}
      {impact.teachers?.length > 0 && (
        <p>
          <span className="font-medium text-gray-900">O'qituvchilar:</span>{" "}
          {impact.teachers.join(", ")}
        </p>
      )}
      {impact.gradesAffected > 0 && (
        <p>Bugun shu darslarga {impact.gradesAffected} ta baho qo'yilgan.</p>
      )}
    </Notice>
  );
};

/**
 * O'qituvchilarning haftalik dars soni — soatbay oylikka to'g'ridan-to'g'ri
 * ta'sir qiladi.
 */
export const PayrollImpact = ({ rows = [], className = "" }) => {
  if (rows.length === 0) return null;

  return (
    <Card className={cn("space-y-3", className)}>
      <div>
        <h2 className="font-semibold text-gray-900">O'qituvchilar yuklamasi</h2>
        <p className="text-sm text-gray-500">
          Haftalik dars soni. Soatbay oylik oladiganlarning maoshiga ta'sir
          qiladi.
        </p>
      </div>

      <Table columns={PAYROLL_COLUMNS} className="border border-gray-100">
        {rows.map((row) => {
          const delta = (row.after ?? 0) - (row.before ?? 0);
          return (
            <Tr key={row.teacherId}>
              <Td className="font-medium text-gray-900">{row.teacherName}</Td>
              <Td align="center">{row.before}</Td>
              <Td align="center">
                {row.after}{" "}
                <span
                  className={cn(
                    "text-xs",
                    delta > 0 && "text-emerald-600",
                    delta < 0 && "text-red-600",
                    delta === 0 && "text-gray-400",
                  )}
                >
                  ({delta > 0 ? `+${delta}` : delta})
                </span>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  {row.hourPaid && <Pill meta={PAYROLL_FLAGS.hourPaid} />}
                  {row.payrollSealed && (
                    <Pill
                      meta={PAYROLL_FLAGS.payrollSealed}
                      title="Joriy oy oyligi allaqachon hisoblangan — o'zi qayta hisoblanmaydi"
                    />
                  )}
                  {!row.hourPaid && !row.payrollSealed && (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </Td>
            </Tr>
          );
        })}
      </Table>
    </Card>
  );
};

/** O'rinbosarliklarga ta'sir — asosiy matn serverdan keladi. */
export const SubstitutionImpact = ({ rows = [], className = "" }) => {
  if (rows.length === 0) return null;

  return (
    <Card className={cn("space-y-3", className)}>
      <div>
        <h2 className="font-semibold text-gray-900">
          O'rinbosarlikka ta'siri ({rows.length})
        </h2>
        <p className="text-sm text-gray-500">
          Jadval almashganda bu o'rinbosarliklar boshqa darsga tushishi yoki
          eskirishi mumkin.
        </p>
      </div>

      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li
            key={`${row.substitutionId}-${row.dayLabel}-${row.order}-${index}`}
            className="rounded-xl border border-gray-100 p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-900">{row.message}</p>
              {SUBSTITUTION_KIND[row.kind] && (
                <Pill meta={SUBSTITUTION_KIND[row.kind]} />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {nameOf(row.originalTeacher)} → {nameOf(row.substituteTeacher)} ·{" "}
              {row.className}, {row.dayLabel}, {row.order}-dars ·{" "}
              {formatDateRangeUz(dayOf(row.fromDate), dayOf(row.toDate))}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
};

/** Versiyadagi, lekin hozir tiklab bo'lmaydigan darslar. */
export const DroppedLessons = ({ items = [] }) => (
  <IssueList
    tone="warning"
    title="Tiklanmaydigan darslar"
    description="Bu darslar versiyadan tushib qoladi (masalan, sinf, fan yoki o'qituvchi o'chirilgan)."
    items={items.map(
      (item) =>
        `${item.className}, ${item.dayLabel}, ${item.order}-dars — ${item.reason}`,
    )}
  />
);

/**
 * Sheet'dagi vaqt → dars tartibi. Tartib "Dars vaqtlari" sozlamasidan
 * AYNAN boshlanish va tugash vaqti bo'yicha olinadi.
 */
export const SlotTable = ({ slots = [] }) => {
  const { can } = usePermissions();

  if (slots.length === 0) return null;

  const hasProblem = slots.some((slot) => slot.status !== "ok");

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="font-semibold text-gray-900">Dars vaqtlari</h2>
        <p className="text-sm text-gray-500">
          Sheet'dagi vaqt "Dars vaqtlari" sozlamasidagi dars tartibiga
          moslanadi.
        </p>
      </div>

      <Table columns={SLOT_COLUMNS} className="border border-gray-100">
        {slots.map((slot, index) => (
          <Tr key={`${slot.startTime}-${slot.endTime}-${index}`}>
            <Td>
              {slot.startTime}–{slot.endTime}
            </Td>
            <Td>{slot.order ? `${slot.order}-dars` : "—"}</Td>
            <Td>
              {SLOT_STATUS[slot.status] && <Pill meta={SLOT_STATUS[slot.status]} />}
            </Td>
          </Tr>
        ))}
      </Table>

      {hasProblem && (
        <p className="text-xs text-gray-600">
          Mos kelmagan vaqtni sheet'da yoki{" "}
          {can("schedules.view") ? (
            <Link
              to="/schedule-settings"
              className="font-medium text-blue-600 hover:underline"
            >
              "Dars vaqtlari" sozlamasida
            </Link>
          ) : (
            '"Dars vaqtlari" sozlamasida'
          )}{" "}
          tuzating.
        </p>
      )}
    </Card>
  );
};
