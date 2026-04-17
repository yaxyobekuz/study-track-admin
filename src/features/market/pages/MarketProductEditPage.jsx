import { toast } from "sonner";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import { marketAPI } from "@/features/market/api/market.api";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  marketOrderStatusOptions,
  marketOrderStatusLabels,
  marketOrderStatusClasses,
} from "@/features/market/data/market.data";

const formatUploadSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const MarketProductEditPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { productId } = useParams();

  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [upload, setUpload] = useState({ percent: 0, loaded: 0, total: 0 });

  const { data: product, isLoading } = useQuery({
    queryKey: ["market", "admin", "product", productId],
    queryFn: () =>
      marketAPI
        .getProductById(productId)
        .then((response) => response.data.data),
  });

  const [name, setName] = useState(undefined);
  const [price, setPrice] = useState(undefined);
  const [quantity, setQuantity] = useState(undefined);
  const [description, setDescription] = useState(undefined);
  const [isActive, setIsActive] = useState(undefined);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", String(name ?? product?.name ?? "").trim());
      formData.append("price", String(price ?? product?.price ?? ""));
      formData.append("quantity", String(quantity ?? product?.quantity ?? ""));
      formData.append(
        "description",
        String(description ?? product?.description ?? "").trim(),
      );
      formData.append(
        "isActive",
        String(isActive ?? product?.isActive ?? true),
      );
      formData.append("removeImageIds", removeImageIds.join(","));
      Array.from(newImages || []).forEach((file) =>
        formData.append("images", file),
      );

      return marketAPI.updateProduct(productId, formData, {
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
      queryClient.invalidateQueries({
        queryKey: ["market", "admin", "product", productId],
      });
      toast.success("Mahsulot yangilandi");
      navigate("/market/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const submit = (event) => {
    event.preventDefault();

    const keptCount = (product?.images || []).filter(
      (img) => !removeImageIds.includes(img._id),
    ).length;
    const totalCount = keptCount + (newImages?.length || 0);

    if (totalCount < 1 || totalCount > 3) {
      toast.error("Rasmlar soni 1 tadan 3 tagacha bo'lishi kerak");
      return;
    }

    updateMutation.mutate();
  };

  if (isLoading) {
    return <Card className="text-center py-10">Yuklanmoqda...</Card>;
  }

  if (!product) {
    return <Card className="text-center py-10">Mahsulot topilmadi</Card>;
  }

  return (
    <div className="space-y-6">
      <Card title="Mahsulotni tahrirlash" className="space-y-4">
        <form onSubmit={submit} className="space-y-4">
          <InputField
            required
            label="Nomi"
            value={name ?? product.name ?? ""}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              required
              min={1}
              type="number"
              label="Narxi (coin)"
              onChange={(e) => setPrice(e.target.value)}
              value={price ?? String(product.price ?? "")}
            />

            <InputField
              required
              min={0}
              type="number"
              label="Soni"
              onChange={(e) => setQuantity(e.target.value)}
              value={quantity ?? String(product.quantity ?? "")}
            />
          </div>

          <InputField
            type="textarea"
            label="Tavsif"
            onChange={(e) => setDescription(e.target.value)}
            value={description ?? product.description ?? ""}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="marketProductActive"
              checked={Boolean(isActive ?? product.isActive)}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <label
              htmlFor="marketProductActive"
              className="text-sm text-gray-700"
            >
              Mahsulot faol holatda bo'lsin
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Joriy rasmlar</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(product.images || []).map((image) => {
                const imageUrl =
                  image?.variants?.sm?.url || image?.variants?.original?.url;
                const marked = removeImageIds.includes(image._id);

                return (
                  <label
                    key={image._id}
                    className={`border rounded-lg p-2 space-y-2 cursor-pointer ${
                      marked ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <img
                      alt="Mahsulot rasmi"
                      src={imageUrl}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={marked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setRemoveImageIds((prev) => [...prev, image._id]);
                          } else {
                            setRemoveImageIds((prev) =>
                              prev.filter((id) => id !== image._id),
                            );
                          }
                        }}
                      />
                      O'chirish
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-sm font-medium text-gray-700">
              Yangi rasmlar
            </label>
            <input
              multiple
              type="file"
              accept="image/*"
              onChange={(event) => setNewImages(event.target.files)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500">
              Umumiy rasm soni 1-3 ta oralig'ida bo'lishi kerak
            </p>
          </div>

          {updateMutation.isPending && (
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
              variant="secondary"
              onClick={() => navigate("/market/products")}
              className="px-4"
            >
              Bekor qilish
            </Button>
            <Button disabled={updateMutation.isPending} className="px-4">
              Saqlash
            </Button>
          </div>
        </form>
      </Card>

      <ProductOrdersSection productId={productId} />
    </div>
  );
};

const ProductOrdersSection = ({ productId }) => {
  const contentRef = useRef(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["market", "admin", "orders", page, status, productId],
    queryFn: () =>
      marketAPI
        .getOrders({
          page,
          limit: 10,
          productId,
          ...(status !== "all" ? { status } : {}),
        })
        .then((res) => res.data),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div ref={contentRef} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-800">
          Mahsulot buyurtmalari
        </h2>
        <Select
          value={status}
          options={marketOrderStatusOptions}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sm text-gray-500">
          Yuklanmoqda...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          Buyurtmalar mavjud emas
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">O'quvchi</th>
                <th className="px-4 py-3 text-left">Miqdor</th>
                <th className="px-4 py-3 text-left">Narx</th>
                <th className="px-4 py-3 text-left">Holat</th>
                <th className="px-4 py-3 text-left">Sana</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {order.student?.firstName} {order.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.student?.username}
                    </p>
                  </td>
                  <td className="px-4 py-3">{order.quantity} ta</td>
                  <td className="px-4 py-3">{order.totalPrice} coin</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        marketOrderStatusClasses[order.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {marketOrderStatusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatUzDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination?.totalPages > 1 && (
        <Pagination
          contentRef={contentRef}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(nextPage) => setPage(nextPage)}
          className="pt-2"
        />
      )}
    </div>
  );
};

export default MarketProductEditPage;
