import {
  ClipboardList,
  CreditCard,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Monitor,
  Package,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const mainMenu = [
  { icon: LayoutDashboard, label: "대시보드", href: "/" },
  { icon: Users, label: "임직원 관리", href: "/employees" },
  { icon: Monitor, label: "하드웨어 자산", href: "/hardware" },
  { icon: Package, label: "소프트웨어", href: "/software" },
  { icon: ClipboardList, label: "자산 할당", href: "/assignments" },
  { icon: CreditCard, label: "구독/계약", href: "/subscriptions" },
  { icon: Receipt, label: "결제 내역", href: "/payments" },
];

const adminMenu = [
  { icon: Settings, label: "사용자 관리", href: "/admin/users" },
];

function NavLink({ item, isActive }: { item: (typeof mainMenu)[number]; isActive: boolean }) {
  return (
    <SidebarMenuItem>
      <Link
        to={item.href}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HardDrive className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              IT 자산 관리
            </span>
            <span className="text-[10px] text-muted-foreground">
              인벤토리 시스템
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={
                    item.href === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.href)
                  }
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin() && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>관리</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenu.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={location.pathname.startsWith(item.href)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent" />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-sidebar-foreground">
                {user?.full_name ?? user?.username}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {user?.role === "admin"
                  ? "관리자"
                  : user?.role === "manager"
                    ? "매니저"
                    : "사용자"}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
