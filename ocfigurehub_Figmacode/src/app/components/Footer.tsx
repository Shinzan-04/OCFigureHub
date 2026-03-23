import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      className="border-t mt-auto"
      style={{ backgroundColor: '#0B0B0B', borderColor: '#262626' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
              >
                <span className="text-white font-black text-sm">OC</span>
              </div>
              <span className="text-white font-bold text-lg">
                OC Figure <span style={{ color: '#8B5CF6' }}>HUB</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#A1A1A1' }}>
              The new home for your digital goods — kho tàng file mô hình 3D anime chất lượng cao cho cộng đồng sáng tạo Việt Nam.
            </p>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A1A1A1' }}>
                  Navigation
                </span>
                {[
                  { href: '/', label: 'Explore' },
                  { href: '/about-us', label: 'About Us' },
                  { href: '/upgrade', label: 'Membership' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white w-fit"
                    style={{ color: '#A1A1A1' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A1A1A1' }}>
                  Account
                </span>
                {[
                  { href: '/sign-in', label: 'Sign In' },
                  { href: '/sign-up', label: 'Sign Up' },
                  { href: '/forgot-password', label: 'Reset Password' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white w-fit"
                    style={{ color: '#A1A1A1' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Newsletter */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Nhận thông báo mới nhất</h3>
              <p className="text-sm" style={{ color: '#A1A1A1' }}>
                Đăng ký để nhận thông báo về các file mới, giảm giá và cập nhật từ cộng đồng OC Figure HUB.
              </p>
            </div>

            {subscribed ? (
              <div
                className="p-4 rounded-2xl border text-center"
                style={{ borderColor: '#8B5CF6', backgroundColor: '#8B5CF610' }}
              >
                <p className="text-sm font-medium" style={{ color: '#8B5CF6' }}>
                  🎉 Cảm ơn bạn đã đăng ký!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-colors duration-200"
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #262626',
                    color: '#FFFFFF',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#262626')}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 justify-center px-5 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
                >
                  Subscribe
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Category quick links */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['All', 'Free', 'Anime', 'Monsters'].map((cat) => {
                const href = cat === 'All' ? '/' : `/${cat.toLowerCase()}`;
                return (
                  <Link
                    key={cat}
                    to={href}
                    className="px-3 py-1.5 rounded-xl text-xs border transition-colors duration-200 hover:border-[#8B5CF6]"
                    style={{ borderColor: '#262626', color: '#A1A1A1' }}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: '#262626' }}
        >
          <p className="text-xs" style={{ color: '#A1A1A1' }}>
            © 2026 OC Figure HUB. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#A1A1A1' }}>
            Made with ❤️ cho cộng đồng anime Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
