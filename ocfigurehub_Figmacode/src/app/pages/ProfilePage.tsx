import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Download, ShoppingBag, Crown, Loader2, Save, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import API from '../../api/client';
import toast from 'react-hot-toast';

interface ProfileData {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
  subscription: {
    planName: string;
    expiresAt: string;
    isActive: boolean;
  } | null;
  stats: {
    totalDownloads: number;
    totalOrders: number;
  };
}

export function ProfilePage() {
  const { user, logout, refreshProfile } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'password'>('info');

  // Edit state
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get<ProfileData>('/profile');
        setProfile(res.data);
        setDisplayName(res.data.displayName);
      } catch {
        toast.error('Không tải được thông tin hồ sơ');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await API.put('/profile', { displayName: displayName.trim() });
      toast.success('Cập nhật hồ sơ thành công');
      setProfile(prev => prev ? { ...prev, displayName: displayName.trim() } : prev);
      await refreshProfile();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setChangingPw(true);
    try {
      await API.put('/profile/password', { currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={36} style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
          <p className="text-white font-bold">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: '#0B0B0B',
    border: '1px solid #262626',
    color: '#FFFFFF',
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}
        >
          {profile.displayName.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-white">{profile.displayName}</h1>
          <p className="text-sm" style={{ color: '#A1A1A1' }}>{profile.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: profile.role === 'Admin' ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)',
              color: profile.role === 'Admin' ? '#EF4444' : '#8B5CF6',
            }}
          >
            {profile.role}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Downloads', value: profile.stats.totalDownloads, icon: Download, color: '#10B981' },
          { label: 'Orders', value: profile.stats.totalOrders, icon: ShoppingBag, color: '#F59E0B' },
          { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('vi-VN'), icon: Calendar, color: '#06B6D4' },
          {
            label: 'Subscription',
            value: profile.subscription?.planName || 'Free',
            icon: Crown,
            color: profile.subscription ? '#8B5CF6' : '#666',
          },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}1A` }}>
              <s.icon size={16} color={s.color} />
            </div>
            <p className="text-white font-bold text-sm">{s.value}</p>
            <p style={{ color: '#666', fontSize: 11 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        {[
          { key: 'info' as const, label: 'Information', icon: User },
          { key: 'password' as const, label: 'Change Password', icon: Lock },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.key ? '#8B5CF620' : 'transparent',
              color: tab === t.key ? '#8B5CF6' : '#666',
              border: tab === t.key ? '1px solid #8B5CF640' : '1px solid transparent',
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid #262626' }}>
        {tab === 'info' ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Email</label>
              <div
                className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ ...inputStyle, opacity: 0.6 }}
              >
                <Mail size={14} style={{ color: '#666' }} />
                {profile.email}
              </div>
              <p style={{ color: '#666', fontSize: 11 }}>Email cannot be changed</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={e => (e.target.style.borderColor = '#262626')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Role</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ ...inputStyle, opacity: 0.6 }}>
                <Shield size={14} style={{ color: '#666' }} />
                {profile.role}
              </div>
            </div>

            {profile.subscription && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Membership Plan</label>
                <div className="px-4 py-3 rounded-xl text-sm flex items-center justify-between" style={inputStyle}>
                  <div className="flex items-center gap-2">
                    <Crown size={14} style={{ color: '#8B5CF6' }} />
                    <span style={{ color: '#8B5CF6' }}>{profile.subscription.planName}</span>
                  </div>
                  <span style={{ color: '#666', fontSize: 11 }}>
                    Expires: {new Date(profile.subscription.expiresAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving || displayName.trim() === profile.displayName}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? 'Saving...' : 'Save changes'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={e => (e.target.style.borderColor = '#262626')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={e => (e.target.style.borderColor = '#262626')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={e => (e.target.style.borderColor = '#262626')}
              />
            </div>

            <button
              type="submit"
              disabled={changingPw || !currentPassword || !newPassword || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              {changingPw ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              <span>{changingPw ? 'Changing...' : 'Change password'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        Log out
      </button>
    </div>
  );
}
