import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS, formatPrice } from '../data/products';
import { FakeQRCode } from '../components/FakeQRCode';

const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'OC FIGURE HUB',
};

export function PaymentProductPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, addPurchasedProduct } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const productId = searchParams.get('id') || '';
  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-white">Không tìm thấy sản phẩm</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmPayment = () => {
    setLoading(true);
    setTimeout(() => {
      addPurchasedProduct(product.id);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/product/${product.id}`);
      }, 2500);
    }, 1500);
  };

  const transferContent = `OC PRODUCT ${product.id} - ${user?.email}`;

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
          <h2 className="text-2xl font-black text-white mb-3">Thanh toán thành công!</h2>
          <p className="text-base mb-2" style={{ color: '#A1A1A1' }}>
            Bạn đã mua thành công <span className="text-white font-semibold">{product.title}</span>
          </p>
          <p className="text-sm mb-8" style={{ color: '#A1A1A1' }}>
            Đang chuyển đến trang sản phẩm để tải xuống...
          </p>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
          >
            <Download size={16} />
            Tải xuống ngay
          </Link>
        </div>
      </div>
    );
  }

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
        {/* Left */}
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-black text-white">Thanh toán sản phẩm</h1>

          {/* Product card */}
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            <div className="flex gap-4">
              <div
                className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border"
                style={{ borderColor: '#262626' }}
              >
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                <div>
                  <h3 className="text-base font-bold text-white leading-tight mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#A1A1A1' }}>by {product.creator}</p>
                  <div className="flex gap-2 mt-2">
                    {product.isPro && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
                      >
                        Pro
                      </span>
                    )}
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ backgroundColor: '#262626', color: '#A1A1A1' }}
                    >
                      {product.category}
                    </span>
                  </div>
                </div>
                <p className="text-xl font-black" style={{ color: '#8B5CF6' }}>
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#262626' }}>
              <span className="text-sm" style={{ color: '#A1A1A1' }}>Tổng thanh toán</span>
              <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
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
                `Chuyển khoản đúng số tiền ${formatPrice(product.price)}`,
                `Nội dung chuyển khoản: ${transferContent}`,
                'Nhấn "Tôi đã thanh toán" để mở khóa tải xuống',
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
                { label: 'Số tiền', value: formatPrice(product.price), copyKey: 'amount' },
                { label: 'Nội dung', value: transferContent, copyKey: 'content' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#0B0B0B', border: '1px solid #262626' }}
                >
                  <div className="min-w-0">
                    <p className="text-xs mb-0.5" style={{ color: '#A1A1A1' }}>{item.label}</p>
                    <p className="text-sm font-medium text-white truncate">{item.value}</p>
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

              <div
                className="p-4 rounded-2xl"
                style={{ backgroundColor: '#fff', border: '4px solid #f0f0f0' }}
              >
                <FakeQRCode size={180} seed={parseInt(product.id) * 13 + 5} />
              </div>

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
                <p className="text-2xl font-black" style={{ color: '#8B5CF6' }}>
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Demo note */}
              <div
                className="w-full px-3 py-2.5 rounded-xl text-xs text-center"
                style={{ backgroundColor: '#F59E0B10', border: '1px solid #F59E0B30', color: '#F59E0B' }}
              >
                🔔 Đây là QR demo. Nhấn xác nhận để mở khóa tải xuống.
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
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

            <div
              className="rounded-xl border px-4 py-3 text-xs"
              style={{ borderColor: '#262626', color: '#A1A1A1' }}
            >
              🔒 Thanh toán an toàn. Quyền tải xuống được mở ngay sau khi xác nhận.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
