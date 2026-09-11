// React
import { useMemo, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import {
  ClipboardList,
  TrendingUp,
  Award,
  Target,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import SelectField from "@/shared/components/ui/select/SelectField";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import StatCard from "./StatCard";
import { Badge, GradeBadge } from "./ToneBadge";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

/**
 * TEST TARIXI — o'quvchining barcha urinishlari jadvali.
 *
 * ⚠️ KO'RSATKICHLAR FILTRDAN MUSTAQIL. To'rt karta BUTUN tarixni
 * o'lchaydi; fan tanlash va qidiruv faqat jadvalni toraytiradi. Ular
 * ham filtrlansa, "o'rtacha natijasi qancha" degan savolga javob
 * ekrandagi filtrga qarab o'zgarib turardi — ota-onaga aytiladigan
 * raqam esa bitta bo'lishi kerak.
 *
 * ⚠️ "NOTO'G'RI" USTUNI ALOHIDA MAYDONDAN. Uni `savollar − to'g'ri`
 * deb hisoblash tashlab ketilgan savollarni xato deb ko'rsatardi.
 */

const SORTS = {
  date: (r) => r.submittedAt || r.createdAt || "",
  subject: (r) => r.subjectName || r.testTitle || "",
  score: (r) => r.score ?? -1,
};

const StudentHistoryView = ({ attempts = [] }) => {
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: -1 });

  const stats = useMemo(() => {
    const scores = attempts.filter((a) => a.score != null).map((a) => a.score);
    return {
      total: attempts.length,
      average: scores.length
        ? Math.round((scores.reduce((n, x) => n + x, 0) / scores.length) * 10) / 10
        : null,
      best: scores.length ? Math.max(...scores) : null,
      worst: scores.length ? Math.min(...scores) : null,
    };
  }, [attempts]);

  const subjectOptions = useMemo(() => {
    const names = [...new Set(attempts.map((a) => a.subjectName).filter(Boolean))];
    return [
      { value: "", label: "Barcha fanlar" },
      ...names.sort().map((name) => ({ value: name, label: name })),
    ];
  }, [attempts]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = attempts.filter((a) => {
      if (subject && a.subjectName !== subject) return false;
      if (!needle) return true;
      return `${a.subjectName || ""} ${a.testTitle || ""}`
        .toLowerCase()
        .includes(needle);
    });

    const value = SORTS[sort.key];
    if (!value) return filtered;

    return [...filtered].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va < vb) return -1 * sort.dir;
      if (va > vb) return 1 * sort.dir;
      return 0;
    });
  }, [attempts, subject, query, sort]);

  // ⚠️ Uch holatli emas, IKKI holatli almashish (o'sish ↔ kamayish).
  // Uchinchi bosishda "saralashsiz" holatga qaytish foydalanuvchiga
  // tasodifiy tartib bo'lib ko'rinardi.
  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: -1 },
    );

  const header = (key, label, align) => ({
    // ⚠️ `key` MAJBURIY: `label` bu yerda JSX, ya'ni jadval undan
    // barqaror kalit yasay olmaydi (`Table.jsx` dagi izoh).
    key,
    label: (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        aria-sort={
          sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : undefined
        }
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        {sort.key === key ? (
          sort.dir === 1 ? (
            <ChevronUp className="size-3.5" strokeWidth={2} />
          ) : (
            <ChevronDown className="size-3.5" strokeWidth={2} />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-50" strokeWidth={2} />
        )}
      </button>
    ),
    align,
  });

  return (
    <div className="space-y-4">
      {/* ── KO'RSATKICHLAR ────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Jami testlar" value={stats.total} icon={ClipboardList} />
        <StatCard
          label="O'rtacha"
          value={stats.average != null ? `${stats.average}%` : "—"}
          icon={TrendingUp}
        />
        <StatCard
          label="Eng yuqori"
          value={stats.best != null ? `${Math.round(stats.best)}%` : "—"}
          icon={Award}
        />
        <StatCard
          label="Eng past"
          value={stats.worst != null ? `${Math.round(stats.worst)}%` : "—"}
          icon={Target}
        />
      </div>

      <Card className="!p-0">
        {/* ── FILTRLAR ────────────────────── */}
        <div className="flex flex-wrap items-end gap-3 p-4 xs:p-5">
          <div className="w-[180px]">
            <SelectField
              name="historySubject"
              label="Fan"
              value={subject}
              options={subjectOptions}
              onChange={setSubject}
            />
          </div>

          <div className="relative w-[220px]">
            <p className="mb-1.5 text-sm font-medium text-gray-700">Qidiruv</p>
            <Search
              className="pointer-events-none absolute bottom-2.5 left-3 size-4 text-gray-400"
              strokeWidth={1.5}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Fan yoki test nomi…"
              className="pl-9"
            />
          </div>

          <p className="ml-auto pb-2.5 text-sm text-gray-400">
            {rows.length} ta yozuv
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={attempts.length ? "Mos test topilmadi" : "Test topshirilmagan"}
            description={
              attempts.length
                ? "Filtrlarni o'zgartirib ko'ring."
                : "O'quvchi hali diagnostika topshirmagan."
            }
          />
        ) : (
          <Table
            columns={[
              header("date", "Sana"),
              header("subject", "Fan"),
              { label: "Savollar", align: "right" },
              { label: "To'g'ri", align: "right" },
              { label: "Noto'g'ri", align: "right" },
              header("score", "Natija", "right"),
              { label: "Daraja", align: "center" },
              { label: "", align: "right" },
            ]}
          >
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td className="whitespace-nowrap text-gray-700">
                  {formatDateUz(row.submittedAt || row.createdAt)}
                </Td>
                <Td className="font-medium text-gray-900">
                  {row.subjectName || row.testTitle || "Aralash"}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {row.totalQuestions ?? 0}
                </Td>
                <Td align="right" className="font-semibold tabular-nums text-emerald-600">
                  {row.correctCount ?? 0}
                </Td>
                <Td align="right" className="font-semibold tabular-nums text-rose-600">
                  {row.wrongCount ?? 0}
                </Td>
                <Td align="right" className="font-bold tabular-nums text-gray-900">
                  {row.score != null ? `${Math.round(row.score)}%` : "—"}
                </Td>
                <Td align="center">
                  {/* ⚠️ TUGALLANMAGAN URINISHDA DARAJA YO'Q va "—" chizish
                      uni "baholanmagan" bilan chalkashtirardi: birinchisi
                      hali davom etyapti, ikkinchisi esa tugagan-u ball
                      chiqmagan. Ular boshqa-boshqa holat. */}
                  {row.status === "in_progress" ? (
                    <Badge className="bg-blue-50 text-blue-700 ring-blue-200">
                      Davom etmoqda
                    </Badge>
                  ) : (
                    <GradeBadge grade={row.grade} />
                  )}
                </Td>
                <Td align="right">
                  <Link
                    to={`/diagnostics/attempts/${row.id}`}
                    className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Tahlil
                  </Link>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default StudentHistoryView;
