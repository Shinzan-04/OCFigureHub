import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import { isZaloBrowser } from '../components/ZaloWarningBanner';

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const navigate = useNavigate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const isZalo = isZaloBrowser();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="OC Figure Hub" className="h-12 w-auto" style={{ filter: 'invert(1)' }} />
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Log in</h1>
            <p className="text-sm mt-1" style={{ color: '#A1A1A1' }}>
              Welcome back to OC Figure Hub
            </p>
          </div>
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
                <label className="text-sm font-medium text-white">Password</label>
                <Link to="/forgot-password" className="text-xs transition-colors hover:text-white" style={{ color: '#8B5CF6' }}>
                  Forgot password?
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
              <span>{loading ? 'Logging in...' : 'Log in'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: '#262626' }}></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-[#111111]" style={{ color: '#A1A1A1' }}>Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isZalo && (
              <div
                className="p-3.5 rounded-xl text-xs flex flex-col gap-2 border"
                style={{ backgroundColor: '#312E8115', borderColor: '#6366F140', color: '#C7D2FE' }}
              >
                <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                  <ExternalLink size={14} />
                  <span>Đang mở trong trình duyệt Zalo</span>
                </div>
                <p style={{ color: '#A5B4FC' }}>
                  Google không hỗ trợ đăng nhập trực tiếp trên Zalo. Vui lòng bấm góc trên <strong>(...)</strong> ➔ <strong>Mở bằng trình duyệt</strong> (Safari/Chrome).
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-indigo-600/30 hover:bg-indigo-600/50 text-white transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết để dán vào Safari/Chrome'}</span>
                </button>
              </div>
            )}

            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    const ok = await googleLogin(credentialResponse.credential);
                    if (ok) navigate('/');
                  }
                }}
                onError={() => {
                  setError('Đăng nhập Google thất bại');
                }}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: '#A1A1A1' }}>
          Don't have an account?{' '}
          <Link to="/sign-up" className="font-medium hover:opacity-80" style={{ color: '#8B5CF6' }}>
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

