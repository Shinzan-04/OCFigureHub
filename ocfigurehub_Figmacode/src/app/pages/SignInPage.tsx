import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email hoặc mật khẩu không hợp lệ.');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          >
            <span className="text-white font-black text-lg">OC</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Đăng nhập</h1>
            <p className="text-sm mt-1" style={{ color: '#A1A1A1' }}>
              Chào mừng trở lại OC Figure HUB
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div
          className="rounded-xl border px-4 py-3 mb-6 text-xs"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF608', color: '#A1A1A1' }}
        >
          <span style={{ color: '#8B5CF6' }}>💡 Demo Admin:</span> admin@ocfigurehub.com / Admin@123
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
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
              <label className="text-sm font-medium text-white">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#FFFFFF' }}
                onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={(e) => (e.target.style.borderColor = '#262626')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Mật khẩu</label>
                <Link to="/forgot-password" className="text-xs transition-colors hover:text-white" style={{ color: '#8B5CF6' }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#FFFFFF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#262626')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#A1A1A1' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 mt-1 disabled:opacity-50"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: '#A1A1A1' }}>
          Chưa có tài khoản?{' '}
          <Link to="/sign-up" className="font-medium hover:opacity-80" style={{ color: '#8B5CF6' }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
