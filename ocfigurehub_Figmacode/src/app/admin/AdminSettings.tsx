import React, { useState, useEffect } from 'react';
import { Save, Globe, Bell, Shield, Palette, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';

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
  { id: 'appearance', icon: Palette, label: 'Appearance', color: '#06B6D4' },
  { id: 'email', icon: Mail, label: 'Email', color: '#EC4899' },
];

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);

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
    sessionTimeout: '24',
    allowGuestDownload: false,
    requireStrongPassword: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@ocfigurehub.com',
    smtpPassword: '••••••••••••',
    fromName: 'OC Figure Hub',
    fromEmail: 'noreply@ocfigurehub.com',
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    heroModels: '[]',
  });

  // Load settings from API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getSettings();
        if (data.general) {
          setGeneralSettings(prev => ({ ...prev, ...data.general, allowRegistration: data.general.allowRegistration === 'true', maintenanceMode: data.general.maintenanceMode === 'true' }));
        }
        if (data.notifications) {
          setNotifSettings(prev => {
            const n = { ...prev };
            Object.keys(n).forEach(k => { if (data.notifications[k] !== undefined) (n as any)[k] = data.notifications[k] === 'true'; });
            return n;
          });
        }
        if (data.security) {
          setSecuritySettings(prev => ({ ...prev, ...data.security, requireEmailVerification: data.security.requireEmailVerification === 'true', allowGuestDownload: data.security.allowGuestDownload === 'true', requireStrongPassword: data.security.requireStrongPassword === 'true' }));
        }

        if (data.email) {
          setEmailSettings(prev => ({ ...prev, ...data.email }));
        }
        if (data.appearance) {
          setAppearanceSettings(prev => ({ ...prev, ...data.appearance }));
        }
      } catch { /* first time — no settings yet */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const toStr = (obj: Record<string, any>) => {
        const r: Record<string, string> = {};
        Object.entries(obj).forEach(([k, v]) => r[k] = String(v));
        return r;
      };
      await adminApi.saveSettings({
        general: toStr(generalSettings),
        notifications: toStr(notifSettings),
        security: toStr(securitySettings),
        email: toStr(emailSettings),
        appearance: toStr(appearanceSettings),
      });
      setSaved(true);
      toast.success('Settings saved!');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
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
                <ToggleRow label="Email Verification" desc="Yêu cầu xác thực email khi đăng ký" checked={securitySettings.requireEmailVerification} onChange={v => setSecuritySettings(s => ({ ...s, requireEmailVerification: v }))} />
                <ToggleRow label="Guest Downloads" desc="Cho phép người dùng chưa đăng nhập tải file miễn phí" checked={securitySettings.allowGuestDownload} onChange={v => setSecuritySettings(s => ({ ...s, allowGuestDownload: v }))} />
                <ToggleRow label="Strong Password Policy" desc="Bắt buộc mật khẩu mạnh khi đăng ký" checked={securitySettings.requireStrongPassword} onChange={v => setSecuritySettings(s => ({ ...s, requireStrongPassword: v }))} />
                <div className="mt-4">
                  <InputField label="Session Timeout (hours)" value={securitySettings.sessionTimeout} onChange={v => setSecuritySettings(s => ({ ...s, sessionTimeout: v }))} type="number" />
                </div>
              </div>
            )}


            {activeSection === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Hero 3D Models</h4>
                  <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
                    Quản lý danh sách các mô hình 3D (.glb) hiển thị động trên màn hình chính (Homepage).
                  </p>
                  
                  <div className="space-y-3">
                    {(() => {
                      let models: string[] = [];
                      try { models = JSON.parse(appearanceSettings.heroModels); } catch {}
                      
                      return (
                        <>
                          {models.map((m, i) => {
                            // Extract just the original filename by removing the date and GUID prefix
                            // e.g. "2026/08/guid_filename.glb" -> "filename.glb"
                            const displayName = m.includes('_') ? m.substring(m.indexOf('_') + 1) : m;
                            return (
                              <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #262626' }}>
                                <span style={{ color: '#fff', fontSize: 13 }} className="truncate flex-1">{displayName}</span>
                                <button 
                                  onClick={() => {
                                  const next = models.filter((_, idx) => idx !== i);
                                  setAppearanceSettings(s => ({ ...s, heroModels: JSON.stringify(next) }));
                                }}
                                className="text-red-500 hover:text-red-400 text-sm ml-4"
                              >
                                Xóa
                              </button>
                            </div>
                            );
                          })}
                          <div className="pt-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 600 }}>
                              <input 
                                type="file" 
                                accept=".glb,.gltf" 
                                className="hidden" 
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    toast.loading('Đang upload...', { id: 'upload-hero' });
                                    const res = await adminApi.uploadHeroModel(file);
                                    const next = [...models, res.storageKey];
                                    setAppearanceSettings(s => ({ ...s, heroModels: JSON.stringify(next) }));
                                    toast.success('Upload thành công', { id: 'upload-hero' });
                                  } catch (err) {
                                    toast.error('Upload thất bại', { id: 'upload-hero' });
                                  }
                                }}
                              />
                              <span>+ Tải lên Mô hình mới</span>
                            </label>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="SMTP Host" value={emailSettings.smtpHost} onChange={v => setEmailSettings(s => ({ ...s, smtpHost: v }))} />
                  <InputField label="SMTP Port" value={emailSettings.smtpPort} onChange={v => setEmailSettings(s => ({ ...s, smtpPort: v }))} />
                  <InputField label="SMTP Username" value={emailSettings.smtpUser} onChange={v => setEmailSettings(s => ({ ...s, smtpUser: v }))} />
                  <InputField label="SMTP Password" value={emailSettings.smtpPassword} onChange={v => setEmailSettings(s => ({ ...s, smtpPassword: v }))} type="password" />
                  <InputField label="From Name" value={emailSettings.fromName} onChange={v => setEmailSettings(s => ({ ...s, fromName: v }))} />
                  <InputField label="From Email" value={emailSettings.fromEmail} onChange={v => setEmailSettings(s => ({ ...s, fromEmail: v }))} type="email" />
                </div>
                <button
                  disabled={isSendingTest}
                  onClick={async () => {
                    setIsSendingTest(true);
                    try {
                      const result = await adminApi.sendTestEmail();
                      toast.success(result.message);
                    } catch (err: any) {
                      const msg = err?.response?.data?.message || 'Gửi email thất bại. Kiểm tra lại cấu hình SMTP.';
                      toast.error(msg);
                    } finally {
                      setIsSendingTest(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(236,72,153,0.1)', color: '#EC4899', fontWeight: 600 }}
                >
                  {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isSendingTest ? 'Đang gửi...' : 'Send Test Email'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
