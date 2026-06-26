// Router
import { NavLink, useLocation } from "react-router-dom";

// Utils
import { cn } from "@/shared/utils/cn";

// Mirrors shadcn TabsList/TabsTrigger classes so styling stays identical
const LIST_CLASS =
  "inline-flex  !flex-nowrap hidden-scrollbar h-10 items-center overflow-x-auto max-w-full overflow-y-hidden rounded-md bg-white border p-1 text-muted-foreground";

const TRIGGER_CLASS =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const TRIGGER_ACTIVE_CLASS = "bg-primary text-white shadow-sm";

const TabsLinks = ({
  items = [],
  className = "",
  itemClassName = "",
  activeClassName = "",
  end = true,
}) => {
  if (!items.length) return null;
  const { pathname } = useLocation();

  return (
    <nav role="tablist" className={cn(LIST_CLASS, className)}>
      {items.map((item) => {
        const isActive =
          item.exact === false
            ? pathname.startsWith(item.to)
            : pathname === item.to;

        return (
          <NavLink
            to={item.to}
            key={item.to}
            end={item.exact ?? end}
            aria-disabled={item.disabled || undefined}
            data-state={isActive ? "active" : "inactive"}
            className={cn(
              TRIGGER_CLASS,
              itemClassName,
              isActive && TRIGGER_ACTIVE_CLASS,
              isActive && activeClassName,
              item.disabled && "pointer-events-none opacity-50",
            )}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default TabsLinks;
