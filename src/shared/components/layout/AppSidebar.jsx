// Icons
import {
  Home,
  Hash,
  Store,
  LogOut,
  BookOpen,
  Settings2,
  PanelLeft,
  UserPlus,
  UserRound,
  TrendingUp,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  BadgeDollarSign,
  Crown,
  Wallet,
  Boxes,
  Radar,
  Brain,
  Timer,
  Clock,
} from "lucide-react";

// Router
import { Link } from "react-router-dom";

// Sidebar
import {
  Sidebar,
  useSidebar,
  SidebarRail,
  SidebarMenu,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarMenuSub,
  SidebarTrigger,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/shared/components/shadcn/sidebar";

// Collapsible
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/shadcn/collapsible";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Dropdown Menu
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";

// Custom icons
import { whiteLogoIcon } from "@/shared/assets/icons";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Hooks
import { useIsMobile } from "@/shared/hooks/useMobile";
import usePermissions from "@/shared/hooks/usePermissions";

// Permissions
import { permissionForPath } from "@/features/permissions/data/permissions.data";

// Filial almashtirgich
import BranchSwitcher from "@/features/branches/components/BranchSwitcher";

// Navigation items
const navItems = [
  {
    title: "Asosiy",
    url: "/",
    icon: Home,
    isActive: true,
    items: [
      {
        title: "Bosh sahifa",
        url: "/",
      },
      {
        title: "Filiallar",
        url: "/branches",
      },
      {
        title: "Xodimlar",
        url: "/users/staff",
      },
      {
        title: "O'quvchilar",
        url: "/users/students",
      },
      {
        title: "Statistika",
        url: "/statistics",
      },
    ],
  },
  {
    // MENING DAVOMATIM — RUXSAT TALAB QILMAYDI.
    //
    // ⚠️ "Ta'lim → Davomat" bilan chalkashtirmang: u boshqalarning davomati
    // va `attendance.view` ortida turadi. Bu esa xodimning O'ZI kelgan-
    // ketganini qayd etishi — server ham uni faqat `protect` bilan
    // himoyalaydi (`/attendance/check-in`). Ilgari bu ekran faqat
    // o'qituvchi va xodim panellarida bo'lgani uchun admin panelga
    // kiradigan rahbar/ma'mur o'zini umuman davomatdan o'tkaza olmasdi.
    //
    // `hideForOwner` — owner'da davomat yozuvi YO'Q (`attendance.service.js`
    // uni `student` bilan birga rad etadi), shuning uchun unga hech qachon
    // ishlamaydigan bo'lim ko'rsatilmaydi.
    title: "Mening davomatim",
    icon: Clock,
    isActive: false,
    hideForOwner: true,
    items: [
      {
        title: "Davomatdan o'tish",
        url: "/my-attendance",
      },
    ],
  },
  {
    title: "Ta'lim",
    url: "/classes",
    icon: BookOpen,
    isActive: false,
    items: [
      {
        title: "Davomat",
        url: "/attendance",
      },
      {
        title: "Baholar jurnali",
        url: "/grades",
      },
      {
        title: "Dars jadvali",
        url: "/schedules",
      },
      {
        title: "Dars jadvalini rejalashtirish",
        url: "/schedule-planner",
      },
      {
        title: "Dars jadvali sozlamalari",
        url: "/schedule-settings",
      },
      {
        title: "Dars mavzulari",
        url: "/topics",
      },
      {
        title: "Sinflar",
        url: "/classes",
      },
      {
        title: "Fanlar",
        url: "/subjects",
      },
      {
        title: "Test mavsumlari",
        url: "/test-seasons",
      },
      {
        title: "Test sozlamalari",
        url: "/test-settings",
      },
    ],
  },
  {
    // DIAGNOSTIKA — "Ta'lim" guruhidan ALOHIDA bo'lim.
    //
    // ⚠️ "Test mavsumlari" bilan chalkashtirmang: u MAVSUM bo'yicha baho
    // qo'yadi (natija jurnalga tushadi, tanga taqsimlanadi), diagnostika
    // esa o'quvchi QAYERDA turganini o'lchaydi — baho qo'yilmaydi,
    // kamchilik va o'quv rejasi chiqadi. Ular alohida ruxsat bo'limlari
    // (`tests` va `diagnostics`) va bir-birining ma'lumotini ochmaydi.
    //
    // Bo'g'inlar ichki tablar bilan ochiladi (`DiagnosticsLayout`), lekin
    // yon menyuda ham turadi: har biri o'z ruxsati ortida va
    // `permissionForPath` ularni avtomatik filtrlaydi.
    title: "Diagnostika",
    url: "/diagnostics",
    icon: Brain,
    isActive: false,
    items: [
      {
        title: "Umumiy manzara",
        url: "/diagnostics",
      },
      {
        title: "Savollar bazasi",
        url: "/diagnostics/questions",
      },
      {
        title: "Diagnostika testlari",
        url: "/diagnostics/tests",
      },
      // ⚠️ KESIMLAR KENGDAN TORGA: sinf → fan → mavzu → o'quvchi.
      // Tartib ichki tablar bilan AYNI — yon menyu va tab qatori
      // boshqa-boshqa tartibda bo'lsa, foydalanuvchi har safar
      // qidirib yurardi.
      {
        title: "Sinflar kesimi",
        url: "/diagnostics/classes",
      },
      {
        title: "Fanlar kesimi",
        url: "/diagnostics/subjects",
      },
      {
        title: "Mavzular kesimi",
        url: "/diagnostics/topics",
      },
      {
        // "Reytingi" — pastdagi "natijalari" bilan chalkashmasligi
        // uchun: biri o'quvchilar ro'yxati, ikkinchisi urinishlar.
        title: "O'quvchilar reytingi",
        url: "/diagnostics/students",
      },
      {
        title: "O'quvchilar natijalari",
        url: "/diagnostics/attempts",
      },
    ],
  },
  {
    title: "Do'kon",
    icon: Store,
    isActive: false,
    items: [
      {
        title: "Mahsulotlar",
        url: "/market/products",
      },
      {
        title: "Buyurtmalar",
        url: "/market/orders",
      },
    ],
  },
  {
    title: "Topshiriqlar",
    icon: ClipboardList,
    isActive: false,
    items: [
      {
        title: "Topshiriqlar ro'yxati",
        url: "/tasks",
      },
    ],
  },
  {
    title: "Jarimalar",
    icon: AlertTriangle,
    isActive: false,
    items: [
      {
        title: "Jarimalar ro'yxati",
        url: "/penalties",
      },
      {
        title: "Kategoriyalar",
        url: "/penalties/categories",
      },
      {
        title: "Kamaytirish paketlari",
        url: "/penalties/reduction-packages",
      },
      {
        title: "Sozlamalar",
        url: "/penalties/settings",
      },
    ],
  },
  {
    title: "MBSI Premium",
    icon: Crown,
    isActive: false,
    items: [
      {
        title: "Hisobot",
        url: "/premium",
      },
      {
        title: "Emojilar",
        url: "/premium/emojis",
      },
      {
        title: "Sozlamalar",
        url: "/premium/settings",
      },
    ],
  },
  {
    title: "Tangalar",
    icon: BadgeDollarSign,
    isActive: false,
    items: [
      {
        title: "Tarqatish/Olish",
        url: "/coin-distribution",
      },
      {
        title: "Sozlamalar",
        url: "/coin-settings",
      },
    ],
  },
  {
    // DARS SOATLARI — moliyadan ALOHIDA guruh va bu ataylab.
    //
    // Bo'lim ikki auditoriyaga xizmat qiladi: boshliq maosh rejimini
    // belgilaydi (`payroll.hours`), o'quv ishlari mas'uli esa kasal
    // o'qituvchining darsini ko'chiradi (`substitutions.*`). Ikkinchisiga
    // moliya bo'limini ochib berish "dars ko'chirish uchun qarzdorlik
    // registrini ham ko'r" degani bo'lardi.
    //
    // ⚠️ Bo'g'inlar RUXSAT bo'yicha o'zi filtrlanadi (`permissionForPath`),
    // shuning uchun bu yerda hech qanday shart yozilmaydi.
    title: "Dars soatlari",
    icon: Timer,
    isActive: false,
    items: [
      {
        title: "Ko'rsatkichlar",
        url: "/lesson-hours/overview",
      },
      {
        title: "Vedomost",
        url: "/lesson-hours/ledger",
      },
      {
        title: "O'rinbosarlik",
        url: "/lesson-hours/substitutions",
      },
    ],
  },
  {
    title: "Moliya",
    icon: Wallet,
    isActive: false,
    items: [
      {
        title: "Asosiy",
        url: "/finance/main",
      },
    ],
  },
  {
    // INVENTAR — moliyadan alohida guruh: xo'jalik mudiri partani sanaydi,
    // lekin maktabning qarzdorlik registrini ko'rmasligi kerak.
    title: "Inventar",
    icon: Boxes,
    isActive: false,
    items: [
      {
        title: "Umumiy",
        url: "/inventory/overview",
      },
      {
        title: "Kunlik hisobot",
        url: "/inventory/checks",
      },
      {
        title: "Zararlar",
        url: "/inventory/damages",
      },
      {
        title: "Qarzdorlar",
        url: "/inventory/debtors",
      },
      {
        title: "Xatlov",
        url: "/inventory/stock",
      },
      {
        title: "Katalog",
        url: "/inventory/catalog",
      },
      {
        title: "Sozlamalar",
        url: "/inventory/settings",
      },
    ],
  },
  {
    title: "Boshqaruv",
    url: "/users",
    icon: Settings2,
    isActive: false,
    items: [
      {
        title: "Rollar",
        url: "/roles",
      },
      {
        title: "Ruxsatlar",
        url: "/permissions",
      },
      {
        title: "Dam olish kunlari",
        url: "/holidays",
      },
      {
        title: "Monitorlar",
        url: "/monitors",
      },
      {
        title: "O'zgarishlar tarixi",
        url: "/changelog",
      },
    ],
  },
  {
    // NAZORAT — "Boshqaruv" dan ALOHIDA guruh va bu ataylab.
    //
    // "Boshqaruv" tizimni SOZLAYDI (rollar, ruxsatlar, dam olish
    // kunlari, monitorlar). Bu ikkisi esa tizimni KUZATADI: kim
    // foydalanyapti va kim kirdi. Ular sozlama emas, HISOBOT — va
    // ikkalasi ham shaxsiy ma'lumot bilan ishlaydi (kimning qachon
    // kirgani, qaysi IP dan). Bitta guruhga qo'shilsa, "sozlamalarga
    // kira olsin" degan qaror jimgina "hammaning kirish tarixini
    // ko'rsin" degan qarorga aylanardi.
    title: "Nazorat",
    url: "/activity",
    icon: Radar,
    isActive: false,
    items: [
      {
        title: "Faollik",
        url: "/activity",
      },
      {
        title: "Xavfsizlik",
        url: "/security",
      },
    ],
  },
  {
    title: "Ijtimoiy tarmoqlar",
    icon: Hash,
    isActive: false,
    items: [
      {
        title: "Xabarlar",
        url: "/messages",
      },
      {
        title: "Ijtimoiy tarmoqlar",
        url: "/social-networks",
      },
    ],
  },
  {
    title: "Sotuvlar",
    icon: UserPlus,
    isActive: false,
    items: [
      {
        title: "Barcha sotuvlar",
        url: "/leads",
      },
      {
        title: "Sotuv tahlili",
        url: "/leads/analytics",
      },
    ],
  },
];

const AppSidebar = ({ ...props }) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <Header />

      {/* Content */}
      <Main />

      {/* Footer */}
      <Footer />

      {/* Rail (Vertical divider) */}
      <SidebarRail />
    </Sidebar>
  );
};

const Header = () => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarHeader>
      {/* Logo */}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => toggleSidebar()}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-400 to-blue-700">
              <img
                width={20}
                height={20}
                className="size-4 mt-0.5"
                src={whiteLogoIcon}
                alt="MBSI School white variant Logo icon svg"
              />
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">MBSI School</span>
              <p className="flex items-center gap-1.5 text-green-500">
                <span className="truncate text-xs">Day By Day</span>
                <TrendingUp size={18} strokeWidth={1.5} />
              </p>
            </div>
            <PanelLeft className="ml-auto" size={24} strokeWidth={1.5} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Joriy filial. Owner uchun — almashtirgich, qolganlar uchun yorliq:
          xodim qaysi filialda ishlayotganini har doim ko'rib turishi kerak,
          chunki ekrandagi hamma narsa (o'quvchi, kassa, davomat) o'sha
          filialga tegishli. */}
      <BranchSwitcher />

      {/* Collapse Button */}
      {!open && <SidebarTrigger className="size-8" />}
    </SidebarHeader>
  );
};

const Main = () => {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const { can, isOwner } = usePermissions();

  // Ruxsati bo'lmagan sahifalarni yashiramiz; bo'lim bo'sh qolsa — butun bo'limni.
  // `hideForOwner` — ruxsatga emas, ROLGA bog'liq bo'lim (owner'da davomat
  // yozuvi yo'q): "ruxsati bor, lekin ishlamaydi" degan holat bo'lmasin.
  const visibleNavItems = navItems
    .filter((item) => !(item.hideForOwner && isOwner))
    .map((item) => ({
      ...item,
      items: (item.items || []).filter((sub) =>
        can(permissionForPath(sub.url)),
      ),
    }))
    .filter((item) => item.items.length > 0);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {visibleNavItems.map((item) => (
            <Collapsible
              asChild
              key={item.title}
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {/* Collapsible Trigger */}
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="h-auto py-2.5"
                  >
                    {item.icon && <item.icon strokeWidth={1.5} />}
                    <span>{item.title}</span>
                    <ChevronRight
                      size={20}
                      strokeWidth={1.5}
                      className="!size-5 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* Collapsible Content */}
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton className="h-auto py-2" asChild>
                          <Link
                            to={subItem.url}
                            onClick={isMobile ? toggleSidebar : undefined}
                          >
                            {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

const Footer = () => {
  const { data: user } = useQuery({
    retry: false,
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
  });

  const isMobile = useIsMobile();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {/* Avatar */}
                <div className="flex items-center justify-center size-8 shrink-0 bg-background rounded-lg">
                  {user?.firstName?.[0]}
                </div>

                {/* User Info */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.firstName}
                  </span>
                  <span className="truncate text-xs">{user.username}</span>
                </div>

                <ChevronRight
                  size={20}
                  strokeWidth={1.5}
                  className="ml-auto !size-5"
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              side={isMobile ? "bottom" : "right"}
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            >
              {/* Profile */}
              <DropdownMenuLabel className="!p-0 font-normal">
                <div className="flex items-center gap-2 text-left text-sm">
                  {/* Avatar */}
                  <div className="flex items-center justify-center size-8 shrink-0 bg-background rounded-md">
                    {user?.firstName?.[0]}
                  </div>

                  {/* User Info */}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.firstName}
                    </span>
                    <span className="truncate text-xs opacity-70">
                      {user.username}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserRound strokeWidth={1.5} />
                  Profil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut strokeWidth={1.5} />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default AppSidebar;
