import { useParams, Link, useNavigate } from 'react-router';
import {
  Download,
  Heart,
  ArrowLeft,
  Tag,
  Share2,
  ChevronRight,
  ShoppingBag,
  Loader2,
  FileBox,
  HardDrive,
} from 'lucide-react';
import { useSaved } from '../context/SavedContext';
import { useAuthStore } from '../../store/authStore';
import { useProductDetail } from '../../hooks/useProductDetail';
import { SkeletonProductCard } from '../components/SkeletonProductCard';
import { ordersApi } from '../../api/orders';
import { downloadsApi } from '../../api/downloads';
import toast from 'react-hot-toast';
import { useState } from 'react';

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_TYPE_LABELS: Record<number, string> = {
  1: 'Model',
  2: 'Preview',
  3: 'Thumbnail',
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleSaved, isSaved } = useSaved();
  const { user, isLoggedIn } = useAuthStore();
  const { data: product, isLoading } = useProductDetail(id);
  const [buying, setBuying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-4">
            <div className="rounded-2xl aspect-video animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
            <div className="h-6 w-1/3 rounded animate-pulse" style={{ backgroundColor: '#262626' }} />
            <div className="h-4 w-2/3 rounded animate-pulse" style={{ backgroundColor: '#262626' }} />
          </div>
          <SkeletonProductCard />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-white">404</p>
        <p style={{ color: '#A1A1A1' }}>Không tìm thấy sản phẩm</p>
        <Link to="/" className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: '#8B5CF6', color: '#fff' }}>
          Về trang chủ
        </Link>
      </div>
    );
  }

  const saved = isSaved(product.id);
  const isFree = product.price === 0;

  const handleBuyNow = async () => {
    if (!isLoggedIn) { navigate('/sign-in'); return; }
    setBuying(true);
    try {
      const order = await ordersApi.buyNow({ productId: product.id, licenseType: 0 });
      if (product.price === 0) {
        toast.success('Mua thành công! Bạn có thể tải xuống.');
        return;
      }
      const payment = await ordersApi.createPayment({ orderId: order.orderId, amount: order.totalAmount });
      window.location.href = payment.paymentUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Mua thất bại');
    } finally {
      setBuying(false);
    }
  };

  const handleDownload = async () => {
    if (!isLoggedIn) { navigate('/sign-in'); return; }
    setDownloading(true);
    try {
      const modelFile = product.files.find(f => f.fileType === 1);
      const format = modelFile?.format || 'STL';
      const res = await downloadsApi.request({ productId: product.id, format });
      window.open(res.signedUrl, '_blank');
      toast.success('Đang tải xuống...');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Tải xuống thất bại. Bạn cần mua sản phẩm trước.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8" style={{ color: '#A1A1A1' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm hover:text-white transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </button>
        <ChevronRight size={14} />
        <span className="text-sm capitalize">{product.category}</span>
        <ChevronRight size={14} />
        <span className="text-sm text-white line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Hero visual */}
          <div
            className="rounded-2xl overflow-hidden border relative aspect-video flex items-center justify-center bg-[#111111]"
            style={{ borderColor: '#262626' }}
          >
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="text-8xl font-black" style={{ color: '#8B5CF620', background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.name.charAt(0)}
              </span>
            )}
            {isFree && (
              <div className="absolute top-4 left-4">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#10B981', color: '#fff' }}>
                  Free
                </span>
              </div>
            )}
            {!isFree && (
              <div className="absolute top-4 right-4">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#8B5CF6', border: '1px solid #8B5CF640' }}>
                  {formatPrice(product.price)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-2xl border p-6" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
            <h2 className="text-lg font-bold text-white mb-3">Mô tả</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#A1A1A1' }}>
              {product.description}
            </p>
          </div>

          {/* Files */}
          {product.files.length > 0 && (
            <div className="rounded-2xl border p-6" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <div className="flex items-center gap-2 mb-3">
                <FileBox size={16} style={{ color: '#8B5CF6' }} />
                <h2 className="text-lg font-bold text-white">Files ({product.files.length})</h2>
              </div>
              <div className="space-y-2">
                {product.files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border"
                    style={{ borderColor: '#262626', backgroundColor: '#0B0B0B' }}
                  >
                    <div className="flex items-center gap-3">
                      <HardDrive size={14} style={{ color: '#A1A1A1' }} />
                      <span className="text-sm text-white">{f.format}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#262626', color: '#A1A1A1' }}>
                        {FILE_TYPE_LABELS[f.fileType] || 'File'}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#A1A1A1' }}>
                      {formatFileSize(f.fileSize)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - Info Panel */}
        <div className="flex flex-col gap-5">
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            {/* Title Card */}
            <div className="rounded-2xl border p-6" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{product.name}</h1>
                <button
                  onClick={() => toggleSaved(product.id)}
                  className="shrink-0 p-2.5 rounded-xl border transition-all duration-200 hover:border-[#8B5CF6]"
                  style={{
                    borderColor: saved ? '#8B5CF6' : '#262626',
                    backgroundColor: saved ? '#8B5CF610' : 'transparent',
                    color: saved ? '#8B5CF6' : '#A1A1A1',
                  }}
                >
                  <Heart size={20} fill={saved ? '#8B5CF6' : 'none'} />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                {isFree && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
                    Free
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ backgroundColor: '#262626', color: '#A1A1A1' }}>
                  {product.category}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-black" style={{ color: isFree ? '#10B981' : '#FFFFFF' }}>
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                {!isLoggedIn ? (
                  <button
                    onClick={() => navigate('/sign-in')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-opacity hover:opacity-90 text-sm"
                    style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                  >
                    Đăng nhập để xem giá
                  </button>
                ) : (
                  <>
                    {(isFree || product.isOwnedByUser) ? (
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-opacity hover:opacity-90 text-sm disabled:opacity-50"
                        style={{ backgroundColor: '#10B981', color: '#fff' }}
                      >
                        {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {downloading ? 'Đang tải...' : 'Tải xuống ngay'}
                      </button>
                    ) : (
                      <>
                        {product.hasActiveSubscription && product.remainingDownloads > 0 ? (
                          <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-opacity hover:opacity-90 text-sm disabled:opacity-50"
                            style={{ backgroundColor: '#10B981', color: '#fff' }}
                          >
                            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            {downloading ? 'Đang tải...' : `Tải bằng gói (${product.remainingDownloads} lượt)`}
                          </button>
                        ) : null}

                        <button
                          onClick={handleBuyNow}
                          disabled={buying}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-opacity hover:opacity-90 text-sm disabled:opacity-50"
                          style={{
                            backgroundColor: (product.hasActiveSubscription && product.remainingDownloads > 0) ? 'transparent' : '#8B5CF6',
                            borderColor: (product.hasActiveSubscription && product.remainingDownloads > 0) ? '#262626' : 'transparent',
                            borderWidth: (product.hasActiveSubscription && product.remainingDownloads > 0) ? 1 : 0,
                            color: (product.hasActiveSubscription && product.remainingDownloads > 0) ? '#A1A1A1' : '#fff'
                          }}
                        >
                          {buying ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                          {buying ? 'Đang xử lý...' : `Mua lẻ — ${formatPrice(product.price)}`}
                        </button>

                        {!product.hasActiveSubscription && (
                          <button
                            onClick={() => navigate('/upgrade')}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold border transition-colors hover:border-[#8B5CF6] text-sm"
                            style={{ borderColor: '#262626', color: '#A1A1A1' }}
                          >
                            Đăng ký gói (Tải rẻ hơn)
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}

                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold border transition-colors hover:border-[#8B5CF6] text-sm"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  <Share2 size={18} /> Chia sẻ
                </button>
              </div>

              {!isLoggedIn && !isFree && (
                <p className="text-xs mt-3 text-center" style={{ color: '#A1A1A1' }}>
                  <Link to="/sign-in" style={{ color: '#8B5CF6' }}>Đăng nhập</Link>{' '}
                  hoặc{' '}
                  <Link to="/sign-up" style={{ color: '#8B5CF6' }}>đăng ký</Link>{' '}
                  để mua sản phẩm
                </p>
              )}
            </div>

            {/* Category Card */}
            <div className="rounded-2xl border p-5" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Thông tin</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#A1A1A1' }}>Danh mục</span>
                  <span className="text-xs text-white capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#A1A1A1' }}>Số file</span>
                  <span className="text-xs text-white">{product.files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#A1A1A1' }}>Trạng thái</span>
                  <span className="text-xs" style={{ color: product.isEnabled ? '#10B981' : '#EF4444' }}>
                    {product.isEnabled ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
