// Toast
import { toast } from "sonner";

// API
import { testSettingsAPI } from "@/features/test-settings/api/testSettings.api";

// React
import { useState, useEffect, useCallback } from "react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

const TestSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({ minScore: 56, maxScore: 189 });

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await testSettingsAPI.getSettings();
      const s = res.data.data;
      setForm({ minScore: s.minScore, maxScore: s.maxScore });
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async () => {
    const min = Number(form.minScore);
    const max = Number(form.maxScore);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      toast.error("Minimal va maksimal ball son bo'lishi kerak");
      return;
    }
    if (min < 0) {
      toast.error("Minimal ball manfiy bo'lishi mumkin emas");
      return;
    }
    if (max <= min) {
      toast.error("Maksimal ball minimal balldan katta bo'lishi kerak");
      return;
    }

    setIsSaving(true);
    try {
      await testSettingsAPI.updateSettings({ minScore: min, maxScore: max });
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title mb-4">Test ball sozlamalari</h1>

      <Card>
        <InputGroup className="md:grid-cols-2">
          <InputField
            min="0"
            required
            type="number"
            placeholder="56"
            value={form.minScore}
            label="Minimal o'tish bali"
            description="Faqat o'tdi/yiqildi chizig'i - ballga qo'shilmaydi"
            onChange={(e) =>
              setForm((f) => ({ ...f, minScore: Number(e.target.value) }))
            }
          />

          <InputField
            min="1"
            required
            type="number"
            placeholder="189"
            value={form.maxScore}
            label="Maksimal ball"
            description="Test savollariga qiyinlik darajasiga qarab avtomatik taqsimlanadi"
            onChange={(e) =>
              setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))
            }
          />

          <Button disabled={isSaving} onClick={handleSave}>
            Saqlash{isSaving && "..."}
          </Button>
        </InputGroup>
      </Card>
    </div>
  );
};

export default TestSettingsPage;
