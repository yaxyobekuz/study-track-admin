// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Router
import { Link, useParams } from "react-router-dom";

// Icons
import {
  ArrowLeft,
  BarChart3,
  Award,
  Coins,
  Loader2,
  AlertCircle,
} from "lucide-react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Data
import { REWARD_TABS, REWARD_TAB_LABELS } from "../data/seasonRewards.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import SchoolTiersForm from "../components/SchoolTiersForm";
import ClassTiersForm from "../components/ClassTiersForm";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { formatScore } from "@/shared/utils/formatScore";

/**
 * Mavsum mukofotlari sahifasi (admin).
 * 3 ta tab: Statistika, Darajalar, Tarqatish.
 */
const SeasonRewardsPage = () => {
  const { id: seasonId } = useParams();
  const [tab, setTab] = useState(REWARD_TABS.STATS);

  const { data: season, isLoading } = useQuery({
    queryKey: ["test-season", seasonId],
    queryFn: () => testSeasonsAPI.getOne(seasonId).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }
  if (!season) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Mavsum topilmadi</p>
      </Card>
    );
  }

  const tabIcons = {
    [REWARD_TABS.STATS]: BarChart3,
    [REWARD_TABS.TIERS]: Award,
    [REWARD_TABS.DISTRIBUTE]: Coins,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link to="/test-seasons">
          <Button variant="outline" size="sm" className="size-9 p-0">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            {season.name} - Mukofotlar
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {formatDateUZ(season.startDate)} → {formatDateUZ(season.endDate)}
            {season.distributedAt && (
              <span className="ml-2 text-green-700">
                · Tarqatilgan ({formatDateUZ(season.distributedAt)})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        {Object.values(REWARD_TABS).map((t) => {
          const Icon = tabIcons[t];
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon size={16} />
              {REWARD_TAB_LABELS[t]}
            </button>
          );
        })}
      </div>

      {tab === REWARD_TABS.STATS && <StatsTab seasonId={seasonId} />}
      {tab === REWARD_TABS.TIERS && <TiersTab season={season} />}
      {tab === REWARD_TABS.DISTRIBUTE && <DistributeTab season={season} />}
    </div>
  );
};

const StatsTab = ({ seasonId }) => {
  // "" = maktab (umumiy), aks holda sinf ID
  const [classId, setClassId] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll().then((res) => res.data.data || res.data),
  });

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["season-stats", seasonId, classId || "school"],
    queryFn: () =>
      (classId
        ? testSeasonsAPI.getClassStats(seasonId, classId)
        : testSeasonsAPI.getStats(seasonId)
      ).then((res) => res.data.data),
  });

  const classList = Array.isArray(classes) ? classes : [];

  // Daraja tanlovi: "" = maktab (umumiy), aks holda sinf
  const levelOptions = [
    { value: "", label: "Maktab (umumiy)" },
    ...classList.map((c) => ({ value: c._id, label: c.name })),
  ];

  return (
    <Card>
      {/* Sinf / maktab tanlovi */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Daraja:</span>
        <SelectSearch
          value={classId}
          onChange={setClassId}
          options={levelOptions}
          placeholder="Maktab (umumiy)"
          searchPlaceholder="Sinfni qidirish..."
          emptyText="Sinf topilmadi"
          triggerClassName="w-56"
        />
      </div>

      {isLoading ? (
        <p className="text-center py-10 text-gray-500">Yuklanmoqda...</p>
      ) : stats.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <BarChart3 size={40} className="text-gray-300" />
          <p className="mt-3 text-gray-600">Hozircha natijalar yo'q</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 px-3 font-medium w-12">#</th>
                <th className="py-2 px-3 font-medium">O'quvchi</th>
                <th className="py-2 px-3 font-medium">Sinflar</th>
                <th className="py-2 px-3 font-medium">Topshirgan</th>
                <th className="py-2 px-3 font-medium">Biriktirilgan</th>
                <th className="py-2 px-3 font-medium">O'rtacha ball</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((r) => (
                <tr key={r.student._id} className="border-b hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-gray-500">
                    {classId ? r.classRank : r.rank}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">
                    {r.student.firstName} {r.student.lastName}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {(r.student.classes || []).map((c) => c.name).join(", ")}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{r.resultCount}</td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {r.assignedCount}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-700">
                    {formatScore(r.averageScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

const TiersTab = ({ season }) => {
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll().then((res) => res.data.data || res.data),
  });

  return (
    <div className="space-y-5">
      <Card>
        <SchoolTiersForm season={season} />
      </Card>

      <Card>
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Sinf bo'yicha o'rinlar (top-N)</h3>
          <p className="text-sm text-gray-600">
            Har sinfning eng yaxshi o'quvchilariga coin tarqatish.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {(Array.isArray(classes) ? classes : []).map((c) => (
              <ClassTiersForm
                key={c._id}
                season={season}
                classId={c._id}
                className={c.name}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const DistributeTab = ({ season }) => {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["season-distribute-preview", season._id],
    queryFn: () =>
      testSeasonsAPI
        .previewDistribution(season._id)
        .then((res) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (force) => testSeasonsAPI.distributeCoins(season._id, force),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["test-season", season._id] });
      queryClient.invalidateQueries({
        queryKey: ["season-distribute-preview", season._id],
      });
      toast.success(
        `Tarqatildi: ${res.data.data.distributed}, o'tkazildi: ${res.data.data.skipped}`,
      );
      setShowConfirm(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  if (isLoading) return <Card><p className="text-center py-10 text-gray-500">Yuklanmoqda...</p></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Jami coinlar" value={preview?.totalCoins || 0} highlight />
          <Stat label="Mukofotlar soni" value={preview?.totalAwards || 0} />
          <Stat label="O'quvchilar" value={preview?.studentCount || 0} />
          <Stat
            label="Holat"
            value={season.distributedAt ? "Tarqatilgan" : "Kutmoqda"}
          />
        </div>
        {season.distributedAt && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle size={16} />
            Coinlar allaqachon tarqatilgan. Qayta tarqatish takroriy
            mukofotlarni qo'shmaydi (idempotent), faqat yangilarini qo'shadi.
          </div>
        )}
      </Card>

      {preview && preview.students.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 px-3 font-medium">O'quvchi</th>
                  <th className="py-2 px-3 font-medium">Mukofotlar</th>
                  <th className="py-2 px-3 font-medium">Jami coin</th>
                </tr>
              </thead>
              <tbody>
                {preview.students.map((s) => (
                  <tr key={s.student._id} className="border-b hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">
                      {s.student.firstName} {s.student.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {s.awards.map((a, i) => (
                        <div key={i} className="text-xs">
                          {a.reason} · <span className="font-semibold">+{a.amount}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-green-700">
                      +{s.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-end gap-3">
        {!showConfirm ? (
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!preview || preview.totalAwards === 0}
            className="gap-2"
          >
            <Coins size={16} />
            Coinlarni tarqatish
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={mutation.isPending}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={() => mutation.mutate(Boolean(season.distributedAt))}
              disabled={mutation.isPending}
              className="gap-2"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Coins size={16} />
              )}
              Tasdiqlash
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, highlight = false }) => (
  <div
    className={cn(
      "p-3 rounded-xl text-center",
      highlight ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-900",
    )}
  >
    <p className="text-xs text-gray-600">{label}</p>
    <p className="font-bold mt-1">{value}</p>
  </div>
);

export default SeasonRewardsPage;
