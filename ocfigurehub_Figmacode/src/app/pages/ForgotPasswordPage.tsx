import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
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
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
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
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 mt-1"
                style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
              >
                Gửi link khôi phục
                <ArrowRight size={16} />
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
