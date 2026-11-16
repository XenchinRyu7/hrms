import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Palette,
  Building,
  Key,
  CheckCircle,
  Save,
  Lock,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
} from '@etherealui/react';
import { useAuth } from '../../lib/auth-context';
import { useTheme, THEME_OPTIONS, type ThemeColor } from '../../lib/theme-context';

const RBAC_MODULES = [
  { module: 'Employee Directory & Org', admin: 'Full Control', hr: 'Read / Write', manager: 'Read Only', employee: 'Self Only' },
  { module: 'Attendance & Clock-In', admin: 'Full Control', hr: 'Audit / Adjust', manager: 'Team Review', employee: 'Clock In/Out' },
  { module: 'Leave & Time-Off', admin: 'Full Control', hr: 'Approve All', manager: 'Team Approve', employee: 'Submit Own' },
  { module: 'Payroll & Salary Slips', admin: 'Full Control', hr: 'Run & Disburse', manager: 'No Access', employee: 'Own Payslips' },
  { module: 'Recruitment & ATS', admin: 'Full Control', hr: 'Post & Move', manager: 'Interview & Rate', employee: 'No Access' },
  { module: 'Performance & OKRs', admin: 'Full Control', hr: 'Review All', manager: 'Evaluate Team', employee: 'Update Goals' },
  { module: 'Expense Claims', admin: 'Full Control', hr: 'Disburse', manager: 'Approve Team', employee: 'Submit Own' },
  { module: 'Security Audit Logs', admin: 'Full Control', hr: 'Read Only', manager: 'No Access', employee: 'No Access' },
];

export function SettingsView() {
  const { user } = useAuth();
  const { mode, colorTheme, toggleMode, setColorTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'theming'>('theming');
  const [savedMsg, setSavedMsg] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('Ethereal Global Corporation');
  const [hqAddress, setHqAddress] = useState('Sudirman Central Business District (SCBD), Jakarta 12190');
  const [timezone, setTimezone] = useState('Asia/Jakarta (UTC+07:00)');
  const [currency, setCurrency] = useState('IDR (Indonesian Rupiah)');
  const [standardWorkHours, setStandardWorkHours] = useState('09:00 - 18:00');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">System Governance</span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">Ethereal UI v0.0.7 &bull; OKLCH Theme Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Workspace & System Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Corporate master parameters, RBAC permission matrices, and theme configurations.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Settings saved and persisted successfully across workspace.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('theming')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'theming' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Ethereal Theme & Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'general' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rbac' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>RBAC Permissions Matrix</span>
        </button>
      </div>

      {/* Tab: Theming & Token Verification */}
      {activeTab === 'theming' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Ethereal UI Appearance & Theme Engine</h2>
            <p className="text-xs text-muted-foreground">Switch between Dark/Light modes and dynamic OKLCH color palettes</p>
          </div>

          {/* Dark / Light Mode Selector */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <span className="text-xs font-bold text-foreground">Canvas Color Mode</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (mode !== 'dark') toggleMode();
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                  mode === 'dark'
                    ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400">
                  <Moon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Dark Telemetry (Recommended)</p>
                  <p className="text-[10px] text-muted-foreground">Deep zinc `#09090b` canvas with crisp elevated panels</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mode !== 'light') toggleMode();
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                  mode === 'light'
                    ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-300 text-amber-500">
                  <Sun className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Light Surface</p>
                  <p className="text-[10px] text-muted-foreground">Clean enterprise light mode with WCAG 2.1 AA contrast</p>
                </div>
              </button>
            </div>
          </div>

          {/* Theme Palette Cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-foreground">Ethereal UI OKLCH Presets</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorTheme(theme.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer space-y-2 ${
                    colorTheme === theme.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{theme.icon}</span>
                    {colorTheme === theme.id && (
                      <Badge variant="primary" className="text-[9px]">Active</Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground">{theme.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`h-3 w-3 rounded-full ${theme.previewClass}`} />
                      <span className="text-[10px] text-muted-foreground font-mono">OKLCH Adaptive</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Token Contrast Verification Box */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Active Token Contrast Verification</span>
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                WCAG 2.1 AA Compliant
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold shadow-xs">
                bg-primary
              </div>
              <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground font-mono font-semibold border border-border">
                bg-secondary
              </div>
              <div className="p-2.5 rounded-lg bg-muted text-muted-foreground font-mono font-semibold">
                bg-muted
              </div>
              <div className="p-2.5 rounded-lg bg-card text-card-foreground border border-border font-mono font-semibold">
                bg-card
              </div>
              <div className="p-2.5 rounded-lg bg-destructive text-destructive-foreground font-mono font-semibold">
                bg-destructive
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: General Settings */}
      {activeTab === 'general' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Organization Metadata</h2>
            <p className="text-xs text-muted-foreground">Company-wide operating hours and localization</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Legal Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Headquarters Office Address</label>
              <Input
                value={hqAddress}
                onChange={(e) => setHqAddress(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Primary Timezone</label>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Base Currency</label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Standard Core Working Hours</label>
              <Input
                value={standardWorkHours}
                onChange={(e) => setStandardWorkHours(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button type="submit" variant="primary" size="sm" className="text-xs flex items-center gap-1.5">
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: RBAC Permissions Matrix */}
      {activeTab === 'rbac' && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-card-foreground">Enterprise RBAC Policy Grid</h2>
              <p className="text-xs text-muted-foreground">Strict endpoint authorization enforced at Go backend proxy</p>
            </div>
            <Badge variant="primary" className="text-[10px]">Strict Enforcement</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Functional Module</th>
                  <th className="py-3.5 px-4">Super Admin</th>
                  <th className="py-3.5 px-4">HR Director</th>
                  <th className="py-3.5 px-4">Team Lead</th>
                  <th className="py-3.5 px-4">Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {RBAC_MODULES.map((row) => (
                  <tr key={row.module} className="hover:bg-muted/20 transition">
                    <td className="py-3 px-4 font-semibold text-foreground">{row.module}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-500 font-semibold">{row.admin}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-primary font-semibold">{row.hr}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-amber-500 font-medium">{row.manager}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-muted-foreground">{row.employee}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
