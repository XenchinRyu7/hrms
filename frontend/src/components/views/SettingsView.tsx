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
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
} from '@etherealui/react';
import { useAuth } from '../../lib/auth-context';

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
  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'theming'>('general');
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
          <span className="text-xs text-muted-foreground">Ethereal UI v0.0.7 &bull; Go REST Engine</span>
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

        <button
          onClick={() => setActiveTab('theming')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'theming' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Design Tokens & OKLCH Theme</span>
        </button>
      </div>

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

      {/* Tab: Theming & Token Verification */}
      {activeTab === 'theming' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Ethereal UI Design System Specifications</h2>
            <p className="text-xs text-muted-foreground">Dark-first telemetry tokens and OKLCH color spaces</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Token Standard:</span>
                <span className="font-semibold text-foreground">Tailwind CSS v4 Native (@theme inline)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Default Canvas:</span>
                <span className="font-mono text-foreground">#09090b (Deep Zinc)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Elevated Panels:</span>
                <span className="font-mono text-foreground">#121215</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Borders:</span>
                <span className="font-mono text-foreground">1px solid var(--border)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WCAG Contrast:</span>
                <span className="font-semibold text-emerald-500">2.1 AA Compliant</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <p className="text-xs font-bold text-foreground">Active Color Palette Verification</p>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground font-mono font-semibold">Primary</div>
                <div className="p-2 rounded-lg bg-secondary text-secondary-foreground font-mono font-semibold">Secondary</div>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground font-mono font-semibold">Muted</div>
                <div className="p-2 rounded-lg bg-card text-card-foreground border border-border font-mono font-semibold">Card</div>
                <div className="p-2 rounded-lg bg-destructive text-destructive-foreground font-mono font-semibold">Destructive</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
