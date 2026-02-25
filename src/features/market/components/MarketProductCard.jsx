// Router
import { Link } from "react-router-dom";

// Icons
import { Edit, Trash2 } from "lucide-react";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import { Button } from "@/shared/components/shadcn/button";

// Helpers
import { getMarketProductBadge } from "@/shared/helpers/market.helpers";

/**
 * Reusable market product card for admin product lists.
 * @param {object} props Component props.
 * @param {object} props.product Product entity.
 * @param {(productId: string) => void} props.onDelete Delete callback.
 * @returns {JSX.Element} Product card.
 */
const MarketProductCard = ({ product, onDelete }) => {
  const badge = getMarketProductBadge(product);

  return (
    <div>
      {/* Image */}
      <div className="relative">
        <img
          alt={product.name}
          src={product?.images?.[0]?.variants?.md?.url}
          className="w-full h-auto bg-white aspect-square object-cover rounded-2xl"
        />

        {/* Badge */}
        {badge && (
          <span
            className={`absolute top-3.5 right-3.5 text-xs px-2 py-1 rounded-full ${
              badge.type === "primary"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="space-y-2 p-1.5">
        {/* Title */}
        <h3 className="h-10 text-sm font-semibold text-gray-900 line-clamp-2 xs:h-12 xs:text-base">
          {product.name}
        </h3>

        {/* Price */}
        <p className="font-semibold text-primary xs:text-lg">
          {product.price} tanga
        </p>

        {/* Details */}
        <div className="text-sm space-y-0.5">
          <DetailLine label="Soni" value={`${product.quantity} ta`} />
          <DetailLine label="Sana" value={formatUzDate(product.createdAt)} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link to={`/market/products/${product._id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full px-0 bg-gray-50">
              <span className="hidden sm:inline">Tahrirlash</span>
              <Edit className="size-4" />
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={() => onDelete(product._id)}
            className="shrink-0 aspect-square p-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DetailLine = ({ label, value }) => {
  return (
    <p className="flex gap-1.5 items-end text-xs text-gray-600 xs:text-sm">
      <span>{label}</span>
      <span className="block grow mb-1 border-b-2 border-dotted border-gray-300" />
      <span>{value}</span>
    </p>
  );
};

export default MarketProductCard;
