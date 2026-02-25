// Toaster
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// API
import { marketAPI } from "@/shared/api/market.api";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Formats upload size to KB/MB.
 * @param {number} bytes Size in bytes.
 * @returns {string} Formatted size.
 */
const formatUploadSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * Admin create market product page.
 * @returns {JSX.Element} Product create page.
 */
const MarketProductCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [upload, setUpload] = useState({ percent: 0, loaded: 0, total: 0 });
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    images: [],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("price", String(form.price));
      formData.append("quantity", String(form.quantity));
      formData.append("description", form.description.trim());
      Array.from(form.images || []).forEach((file) =>
        formData.append("images", file),
      );

      return marketAPI.createProduct(formData, {
        onUploadProgress: (event) => {
          const total = event.total || 0;
          const loaded = event.loaded || 0;
          const percent = total > 0 ? Math.round((loaded * 100) / total) : 0;
          setUpload({ percent, loaded, total });
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["market", "admin", "products"],
      });
      toast.success("Mahsulot yaratildi");
      navigate("/market/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const onSubmit = (event) => {
    event.preventDefault();

    if (!form.images || form.images.length < 1 || form.images.length > 3) {
      toast.error("Rasmlar soni 1 tadan 3 tagacha bo'lishi kerak");
      return;
    }

    createMutation.mutate();
  };

  return (
    <Card title="Mahsulot qo'shish" className="max-w-3xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          required
          label="Nomi"
          value={form.name}
          onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          placeholder="Mahsulot nomi"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            required
            min={1}
            type="number"
            label="Narxi (coin)"
            value={form.price}
            onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
            placeholder="Masalan: 120"
          />

          <Input
            required
            min={0}
            type="number"
            label="Soni"
            value={form.quantity}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, quantity: value }))
            }
            placeholder="Masalan: 10"
          />
        </div>

        <Input
          type="textarea"
          label="Tavsif"
          value={form.description}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, description: value }))
          }
          placeholder="Qo'shimcha ma'lumot"
        />

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-medium text-gray-700">
            Rasmlar <span className="text-indigo-500">*</span>
          </label>
          <input
            required
            multiple
            type="file"
            accept="image/*"
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                images: event.target.files,
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <p className="text-xs text-gray-500">
            1 tadan 3 tagacha rasm yuklang
          </p>
        </div>

        {createMutation.isPending && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
            <p className="font-medium">Yuklanmoqda: {upload.percent}%</p>
            <p>
              {formatUploadSize(upload.loaded)} /{" "}
              {formatUploadSize(upload.total || upload.loaded)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="neutral"
            onClick={() => navigate("/market/products")}
            className="px-4"
          >
            Bekor qilish
          </Button>
          <Button disabled={createMutation.isPending} className="px-4">
            Saqlash
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MarketProductCreatePage;
