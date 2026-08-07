import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { configApi, PublicConfig } from '../../api/config';

export function SignUpPage() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  
  useEffect(() => {
    configApi.getPublicConfig().then(setConfig);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const success = await register(email, password, displayName);
      if (success) {
        setShowVerification(true);
      } else {
        setError('Đăng ký thất bại. Email có thể đã được sử dụng.');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { default: API } = await import('../../api/client');
      await API.post('/auth/resend-verification', { email });
    } catch { /* silent */ }
    setResendLoading(false);
  };

  if (showVerification) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[420px]">
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
            >
              <span style={{ fontSize: '2rem' }}>✉️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm mb-6" style={{ color: '#A1A1A1', lineHeight: 1.6 }}>
              We have sent a verification link to <strong style={{ color: '#8B5CF6' }}>{email}</strong>.
              Please check your inbox (and spam folder) to verify your account.
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 mb-3"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              <span>{resendLoading ? 'Resending...' : 'Resend verification email'}</span>
            </button>
            <Link to="/sign-in" className="text-sm font-medium hover:opacity-80" style={{ color: '#A1A1A1' }}>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="OC Figure Hub" className="h-12 w-auto" style={{ filter: 'invert(1)' }} />
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Create Account</h1>
            <p className="text-sm mt-1" style={{ color: '#A1A1A1' }}>
              Start your journey with OC Figure Hub
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
          {config && config.allowRegistration === false ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <ShieldAlert size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Registration Temporarily Locked</h3>
              <p className="text-[#888] max-w-sm">
                Administrators have temporarily disabled new account creation. Please check back later!
              </p>
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
              <label className="text-sm font-medium text-white">Display Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#FFFFFF' }}
                onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={(e) => (e.target.style.borderColor = '#262626')}
              />
            </div>

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
              <label className="text-sm font-medium text-white">Password</label>
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#FFFFFF' }}
                onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={(e) => (e.target.style.borderColor = '#262626')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 mt-1 disabled:opacity-50"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: '#A1A1A1' }}>
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium hover:opacity-80" style={{ color: '#8B5CF6' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
