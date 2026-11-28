import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Wallet,
  Briefcase,
  Target,
  Receipt,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
  Palette,
  ShieldAlert,
  User,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";

import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  NotificationCenter,
} from "@etherealui/react";
import { useAuth } from "../../lib/auth-context";
import { useNav, NavLink } from "../../lib/nav-context";
import { useTheme, THEME_OPTIONS } from "../../lib/theme-context";
import { useNotification } from "../../lib/notification-context";

interface HRMSAppShellProps {
  children: React.ReactNode;
  activePath?: string;
  currentPath?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        roles: ["admin", "hr_manager", "manager"],
      },
      {
        label: "Employees & Org",
        href: "/employees",
        icon: Users,
        roles: ["admin", "hr_manager", "manager"],
      },
    ],
  },
  {
    title: "Workplace & Time",
    items: [
      {
        label: "Attendance & Clock",
        href: "/attendance",
        icon: Clock,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
      {
        label: "Time Off & Leave",
        href: "/leave",
        icon: Calendar,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
    ],
  },
  {
    title: "Finance & Operations",
    items: [
      {
        label: "Payroll & Compensation",
        href: "/payroll",
        icon: Wallet,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
      {
        label: "Recruitment & ATS",
        href: "/recruitment",
        icon: Briefcase,
        roles: ["admin", "hr_manager"],
      },
      {
        label: "Expenses & Claims",
        href: "/expenses",
        icon: Receipt,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
    ],
  },
  {
    title: "Growth & Governance",
    items: [
      {
        label: "Performance & OKR",
        href: "/performance",
        icon: Target,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
      {
        label: "Compliance & Audit",
        href: "/audit",
        icon: ShieldCheck,
        roles: ["admin", "hr_manager"],
      },
      {
        label: "System Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
];

export function HRMSAppShell({
  children,
  activePath,
  currentPath: propCurrentPath,
}: HRMSAppShellProps) {
  const { user, logout } = useAuth();
  const { currentPath: navCurrentPath, navigate } = useNav();
  const { mode, colorTheme, toggleMode, setColorTheme } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearAll, dismiss } =
    useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizePath = (p: string) => p.replace(/\/+$/, "") || "/";
  const effectivePath = navCurrentPath || propCurrentPath || activePath || "/";
  const normalizedPath = normalizePath(effectivePath);
  const userRole = user?.role || "employee";

  const getRoleVariant = (
    role?: string,
  ): "primary" | "secondary" | "outline" | "muted" => {
    switch (role) {
      case "admin":
        return "primary";
      case "hr_manager":
        return "secondary";
      case "manager":
        return "outline";
      default:
        return "muted";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "Super Admin";
      case "hr_manager":
        return "HR Director";
      case "manager":
        return "Team Lead";
      default:
        return "Employee";
    }
  };

  // Filter sections and items based on role
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(userRole)),
  })).filter((section) => section.items.length > 0);

  // Check if current route is allowed for user
  const allNavItems = NAV_SECTIONS.flatMap((s) => s.items);
  const currentNavItem = allNavItems.find(
    (i) => normalizePath(i.href) === normalizedPath,
  );
  const isAuthorized =
    !currentNavItem || currentNavItem.roles.includes(userRole);

  const getItemLabel = (item: NavItem) => {
    if (item.href === "/payroll") {
      return userRole === "admin" || userRole === "hr_manager"
        ? "Payroll & Compensation"
        : "My Payslips & Comp";
    }
    if (item.href === "/expenses") {
      return userRole === "employee"
        ? "My Claims & Expense"
        : "Expense Approvals & Claims";
    }
    return item.label;
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col md:flex-row transition-colors duration-150">
      {/* Sidebar (Desktop) */}
      <aside
        data-astro-transition-persist="sidebar"
        className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar/50 backdrop-blur-md sticky top-0 h-screen z-30"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              EH
            </div>
            <div>
              <div className="font-bold tracking-tight text-sm text-foreground">
                EHMRS
              </div>
              <p className="text-[11px] text-muted-foreground">
                HR Management System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items grouped by section with RBAC filtering */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {visibleSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = normalizePath(item.href) === normalizedPath;
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                    <span>{getItemLabel(item)}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Role Switcher in Sidebar Footer */}
        <div className="p-3 border-t border-border bg-card/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-xl border border-border hover:bg-muted transition text-left cursor-pointer">
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar
                    src={
                      user?.avatar_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    }
                    alt={user?.full_name || "User"}
                    className="h-8 w-8 rounded-lg shrink-0 border border-border"
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate leading-tight">
                      {user?.full_name || "Alex Thorne"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.full_name || "Employee"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
                <div className="mt-1">
                  <Badge variant="primary" className="text-[9px]">
                    {getRoleLabel(user?.role)}
                  </Badge>
                </div>
              </div>
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-xs cursor-pointer py-2 text-foreground hover:text-primary w-full"
              >
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span>My Profile & Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive text-xs cursor-pointer flex items-center gap-2 py-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                Workspace:
              </span>
              <span className="text-xs font-semibold text-foreground">
                Ethereal Global Corp
              </span>
              <Badge
                variant="outline"
                className="text-[10px] hidden md:inline-flex border-border"
              >
                Jakarta HQ &bull; UTC+7
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification Center */}
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
              onDismiss={dismiss}
              align="end"
            />

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs cursor-pointer text-foreground transition"
                  title="Pilih Tema Tampilan"
                >
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline capitalize font-medium text-[11px]">
                    {THEME_OPTIONS.find((t) => t.id === colorTheme)?.name ||
                      "Theme"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Pilihan Tema</DropdownMenuLabel>
                {THEME_OPTIONS.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    className="flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${t.previewClass}`}
                      />
                      <span>{t.name}</span>
                    </div>
                    {colorTheme === t.id && (
                      <Badge variant="primary" className="text-[9px]">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleMode}
              title={mode === "dark" ? "Mode Terang" : "Mode Gelap"}
              className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer flex items-center justify-center"
            >
              {mode === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </button>

            {/* Account Profile Dropdown (Paling Kanan) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs cursor-pointer text-foreground transition"
                >
                  <Avatar
                    src={user?.avatar_url}
                    alt={user?.full_name || "User"}
                    className="h-6 w-6 rounded-md shrink-0 border border-border"
                  />
                  <span className="hidden sm:inline font-medium text-xs max-w-[110px] truncate">
                    {user?.full_name || "Akun"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.full_name || "Employee"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="mt-1">
                    <Badge variant="primary" className="text-[9px]">
                      {getRoleLabel(user?.role)}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 text-xs cursor-pointer py-2 text-foreground hover:text-primary"
                >
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <span>My Profile & Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive text-xs cursor-pointer flex items-center gap-2 py-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Navigation Drawer with RBAC filtering */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-sidebar/95 backdrop-blur-md p-4 space-y-4">
            {visibleSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-2 text-[10px] uppercase font-semibold text-muted-foreground">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = normalizePath(item.href) === normalizedPath;
                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{getItemLabel(item)}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Main Viewport with RBAC Enforcement Guard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {isAuthorized ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 border border-destructive/20 shadow-sm">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <Badge
                variant="outline"
                className="text-xs mb-2 border-destructive/30 text-destructive"
              >
                Access Restricted &bull; 403 Forbidden
              </Badge>
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                RBAC Policy Enforced
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                Your current role (
                <span className="font-semibold text-foreground">
                  {getRoleLabel(user?.role)}
                </span>
                ) does not possess clearance to access module{" "}
                <span className="font-mono text-primary font-semibold">
                  {currentNavItem?.label}
                </span>
                . Kebijakan akses membatasi modul ini hanya untuk peran (
                {currentNavItem?.roles.join(", ")}).
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/")}
                >
                  Kembali ke Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
