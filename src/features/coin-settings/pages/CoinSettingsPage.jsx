// Toast
import { toast } from "sonner";

// React
import { useState, useEffect, useCallback } from "react";

// Icons
import { Settings, TrendingUp, Users, Coins } from "lucide-react";

// API
import { coinsAPI } from "@/shared/api/coins.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";

const CoinSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const [form, setForm] = useState({
    dailyCoinPercentage: 60,
    schoolRankBonus: 100,
    classRankBonus: 20,
    minDailyGradeForCoin: 10,
  });

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsRes, statsRes] = await Promise.all([
        coinsAPI.getSettings(),
        coinsAPI.getStats(),
      ]);
      const s = settingsRes.data.data;
      setForm({
        dailyCoinPercentage: s.dailyCoinPercentage,
        schoolRankBonus: s.schoolRankBonus,
        classRankBonus: s.classRankBonus,
        minDailyGradeForCoin: s.minDailyGradeForCoin ?? 10,
      });
      setStats(statsRes.data.data);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await coinsAPI.updateSettings(form);
      toast.success("Sozlamalar saqlandi");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Sozlamalar formasi */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Settings className="size-5 text-indigo-500" />
          Coin Sozlamalari
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coin olish uchun minimal ball
            </label>
            <p className="text-xs text-gray-500 mb-2">
              O'quvchi kunlik shu balldan kam to'plasa coin berilmaydi (default: 10)
            </p>
            <input
              type="number"
              min="0"
              value={form.minDailyGradeForCoin}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  minDailyGradeForCoin: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kunlik coin foizi (%)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Har kuni o'quvchining umumiy ball × foiz = coin (pastga yaxlitlanadi)
            </p>
            <input
              type="number"
              min="0"
              max="100"
              value={form.dailyCoinPercentage}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  dailyCoinPercentage: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maktab 1-o'rin bonusi (coin)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Har yakshanba maktab reytingida birinchi o'quvchiga beriladigan bonus
            </p>
            <input
              type="number"
              min="0"
              value={form.schoolRankBonus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  schoolRankBonus: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sinf 1-o'rin bonusi (coin)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Har yakshanba har bir sinfda birinchi o'quvchiga beriladigan bonus (bir student bir necha sinfda #1 bo'lsa faqat bir marta oladi)
            </p>
            <input
              type="number"
              min="0"
              value={form.classRankBonus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  classRankBonus: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-4 text-sm font-medium"
          >
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </Card>

      {/* Statistika */}
      <div className="space-y-5">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-indigo-500" />
            Umumiy Statistika
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 p-4 rounded-2xl text-center">
              <p className="text-2xl font-bold text-indigo-700">
                {stats?.totalCoinsDistributed ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Jami tarqatilgan coin</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl text-center">
              <p className="text-2xl font-bold text-green-700">
                {stats?.totalStudents ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Faol o'quvchilar</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="size-5 text-indigo-500" />
            Top 10 o'quvchilar
          </h2>

          {!stats?.topEarners?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Hali coin tarqatilmagan
            </p>
          ) : (
            <div className="space-y-1">
              {stats.topEarners.map((student, i) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 text-sm font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}
                    >
                      {i + 1}.
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      {student.classes?.length > 0 && (
                        <p className="text-xs text-gray-400">
                          {student.classes.map((c) => c.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="size-3.5 text-yellow-500" />
                    <span className="font-semibold text-indigo-600 text-sm">
                      {student.coinBalance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CoinSettings;
