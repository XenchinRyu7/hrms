import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
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
  Sun,
  Moon,
  Palette,
  ShieldAlert,
  Bell,
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
} from "@etherealui/react";
import { useAuth, DEMO_ACCOUNTS } from "../../lib/auth-context";
import { useNav, NavLink } from "../../lib/nav-context";
import { useTheme, THEME_OPTIONS } from "../../lib/theme-context";
import { useNotification } from "../../lib/notification-context";

interface HRMSAppShellProps {
  children: React.ReactNode;
  activePath?: string;
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
        label: "Executive Console",
        href: "/",
        icon: LayoutDashboard,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
      {
        label: "Employees & Org",
        href: "/employees",
        icon: Users,
        roles: ["admin", "hr_manager", "manager", "employee"],
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
        label: "Leave & Time-Off",
        href: "/leave",
        icon: CalendarOff,
        roles: ["admin", "hr_manager", "manager", "employee"],
      },
    ],
  },
  {
    title: "Finance & Talent",
    items: [
      {
        label: "Payroll & Comp",
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

export function HRMSAppShell({ children, activePath }: HRMSAppShellProps) {
  const { user, logout, switchRole } = useAuth();
  const { currentPath, navigate } = useNav();
  const { mode, colorTheme, toggleMode, setColorTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectivePath = currentPath || activePath || "/";
  const userRole = user?.role || "employee";

  const getRoleVariant = (role?: string) => {
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
  const currentNavItem = allNavItems.find((i) => i.href === effectivePath);
  const isAuthorized =
    !currentNavItem || currentNavItem.roles.includes(userRole);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col md:flex-row transition-colors duration-150">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar/50 backdrop-blur-md sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/25">
              🌌
            </div>
            <div>
              <div className="font-bold tracking-tight text-sm flex items-center gap-1.5">
                <span>Ethereal HRMS</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Enterprise People Ops
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
                const isActive = effectivePath === item.href;
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
                    <span>{item.label}</span>
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
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                Quick Switch Role (Enterprise Demo)
              </DropdownMenuLabel>
              {DEMO_ACCOUNTS.map((acc) => (
                <DropdownMenuItem
                  key={acc.role}
                  onClick={() => switchRole(acc.role)}
                  className="flex items-center justify-between text-xs cursor-pointer py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {getRoleLabel(acc.role)}
                    </span>
                  </div>
                  {user?.role === acc.role && (
                    <Badge variant="primary" className="text-[9px]">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive text-xs cursor-pointer flex items-center gap-2"
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
            {/* Enterprise Notification Center Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer flex items-center justify-center"
                  title="Notifications & Telemetry Alerts"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 p-0 overflow-hidden"
              >
                <div className="p-3 border-b border-border flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <Badge
                        variant="primary"
                        className="text-[10px] px-1.5 py-0.2"
                      >
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-primary hover:underline cursor-pointer font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition hover:bg-muted/50 flex flex-col gap-1 ${
                        !n.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ethereal Theme Palette Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs cursor-pointer text-foreground transition"
                  title="Switch Ethereal OKLCH Theme"
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
                <DropdownMenuLabel>Ethereal OKLCH Themes</DropdownMenuLabel>
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
              title={
                mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
              className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer flex items-center justify-center"
            >
              {mode === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </button>

            {/* Role Switcher in Top Bar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs cursor-pointer transition">
                  <Badge
                    variant={getRoleVariant(user?.role)}
                    className="text-[11px] px-2 py-0.5"
                  >
                    {getRoleLabel(user?.role)}
                  </Badge>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Persona Role</DropdownMenuLabel>
                {DEMO_ACCOUNTS.map((acc) => (
                  <DropdownMenuItem
                    key={acc.role}
                    onClick={() => switchRole(acc.role)}
                    className="flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span>{acc.name}</span>
                    {user?.role === acc.role && (
                      <Badge variant="primary" className="text-[9px]">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={logout}
              className="text-xs flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
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
                  const isActive = effectivePath === item.href;
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
                      <span>{item.label}</span>
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
                Enterprise RBAC Policy Enforced
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
                . Enterprise security policies restrict this module to
                authorized roles ({currentNavItem?.roles.join(", ")}).
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/")}
                >
                  Return to Console
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchRole("admin")}
                >
                  Switch to Super Admin (Demo)
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
