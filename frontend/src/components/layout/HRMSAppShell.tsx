import React, { useState } from 'react';
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
} from 'lucide-react';
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
} from '@etherealui/react';
import { useAuth, DEMO_ACCOUNTS } from '../../lib/auth-context';
import { useNav, NavLink } from '../../lib/nav-context';

interface HRMSAppShellProps {
  children: React.ReactNode;
  activePath?: string;
}

const NAV_ITEMS = [
  { label: 'Executive Console', href: '/', icon: LayoutDashboard },
  { label: 'Employees & Org', href: '/employees', icon: Users },
  { label: 'Attendance & Clock', href: '/attendance', icon: Clock },
  { label: 'Leave & Time-Off', href: '/leave', icon: CalendarOff },
  { label: 'Payroll & Comp', href: '/payroll', icon: Wallet },
  { label: 'Recruitment & ATS', href: '/recruitment', icon: Briefcase },
  { label: 'Performance & OKR', href: '/performance', icon: Target },
  { label: 'Expenses & Claims', href: '/expenses', icon: Receipt },
  { label: 'Compliance & Audit', href: '/audit', icon: ShieldCheck },
  { label: 'System Settings', href: '/settings', icon: Settings },
];

export function HRMSAppShell({ children, activePath }: HRMSAppShellProps) {
  const { user, logout, switchRole } = useAuth();
  const { currentPath } = useNav();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectivePath = currentPath || activePath || '/';

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'hr_manager':
        return 'secondary';
      case 'manager':
        return 'outline';
      default:
        return 'muted';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Super Admin';
      case 'hr_manager':
        return 'HR Director';
      case 'manager':
        return 'Team Lead';
      default:
        return 'Employee';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col md:flex-row">
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
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">v2.0</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Enterprise People Ops</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Core Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = effectivePath === item.href;
            return (
              <NavLink
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Role Switcher in Sidebar Footer */}
        <div className="p-3 border-t border-border bg-card/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-xl border border-border hover:bg-muted transition text-left cursor-pointer">
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user?.full_name || 'User'}
                    className="h-8 w-8 rounded-lg shrink-0 border border-border"
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate leading-tight">{user?.full_name || 'Alex Thorne'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{getRoleLabel(user?.role)}</p>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Switch Role (Demo)</DropdownMenuLabel>
              {DEMO_ACCOUNTS.map((acc) => (
                <DropdownMenuItem
                  key={acc.role}
                  onClick={() => switchRole(acc.role)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <span>{acc.name}</span>
                  {user?.role === acc.role && <Badge variant="primary" className="text-[9px]">Active</Badge>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive text-xs cursor-pointer flex items-center gap-2">
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
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Workspace:</span>
              <span className="text-xs font-semibold text-foreground">Ethereal Global Corp</span>
              <Badge variant="outline" className="text-[10px] hidden md:inline-flex border-border">
                Jakarta HQ &bull; UTC+7
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-muted/30 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Go API: Online (v1.25)</span>
            </div>

            <Badge variant={getRoleVariant(user?.role)} className="text-xs px-2.5 py-1">
              {getRoleLabel(user?.role)}
            </Badge>

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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-sidebar/95 backdrop-blur-md p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = effectivePath === item.href;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
