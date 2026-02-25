// Router
import { Link } from "react-router-dom";

// React
import { useState, useRef } from "react";

// Icons
import { Plus, Package } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { marketAPI } from "@/shared/api/market.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";
import Pagination from "@/shared/components/ui/Pagination";
import MarketProductCard from "@/features/market/components/MarketProductCard";

/**
 * Admin market products list page.
 * @returns {JSX.Element} Products page.
 */
const MarketProductsPage = () => {
  const contentRef = useRef(null);
  const { openModal } = useModal();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["market", "admin", "products", page],
    queryFn: () =>
      marketAPI
        .getProducts({ page, limit: 12 })
        .then((response) => response.data),
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5" ref={contentRef}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-gray-900">Mahsulotlar</h1>
        <Link to="/market/products/new">
          <Button className="px-4">
            <Plus className="size-4 mr-2" />
            Mahsulot qo'shish
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card className="text-center py-10">Yuklanmoqda...</Card>
      ) : products.length === 0 ? (
        <Card className="text-center py-10">
          <Package
            className="size-12 mx-auto text-gray-400 mb-2"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Hozircha mahsulotlar mavjud emas</p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <MarketProductCard
              key={product._id}
              product={product}
              onDelete={(productId) =>
                openModal("deleteMarketProduct", { _id: productId })
              }
            />
          ))}
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

export default MarketProductsPage;
