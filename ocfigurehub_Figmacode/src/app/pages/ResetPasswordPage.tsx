import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword({ token, email, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Liên kết không hợp lệ</h1>
          <p className="text-[#a1a1a1] mb-6">Liên kết đặt lại mật khẩu của bạn đã hết hạn hoặc không đúng.</p>
          <Link to="/forgot-password" className="text-[#8B5CF6] hover:underline">
            Yêu cầu liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          >
            <span className="text-white font-black text-lg">OC</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Đặt lại mật khẩu</h1>
            <p className="text-sm mt-1" style={{ color: '#A1A1A1' }}>
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-5 text-center py-4">
              <CheckCircle2 size={48} className="text-green-500" />
              <div>
                <p className="text-lg font-bold text-white mb-2">Thành công!</p>
                <p className="text-sm" style={{ color: '#A1A1A1' }}>
                  Mật khẩu của bạn đã được đặt lại thành công. Đang chuyển hướng đến trang đăng nhập...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#EF444415', border: '1px solid #EF444440', color: '#EF4444' }}
                >
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#FFFFFF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#262626')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#FFFFFF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#262626')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 mt-1 disabled:opacity-70"
                style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Lưu mật khẩu'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
