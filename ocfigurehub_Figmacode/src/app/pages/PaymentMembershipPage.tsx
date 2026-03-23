import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Zap,
  Star,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { useAuth, MembershipPlan } from '../context/AuthContext';
import { FakeQRCode } from '../components/FakeQRCode';

interface PlanInfo {
  name: string;
  price: number;
  priceFormatted: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  features: string[];
  description: string;
}

const PLAN_INFO: Record<MembershipPlan, PlanInfo> = {
  FREE: {
    name: 'Free',
    price: 0,
    priceFormatted: '0₫',
    color: '#10B981',
    bgColor: '#10B98120',
    icon: <Star size={20} />,
    features: ['Truy cập models miễn phí', 'Tải xuống không giới hạn models free', 'Tham gia cộng đồng'],
    description: 'Gói miễn phí, không cần thanh toán',
  },
  PRO: {
    name: 'Pro',
    price: 250000,
    priceFormatted: '250.000₫',
    color: '#8B5CF6',
    bgColor: '#8B5CF620',
    icon: <Zap size={20} />,
    features: [
      'Truy cập toàn bộ models Pro',
      'Download không watermark',
      'Hỗ trợ ưu tiên 24/7',
      'Early access models mới',
      'Source file gốc (Blender/ZBrush)',
      'Badge Pro độc quyền',
    ],
    description: 'Mở khóa toàn bộ tính năng và models cao cấp',
  },
  ULTIMATE: {
    name: 'Ultimate',
    price: 620000,
    priceFormatted: '620.000₫',
    color: '#F59E0B',
    bgColor: '#F59E0B20',
    icon: <Crown size={20} />,
    features: [
      'Tất cả tính năng Pro',
      'Truy cập models Exclusive',
      'Early access trước 7 ngày',
      'Unlimited cloud storage',
      'Hỗ trợ 1-on-1 với Artist',
      'Commercial license đầy đủ',
    ],
    description: 'Toàn quyền truy cập mọi tài nguyên độc quyền',
  },
};

const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'OC FIGURE HUB',
  branch: 'CN TP.HCM',
};

export function PaymentMembershipPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, upgradeMembership } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const planParam = (searchParams.get('plan') || 'PRO').toUpperCase() as MembershipPlan;
  const plan = PLAN_INFO[planParam] || PLAN_INFO.PRO;

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmPayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      upgradeMembership(planParam);
      setLoading(false);
      setSuccess(true);
      // Redirect to home after 2.5s
      setTimeout(() => {
        navigate('/');
      }, 2500);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#10B98120', border: '2px solid #10B98140' }}
          >
            <CheckCircle2 size={40} style={{ color: '#10B981' }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">
            Thanh toán thành công!
          </h2>
          <p className="text-base mb-2" style={{ color: '#A1A1A1' }}>
            Membership đã được kích hoạt.
          </p>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{ backgroundColor: plan.bgColor, color: plan.color }}
          >
            {plan.icon}
            Gói {plan.name} đang hoạt động
          </div>
          <p className="text-sm mb-6" style={{ color: '#A1A1A1' }}>
            Đang chuyển về trang chủ...
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
          >
            Về trang chủ ngay
          </Link>
        </div>
      </div>
    );
  }

  // FREE plan — no payment needed
  if (planParam === 'FREE') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#10B98120' }}
          >
            <Star size={36} style={{ color: '#10B981' }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Gói Free</h2>
          <p className="mb-6" style={{ color: '#A1A1A1' }}>Gói miễn phí không cần thanh toán</p>
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="flex items-center gap-2 mx-auto px-8 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#10B981', color: '#fff' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Kích hoạt gói Free
          </button>
        </div>
      </div>
    );
  }

  const transferContent = `OC MEMBERSHIP ${plan.name.toUpperCase()} - ${user?.email}`;

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-8 md:py-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
        style={{ color: '#A1A1A1' }}
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left - Order summary */}
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-black text-white">Thanh toán Membership</h1>

          {/* Plan card */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: plan.bgColor, color: plan.color }}
              >
                {plan.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">Gói {plan.name}</h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: plan.bgColor, color: plan.color }}
                  >
                    {planParam}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#A1A1A1' }}>{plan.description}</p>
              </div>
            </div>

            <ul className="flex flex-col gap-2 mb-5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Check size={14} style={{ color: plan.color }} />
                  <span className="text-sm" style={{ color: '#A1A1A1' }}>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#262626' }}>
              <span className="text-sm" style={{ color: '#A1A1A1' }}>Tổng thanh toán</span>
              <span className="text-xl font-black" style={{ color: plan.color }}>
                {plan.priceFormatted}/tháng
              </span>
            </div>
          </div>

          {/* Steps */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            <h3 className="text-base font-semibold text-white mb-4">Hướng dẫn thanh toán</h3>
            <ol className="flex flex-col gap-4">
              {[
                'Mở app ngân hàng và chọn chức năng Quét QR',
                `Chuyển khoản đúng số tiền ${plan.priceFormatted}`,
                `Nội dung chuyển khoản: ${transferContent}`,
                'Nhấn "Tôi đã thanh toán" để kích hoạt',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm" style={{ color: '#A1A1A1' }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Bank info */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            <h3 className="text-base font-semibold text-white mb-4">Thông tin chuyển khoản</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Ngân hàng', value: BANK_INFO.bankName },
                { label: 'Số tài khoản', value: BANK_INFO.accountNumber, copyKey: 'account' },
                { label: 'Chủ tài khoản', value: BANK_INFO.accountName },
                { label: 'Số tiền', value: plan.priceFormatted, copyKey: 'amount' },
                { label: 'Nội dung', value: transferContent, copyKey: 'content' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626' }}
                >
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#A1A1A1' }}>{item.label}</p>
                    <p className="text-sm font-medium text-white">{item.value}</p>
                  </div>
                  {item.copyKey && (
                    <button
                      onClick={() => handleCopy(item.value, item.copyKey!)}
                      className="shrink-0 p-1.5 rounded-lg transition-colors"
                      style={{
                        color: copied === item.copyKey ? '#10B981' : '#A1A1A1',
                        backgroundColor: copied === item.copyKey ? '#10B98115' : 'transparent',
                      }}
                    >
                      {copied === item.copyKey ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - QR Code */}
        <div className="flex flex-col gap-5">
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            {/* QR Card */}
            <div
              className="rounded-2xl border p-6 flex flex-col items-center gap-5"
              style={{ backgroundColor: '#111111', borderColor: '#262626' }}
            >
              <h3 className="text-base font-semibold text-white self-start">Quét QR để thanh toán</h3>

              {/* QR Code */}
              <div
                className="p-4 rounded-2xl"
                style={{ backgroundColor: '#fff', border: '4px solid #f0f0f0' }}
              >
                <FakeQRCode size={180} seed={planParam === 'PRO' ? 42 : 77} />
              </div>

              {/* Bank badge */}
              <div
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm"
                style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626', color: '#A1A1A1' }}
              >
                <span className="font-semibold text-white">{BANK_INFO.bankName}</span>
                <span>•</span>
                <span>{BANK_INFO.accountNumber}</span>
              </div>

              <div className="w-full text-center">
                <p className="text-xs mb-1" style={{ color: '#A1A1A1' }}>Số tiền cần chuyển</p>
                <p className="text-2xl font-black" style={{ color: plan.color }}>
                  {plan.priceFormatted}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#A1A1A1' }}>/ tháng</p>
              </div>

              {/* Demo note */}
              <div
                className="w-full px-3 py-2.5 rounded-xl text-xs text-center"
                style={{ backgroundColor: '#F59E0B10', border: '1px solid #F59E0B30', color: '#F59E0B' }}
              >
                🔔 Đây là QR demo. Nhấn xác nhận để kích hoạt ngay.
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: plan.color, color: planParam === 'ULTIMATE' ? '#000' : '#fff' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Tôi đã thanh toán
                  </>
                )}
              </button>
            </div>

            {/* Security note */}
            <div
              className="rounded-xl border px-4 py-3 text-xs"
              style={{ borderColor: '#262626', color: '#A1A1A1' }}
            >
              🔒 Thanh toán an toàn. Membership sẽ được kích hoạt ngay sau khi xác nhận.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
