import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="OC Figure Hub" className="h-12 w-auto" style={{ filter: 'invert(1)' }} />
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Khôi phục mật khẩu</h1>
            <p className="text-sm mt-1" style={{ color: '#A1A1A1' }}>
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
          {sent ? (
            <div className="flex flex-col items-center gap-5 text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#8B5CF610' }}
              >
                <Mail size={28} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-2">Email đã được gửi!</p>
                <p className="text-sm" style={{ color: '#A1A1A1' }}>
                  Kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                </p>
              </div>
              <Link
                to="/sign-in"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
              >
                Về trang đăng nhập
              </Link>
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

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: '#0B0B0B',
                    border: '1px solid #262626',
                    color: '#FFFFFF',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#262626')}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 mt-1 disabled:opacity-70"
                style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Gửi link khôi phục'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>

        {/* Back to Sign In */}
        <Link
          to="/sign-in"
          className="flex items-center justify-center gap-2 mt-6 text-sm transition-colors hover:text-white"
          style={{ color: '#A1A1A1' }}
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
