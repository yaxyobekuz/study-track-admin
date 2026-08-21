// Toast
import { toast } from "sonner";

// Icons
import { Building2, Check, ChevronsUpDown } from "lucide-react";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import { useIsMobile } from "@/shared/hooks/useMobile";

// Dropdown Menu
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";

// Sidebar
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/components/shadcn/sidebar";

/**
 * Sidebar tepasidagi filial ko'rsatkichi va almashtirgichi.
 *
 * Bitta filialga biriktirilgan xodim uchun bu — faqat YORLIQ (u qayerda
 * ishlayotganini bilishi kerak, lekin almashtira olmaydi). Owner uchun esa
 * dropdown: tanlanganda yangi token olinadi, kesh tozalanadi va sahifa
 * qayta yuklanadi (`useBranch`).
 */
const BranchSwitcher = () => {
  const isMobile = useIsMobile();
  const { branch, branches, canSwitch, switchBranch, isSwitching } = useBranch();

  if (!branch) return null;

  const label = (
    <div className="grid flex-1 text-left leading-tight">
      <span className="truncate text-[11px] uppercase tracking-wide opacity-60">
        Filial
      </span>
      <span className="truncate text-sm font-medium">{branch.name}</span>
    </div>
  );

  // Almashtira olmaydigan foydalanuvchiga dropdown ko'rsatmaymiz — bosilmaydigan
  // tugma "nimadir buzilgan" degan taassurot qoldiradi.
  if (!canSwitch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default" tooltip={branch.name}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
              <Building2 size={16} strokeWidth={1.5} />
            </div>
            {label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const handleSelect = async (next) => {
    if (next.id === branch.id) return;
    try {
      await switchBranch(next.id);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Filialni almashtirib bo'lmadi",
      );
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isSwitching}>
            <SidebarMenuButton
              size="lg"
              tooltip={branch.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
                <Building2 size={16} strokeWidth={1.5} />
              </div>
              {label}
              <ChevronsUpDown className="ml-auto !size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={4}
            side={isMobile ? "bottom" : "right"}
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
          >
            <DropdownMenuLabel className="text-xs opacity-60">
              Filialni tanlang
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {branches.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelect(item)}
                className="gap-2"
              >
                <Building2 size={16} strokeWidth={1.5} className="opacity-60" />
                <span className="flex-1 truncate">{item.name}</span>
                {item.id === branch.id && (
                  <Check size={16} strokeWidth={2} className="text-emerald-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default BranchSwitcher;
