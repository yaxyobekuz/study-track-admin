// Toast
import { toast } from "sonner";

// Icons
import { Plus, Edit, Trash2, Coins } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Modals
import CreateReductionPackageModal from "../components/CreateReductionPackageModal";
import EditReductionPackageModal from "../components/EditReductionPackageModal";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ReductionPackagesPage = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["penalties", "reduction-packages"],
    queryFn: () =>
      penaltiesAPI.getReductionPackages().then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => penaltiesAPI.deleteReductionPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["penalties", "reduction-packages"],
      });
      toast.success("Paket o'chirildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleDelete = (id) => {
    if (!confirm("Paketni o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Kamaytirish paketlari</h1>
        <Button onClick={() => openModal("createReductionPackage")}>
          <Plus />
          Yangi paket
        </Button>
      </div>

      {/* Packages list */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : packages.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">Hali paketlar yo'q</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg._id} className="relative" title={pkg.title}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">
                      -{pkg.points} ball
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Coins className="size-3" />
                      {pkg.coinCost} tanga
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        pkg.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {pkg.isActive ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Tartib: {pkg.order}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openModal("editReductionPackage", pkg)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="text-sm bg-yellow-50 text-yellow-700">
        O'quvchilar tanga evaziga jarima ballarini kamaytirish uchun bu
        paketlardan foydalanadilar. Premium o'quvchilar uchun chegirma foizi
        jarima sozlamalarida belgilanadi.
      </Card>

      {/* Modals */}
      <CreateReductionPackageModal />
      <EditReductionPackageModal />
    </div>
  );
};

export default ReductionPackagesPage;
