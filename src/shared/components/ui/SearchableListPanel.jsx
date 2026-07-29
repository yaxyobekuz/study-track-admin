// React
import { Fragment, useMemo, useState } from "react";

// Icons
import { Search } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Master-detail sahifalarning chap paneli: tezkor qidiruv + tanlanadigan
 * ro'yxat (Ruxsatlar, Rollar). `lg` dan boshlab panel yopishib turadi va ekran
 * balandligini to'liq egallaydi — DashboardLayout kontenti `md:py-2` bo'lgani
 * uchun yuqoridan 8px, umumiy 1rem ayiriladi.
 *
 * @param {object} props
 * @param {Array} props.items - Ro'yxat elementlari (har birida `id` bo'lishi shart)
 * @param {(item: any) => string} props.searchText - Element bo'yicha qidiriladigan matn
 * @param {(item: any) => React.ReactNode} props.renderItem - Bitta element ko'rinishi
 * @param {string} [props.placeholder] - Qidiruv maydoni placeholder'i
 * @param {string} [props.emptyText] - Hech narsa topilmaganda chiqadigan matn
 * @param {string} [props.className]
 */
const SearchableListPanel = ({
  items = [],
  searchText,
  renderItem,
  placeholder = "Qidirish...",
  emptyText = "Hech narsa topilmadi",
  className = "",
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => searchText(item).toLowerCase().includes(query));
  }, [items, search, searchText]);

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-3 xs:p-3.5 lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)]",
        className,
      )}
    >
      {/* Qidiruv */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          value={search}
          className="pl-9"
          placeholder={placeholder}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Ro'yxat */}
      <div className="max-h-[36vh] space-y-1 overflow-y-auto hidden-scrollbar lg:max-h-none lg:min-h-0 lg:flex-1">
        {filtered.map((item) => (
          <Fragment key={item.id}>{renderItem(item)}</Fragment>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">{emptyText}</p>
        )}
      </div>
    </Card>
  );
};

export default SearchableListPanel;
