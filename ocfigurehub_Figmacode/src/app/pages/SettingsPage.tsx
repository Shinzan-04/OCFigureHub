import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Save, Shield, Crown, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/users';
import { toast } from 'react-hot-toast';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, refreshProfile, updateAvatar } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof usersApi.getMyProfile>> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }
    // Load full profile on mount
    usersApi.getMyProfile().then(setProfile).catch(() => {});
    refreshProfile();
  }, [isLoggedIn, navigate, refreshProfile]);

  // Sync displayName when user changes in store
  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    if (user?.bio !== undefined) setBio(user.bio || '');
  }, [user?.displayName, user?.bio]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    setIsUploadingAvatar(true);
    try {
      const res = await usersApi.uploadAvatar(selectedFile);
      updateAvatar(res.avatarUrl);
      setSelectedFile(null);
      setAvatarPreview(null);
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data || 'Upload thất bại';
      toast.error(typeof msg === 'string' ? msg : 'Upload thất bại');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Tên hiển thị không được để trống.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await usersApi.updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });
      // Sync store
      useAuthStore.setState((s) =>
        s.user
          ? { user: { ...s.user, displayName: updated.displayName, bio: updated.bio } }
          : s
      );
      setProfile(updated);
      toast.success('Lưu thông tin thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data || 'Cập nhật thất bại';
      toast.error(typeof msg === 'string' ? msg : 'Cập nhật thất bại');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!isLoggedIn) return null;

  const currentAvatarUrl = avatarPreview || user?.avatarUrl || null;
  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
  const vip = profile?.vipInfo;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 md:py-14">
      {/* Page header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Shield size={12} />
          Account Settings
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Cài đặt tài khoản</h1>
        <p className="text-sm" style={{ color: '#A1A1A1' }}>
          Quản lý thông tin cá nhân và ảnh đại diện của bạn
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Avatar Section */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Camera size={16} style={{ color: '#8B5CF6' }} />
            Ảnh đại diện
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar preview */}
            <div className="relative shrink-0">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2"
                  style={{ borderColor: '#8B5CF660' }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}
                >
                  {userInitial}
                </div>
              )}

              {/* Camera overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: '#8B5CF6',
                  borderColor: '#111111',
                  color: '#fff',
                }}
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Info + action */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <p className="text-sm font-medium text-white">{user?.displayName}</p>
                <p className="text-xs" style={{ color: '#A1A1A1' }}>
                  JPG, PNG, GIF hoặc WebP. Tối đa 5MB.
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs" style={{ color: '#A1A1A1' }}>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                      style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                    >
                      {isUploadingAvatar ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang tải lên...
                        </>
                      ) : (
                        <>
                          <Save size={12} /> Lưu ảnh
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setAvatarPreview(null);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-red-500"
                      style={{ borderColor: '#262626', color: '#A1A1A1' }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        {/* Profile Info Section */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
          <h2 className="text-base font-semibold text-white mb-5">Thông tin cá nhân</h2>

          <div className="flex flex-col gap-5">
            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#A1A1A1' }}>
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #262626',
                  color: '#A1A1A1',
                  cursor: 'not-allowed',
                }}
              />
            </div>

            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#A1A1A1' }}>
                Tên hiển thị <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                placeholder="Nhập tên hiển thị của bạn"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:border-[#8B5CF6]"
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #262626',
                  color: '#FFFFFF',
                }}
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium flex items-center justify-between" style={{ color: '#A1A1A1' }}>
                <span>Giới thiệu bản thân</span>
                <span>{bio.length}/500</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Mô tả ngắn về bạn..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors focus:border-[#8B5CF6]"
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #262626',
                  color: '#FFFFFF',
                }}
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="self-end px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              {isSavingProfile ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={15} /> Lưu thông tin
                </>
              )}
            </button>
          </div>
        </div>

        {/* Account Summary Section */}
        {profile && (
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            <h2 className="text-base font-semibold text-white mb-5">Tóm tắt tài khoản</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#8B5CF620' }}
                >
                  <Shield size={18} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#A1A1A1' }}>Vai trò</p>
                  <p className="text-sm font-semibold text-white">
                    {profile.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}
                  </p>
                </div>
              </div>

              {/* Member since */}
              {memberSince && (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#8B5CF620' }}
                  >
                    <Calendar size={18} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#A1A1A1' }}>Tham gia</p>
                    <p className="text-sm font-semibold text-white">{memberSince}</p>
                  </div>
                </div>
              )}

              {/* VIP Status */}
              {vip?.isActive ? (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#F59E0B20' }}
                  >
                    <Crown size={18} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#A1A1A1' }}>Gói VIP</p>
                    <p className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
                      {vip.planName} — {vip.downloadsUsed}/{vip.monthlyQuota} downloads
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#EF444420' }}
                  >
                    <Crown size={18} style={{ color: '#EF4444' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#A1A1A1' }}>Gói VIP</p>
                    <button
                      onClick={() => navigate('/upgrade')}
                      className="text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ color: '#8B5CF6' }}
                    >
                      Nâng cấp ngay →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
