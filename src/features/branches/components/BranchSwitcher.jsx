// Toast
import { toast } from "sonner";

// Icons
import { Building2, Check, ChevronsUpDown, Layers } from "lucide-react";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import { useIsMobile } from "@/shared/hooks/useMobile";

// Data
import { ALL_BRANCHES_ID } from "@/features/branches/data/branch.data";

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
 *
 * ⚠️ "UMUMIY" — FILIAL EMAS, REJIM, lekin ATAYLAB shu ro'yxatda turadi:
 * "hozir qanday ma'lumot ko'rsatilayotgani" degan savolga javob beradigan
 * joy bitta bo'lishi kerak. Ikkinchi tugma (masalan sarlavhadagi kalit)
 * qo'yilsa, odam bir joyda filialni, boshqa joyda rejimni almashtirib,
 * ekranda nima turganini yo'qotib qo'yardi.
 *
 * ⚠️ Faqat TIZIM EGASIGA ko'rinadi va bu panelning qarori EMAS: huquqni
 * server aytadi (`/auth/me` → `canViewAllBranches`).
 */
const BranchSwitcher = () => {
  const isMobile = useIsMobile();
  const {
    branch,
    branches,
    canSwitch,
    canViewAll,
    isAggregate,
    switchBranch,
    isSwitching,
  } = useBranch();

  if (!branch) return null;

  const label = (
    <div className="grid flex-1 text-left leading-tight">
      <span className="truncate text-[11px] uppercase tracking-wide opacity-60">
        {isAggregate ? "Ko'rinish" : "Filial"}
      </span>
      <span className="truncate text-sm font-medium">
        {isAggregate ? "Umumiy — barcha filiallar" : branch.name}
      </span>
    </div>
  );

  const icon = isAggregate ? (
    <Layers size={16} strokeWidth={1.5} />
  ) : (
    <Building2 size={16} strokeWidth={1.5} />
  );

  // Almashtira olmaydigan foydalanuvchiga dropdown ko'rsatmaymiz — bosilmaydigan
  // tugma "nimadir buzilgan" degan taassurot qoldiradi.
  if (!canSwitch && !canViewAll) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default" tooltip={branch.name}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
              {icon}
            </div>
            {label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const handleSelect = async (nextId) => {
    if (nextId === branch.id) return;
    try {
      await switchBranch(nextId);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (nextId === ALL_BRANCHES_ID
            ? "Umumiy ko'rinishga o'tib bo'lmadi"
            : "Filialni almashtirib bo'lmadi"),
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
              tooltip={isAggregate ? "Umumiy — barcha filiallar" : branch.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
                {icon}
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
            {canViewAll && (
              <>
                <DropdownMenuLabel className="text-xs opacity-60">
                  Ko'rinish
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => handleSelect(ALL_BRANCHES_ID)}
                  className="gap-2"
                >
                  <Layers size={16} strokeWidth={1.5} className="opacity-60" />
                  <span className="flex-1 truncate">Umumiy (barcha filiallar)</span>
                  {isAggregate && (
                    <Check size={16} strokeWidth={2} className="text-emerald-600" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel className="text-xs opacity-60">
              Filialni tanlang
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {branches.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="gap-2"
              >
                <Building2 size={16} strokeWidth={1.5} className="opacity-60" />
                <span className="flex-1 truncate">{item.name}</span>
                {!isAggregate && item.id === branch.id && (
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
