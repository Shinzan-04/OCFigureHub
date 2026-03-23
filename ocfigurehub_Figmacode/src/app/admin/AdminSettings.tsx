import React, { useState } from 'react';
import { Save, Globe, Bell, Shield, CreditCard, Palette, Mail, Database, RefreshCw } from 'lucide-react';

interface SettingSection {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

const SECTIONS: SettingSection[] = [
  { id: 'general', icon: Globe, label: 'General', color: '#8B5CF6' },
  { id: 'notifications', icon: Bell, label: 'Notifications', color: '#F59E0B' },
  { id: 'security', icon: Shield, label: 'Security', color: '#EF4444' },
  { id: 'payment', icon: CreditCard, label: 'Payment', color: '#10B981' },
  { id: 'appearance', icon: Palette, label: 'Appearance', color: '#06B6D4' },
  { id: 'email', icon: Mail, label: 'Email', color: '#EC4899' },
];

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'OC Figure Hub',
    siteDescription: 'Marketplace 3D figure models cho fans anime và monster collectors',
    siteUrl: 'https://ocfigurehub.com',
    contactEmail: 'contact@ocfigurehub.com',
    maxUploadSize: '100',
    allowRegistration: true,
    maintenanceMode: false,
    language: 'vi',
  });

  const [notifSettings, setNotifSettings] = useState({
    newUserEmail: true,
    newOrderEmail: true,
    newReviewEmail: false,
    dailyReportEmail: true,
    weeklyReport: true,
    lowDownloadAlert: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    twoFactorAuth: false,
    maxLoginAttempts: '5',
    sessionTimeout: '24',
    allowGuestDownload: false,
    requireStrongPassword: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    momoEnabled: true,
    vnpayEnabled: true,
    zalopayEnabled: true,
    bankTransferEnabled: true,
    monthlyPrice: '99000',
    yearlyPrice: '990000',
    currency: 'VND',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@ocfigurehub.com',
    smtpPassword: '••••••••••••',
    fromName: 'OC Figure Hub',
    fromEmail: 'noreply@ocfigurehub.com',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
      style={{ background: checked ? '#8B5CF6' : '#333' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          background: '#fff',
          left: checked ? '22px' : '2px',
        }}
      />
    </button>
  );

  const InputField = ({ label, value, onChange, type = 'text', disabled = false }: {
    label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean;
  }) => (
    <div>
      <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg outline-none"
        style={{
          background: disabled ? '#151515' : '#1A1A1A',
          border: '1px solid #262626',
          color: disabled ? '#555' : '#fff',
          fontSize: 13,
        }}
      />
    </div>
  );

  const ToggleRow = ({ label, desc, checked, onChange }: {
    label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1A1A1A' }}>
      <div>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{label}</p>
        {desc && <p style={{ color: '#666', fontSize: 11 }}>{desc}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Settings</h2>
          <p style={{ color: '#666', fontSize: 13 }}>Platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ background: saved ? '#10B981' : '#8B5CF6', color: '#fff', fontSize: 14, fontWeight: 600 }}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left transition-all"
                style={{
                  background: activeSection === s.id ? `${s.color}15` : 'transparent',
                  borderLeft: activeSection === s.id ? `3px solid ${s.color}` : '3px solid transparent',
                  color: activeSection === s.id ? s.color : '#888',
                  fontSize: 13,
                  fontWeight: activeSection === s.id ? 600 : 400,
                }}
              >
                <s.icon size={15} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
              {SECTIONS.find(s => s.id === activeSection)?.label} Settings
            </h3>
          </div>

          <div className="p-5">
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Site Name" value={generalSettings.siteName} onChange={v => setGeneralSettings(s => ({ ...s, siteName: v }))} />
                  <InputField label="Site URL" value={generalSettings.siteUrl} onChange={v => setGeneralSettings(s => ({ ...s, siteUrl: v }))} />
                  <InputField label="Contact Email" value={generalSettings.contactEmail} onChange={v => setGeneralSettings(s => ({ ...s, contactEmail: v }))} type="email" />
                  <InputField label="Max Upload Size (MB)" value={generalSettings.maxUploadSize} onChange={v => setGeneralSettings(s => ({ ...s, maxUploadSize: v }))} type="number" />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Site Description</label>
                  <textarea
                    value={generalSettings.siteDescription}
                    onChange={e => setGeneralSettings(s => ({ ...s, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Language</label>
                  <select
                    value={generalSettings.language}
                    onChange={e => setGeneralSettings(s => ({ ...s, language: e.target.value }))}
                    className="px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <ToggleRow label="Allow Registration" desc="Allow new users to register" checked={generalSettings.allowRegistration} onChange={v => setGeneralSettings(s => ({ ...s, allowRegistration: v }))} />
                <ToggleRow label="Maintenance Mode" desc="Put site in maintenance mode" checked={generalSettings.maintenanceMode} onChange={v => setGeneralSettings(s => ({ ...s, maintenanceMode: v }))} />
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <ToggleRow label="New User Signup" desc="Get notified when a new user registers" checked={notifSettings.newUserEmail} onChange={v => setNotifSettings(s => ({ ...s, newUserEmail: v }))} />
                <ToggleRow label="New Order" desc="Get notified on new purchases" checked={notifSettings.newOrderEmail} onChange={v => setNotifSettings(s => ({ ...s, newOrderEmail: v }))} />
                <ToggleRow label="New Review" desc="Get notified when a resource is reviewed" checked={notifSettings.newReviewEmail} onChange={v => setNotifSettings(s => ({ ...s, newReviewEmail: v }))} />
                <ToggleRow label="Daily Report" desc="Receive daily summary email" checked={notifSettings.dailyReportEmail} onChange={v => setNotifSettings(s => ({ ...s, dailyReportEmail: v }))} />
                <ToggleRow label="Weekly Report" desc="Receive weekly analytics report" checked={notifSettings.weeklyReport} onChange={v => setNotifSettings(s => ({ ...s, weeklyReport: v }))} />
                <ToggleRow label="Low Downloads Alert" desc="Alert when downloads drop below threshold" checked={notifSettings.lowDownloadAlert} onChange={v => setNotifSettings(s => ({ ...s, lowDownloadAlert: v }))} />
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <ToggleRow label="Email Verification" desc="Require email verification on signup" checked={securitySettings.requireEmailVerification} onChange={v => setSecuritySettings(s => ({ ...s, requireEmailVerification: v }))} />
                <ToggleRow label="Two-Factor Auth" desc="Enable 2FA for admin accounts" checked={securitySettings.twoFactorAuth} onChange={v => setSecuritySettings(s => ({ ...s, twoFactorAuth: v }))} />
                <ToggleRow label="Guest Downloads" desc="Allow non-logged-in users to download free resources" checked={securitySettings.allowGuestDownload} onChange={v => setSecuritySettings(s => ({ ...s, allowGuestDownload: v }))} />
                <ToggleRow label="Strong Password Policy" desc="Require strong passwords on registration" checked={securitySettings.requireStrongPassword} onChange={v => setSecuritySettings(s => ({ ...s, requireStrongPassword: v }))} />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <InputField label="Max Login Attempts" value={securitySettings.maxLoginAttempts} onChange={v => setSecuritySettings(s => ({ ...s, maxLoginAttempts: v }))} type="number" />
                  <InputField label="Session Timeout (hours)" value={securitySettings.sessionTimeout} onChange={v => setSecuritySettings(s => ({ ...s, sessionTimeout: v }))} type="number" />
                </div>
              </div>
            )}

            {activeSection === 'payment' && (
              <div className="space-y-4">
                <div>
                  <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Payment Gateways</p>
                  <ToggleRow label="MoMo" desc="Enable MoMo payment" checked={paymentSettings.momoEnabled} onChange={v => setPaymentSettings(s => ({ ...s, momoEnabled: v }))} />
                  <ToggleRow label="VNPay" desc="Enable VNPay payment" checked={paymentSettings.vnpayEnabled} onChange={v => setPaymentSettings(s => ({ ...s, vnpayEnabled: v }))} />
                  <ToggleRow label="ZaloPay" desc="Enable ZaloPay payment" checked={paymentSettings.zalopayEnabled} onChange={v => setPaymentSettings(s => ({ ...s, zalopayEnabled: v }))} />
                  <ToggleRow label="Bank Transfer" desc="Enable manual bank transfer" checked={paymentSettings.bankTransferEnabled} onChange={v => setPaymentSettings(s => ({ ...s, bankTransferEnabled: v }))} />
                </div>
                <div>
                  <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Membership Pricing</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Monthly Price (VND)" value={paymentSettings.monthlyPrice} onChange={v => setPaymentSettings(s => ({ ...s, monthlyPrice: v }))} type="number" />
                    <InputField label="Yearly Price (VND)" value={paymentSettings.yearlyPrice} onChange={v => setPaymentSettings(s => ({ ...s, yearlyPrice: v }))} type="number" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-5">
                <p style={{ color: '#888', fontSize: 13 }}>Visual customization settings coming soon. The site uses a fixed dark theme consistent with the OC Figure Hub brand.</p>
                <div className="grid grid-cols-3 gap-3">
                  {['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                    <div
                      key={color}
                      className="h-14 rounded-xl flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-105"
                      style={{ background: color, color: '#fff', fontWeight: 600 }}
                    >
                      {color}
                    </div>
                  ))}
                </div>
                <p style={{ color: '#666', fontSize: 12 }}>Primary color options (non-functional preview)</p>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="SMTP Host" value={emailSettings.smtpHost} onChange={v => setEmailSettings(s => ({ ...s, smtpHost: v }))} />
                  <InputField label="SMTP Port" value={emailSettings.smtpPort} onChange={v => setEmailSettings(s => ({ ...s, smtpPort: v }))} />
                  <InputField label="SMTP Username" value={emailSettings.smtpUser} onChange={v => setEmailSettings(s => ({ ...s, smtpUser: v }))} />
                  <InputField label="SMTP Password" value={emailSettings.smtpPassword} type="password" />
                  <InputField label="From Name" value={emailSettings.fromName} onChange={v => setEmailSettings(s => ({ ...s, fromName: v }))} />
                  <InputField label="From Email" value={emailSettings.fromEmail} onChange={v => setEmailSettings(s => ({ ...s, fromEmail: v }))} type="email" />
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{ background: 'rgba(236,72,153,0.1)', color: '#EC4899', fontWeight: 600 }}
                >
                  <RefreshCw size={14} />
                  Send Test Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 style={{ color: '#EF4444', fontSize: 14, fontWeight: 600 }}>⚠ Danger Zone</h3>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Clear All Cache', desc: 'Remove all cached data from the server', color: '#F59E0B', icon: Database },
            { label: 'Reset to Defaults', desc: 'Reset all settings to factory defaults', color: '#EF4444', icon: RefreshCw },
          ].map(action => (
            <div key={action.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid #262626' }}>
              <div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{action.label}</p>
                <p style={{ color: '#888', fontSize: 12 }}>{action.desc}</p>
              </div>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                style={{ background: `${action.color}15`, color: action.color, fontWeight: 600 }}
              >
                <action.icon size={14} />
                {action.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
