// Router
import { useSearchParams } from "react-router-dom";

// Components
import Select from "@/shared/components/ui/select/Select";
import CallButton from "@/shared/components/ui/CallButton";
import UsersListView from "../components/UsersListView";
import UserRowActions from "../components/UserRowActions";
import StudentCoinCell from "../components/StudentCoinCell";
import CoinWeekNav from "../components/CoinWeekNav";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";

// Data
import {
  COIN_PERIOD_OPTIONS,
  COIN_PERIOD_TOTAL,
  COIN_PERIOD_WEEK,
  getInitials,
  getStudentTableColumns,
} from "../data/users.data";

/**
 * O'quvchilar sahifasi.
 *
 * Xodimlar sahifasidan farqi: sinf filtri bor va o'chirish yo'q — o'quvchi
 * faqat arxivlanadi, chunki uning davomati, baholari va moliyaviy tarixi
 * saqlanib qolishi kerak.
 *
 * TANGA USTUNI IKKI KESIMDA: sukut — hozirgi qoldiq, "Tangalar: haftalik"
 * tanlansa — TANLANGAN haftada topilgan tanga (serverda hisoblanadi,
 * `coin.service.js`) va toolbar ostida hafta navigatori chiqadi.
 *
 * Ikkala tanlov ham URL'da (`?coins=week&coinWeek=2026-10-12`): ro'yxat
 * holatini link qilsa bo'ladi va "orqaga" qaytganda yo'qolmaydi. Hafta
 * kaliti ISO ko'rinishida — bu FORMAT emas, so'rov parametri (`dates.md`).
 */
const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: classes = [] } = useClasses();

  const classFilter = searchParams.get("class") || "all";
  const coinPeriod =
    searchParams.get("coins") === COIN_PERIOD_WEEK
      ? COIN_PERIOD_WEEK
      : COIN_PERIOD_TOTAL;
  const isWeeklyCoins = coinPeriod === COIN_PERIOD_WEEK;
  // Hafta ichidagi istalgan kun — serverga langar sifatida ketadi. Bo'lmasa
  // joriy hafta: shu sababli "joriy hafta" havolasi paramni o'chiradi,
  // qotib qolgan sanani yozmaydi (ertaga ham joriy hafta bo'lib qolsin).
  const coinWeek = isWeeklyCoins ? searchParams.get("coinWeek") : null;

  const classOptions = [
    { value: "all", label: "Barcha sinflar" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const handleClassChange = (value) =>
    setSearchParams((prev) => {
      if (value && value !== "all") prev.set("class", value);
      else prev.delete("class");
      prev.delete("page");
      return prev;
    });

  // ⚠️ Sahifa BOSHIGA QAYTARILMAYDI (sinf filtridan farqi): tanga kesimi
  // ro'yxat TARKIBINI o'zgartirmaydi, faqat bitta ustundagi raqamni —
  // 5-sahifada turib kesimni almashtirgan odam o'sha yerda qolishi kerak.
  const handleCoinPeriodChange = (value) =>
    setSearchParams((prev) => {
      if (value === COIN_PERIOD_WEEK) prev.set("coins", COIN_PERIOD_WEEK);
      else prev.delete("coins");
      // Umumiy kesimga qaytilsa hafta langari ham olib tashlanadi — aks
      // holda u URL'da osilib qolib, keyingi safar kutilmagan haftani
      // ochardi.
      prev.delete("coinWeek");
      return prev;
    });

  const handleCoinWeekChange = (weekAnchor) =>
    setSearchParams((prev) => {
      if (weekAnchor) prev.set("coinWeek", weekAnchor);
      else prev.delete("coinWeek");
      return prev;
    });

  return (
    <UsersListView
      variant="student"
      title="O'quvchilar"
      description="Sinflarga biriktirilgan o'quvchilar ro'yxati"
      columns={getStudentTableColumns(coinPeriod)}
      emptyText="O'quvchilar topilmadi"
      emptyArchivedText="Arxivlangan o'quvchilar yo'q"
      // Umumiy qoldiq — tizimning sukutdagi ko'rinishi, shuning uchun
      // parametr faqat haftalik kesimda yuboriladi (so'rov kaliti ham,
      // serverdagi qo'shimcha so'rov ham bekorga o'zgarmasin).
      queryParams={
        isWeeklyCoins
          ? {
              coinPeriod: COIN_PERIOD_WEEK,
              ...(coinWeek && { coinWeek }),
            }
          : {}
      }
      subToolbar={
        isWeeklyCoins
          ? (data) => (
              <CoinWeekNav
                period={data?.coinPeriod}
                onChange={handleCoinWeekChange}
              />
            )
          : null
      }
      filters={
        <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
          <Select
            value={classFilter}
            options={classOptions}
            placeholder="Sinf tanlang"
            onChange={handleClassChange}
            triggerClassName="w-full sm:w-44 sm:shrink-0"
          />

          <Select
            value={coinPeriod}
            options={COIN_PERIOD_OPTIONS}
            placeholder="Tanga kesimi"
            onChange={handleCoinPeriodChange}
            triggerClassName="w-full sm:w-48 sm:shrink-0"
          />
        </div>
      }
      renderRow={(user, { isArchived }) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                {getInitials(user)}
              </span>
              <div>
                <p className="font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
                {isArchived && user.archiveNote && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    Izoh: {user.archiveNote}
                  </p>
                )}
              </div>
            </div>
          </td>

          <td className="px-4 py-3 text-gray-500">
            {user.classes?.length > 0
              ? user.classes.map((cls) => cls.name).join(", ")
              : "—"}
          </td>

          {/* Qo'ng'iroq tugmasi qator bosilishiga tarqalmasin — aks holda
              qo'ng'iroq o'rniga detal sahifasi ochilib ketardi */}
          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <CallButton
              compact
              phone={user.phone}
              parentPhone={user.parentPhone}
            />
          </td>

          <td className="px-4 py-3">
            <StudentCoinCell user={user} isWeekly={isWeeklyCoins} />
          </td>

          <td className="px-4 py-3 text-gray-500">{user.penaltyPoints ?? 0}</td>

          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <UserRowActions user={user} isArchived={isArchived} />
          </td>
        </>
      )}
    />
  );
};

export default StudentsPage;
