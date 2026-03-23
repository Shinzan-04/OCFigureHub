import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useSaved } from '../context/SavedContext';
import { ProductCard } from '../components/ProductCard';

export function SavedPage() {
  const { savedIds } = useSaved();
  const savedProducts = PRODUCTS.filter((p) => savedIds.includes(p.id));

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-14">
      {/* Header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Heart size={12} />
          Saved Items
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Đã lưu</h1>
        <p className="text-sm" style={{ color: '#A1A1A1' }}>
          {savedProducts.length} items đã lưu
        </p>
      </div>

      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-5 text-center"
          style={{ borderColor: '#262626', backgroundColor: '#111111' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#8B5CF610' }}
          >
            <Heart size={36} style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <p className="text-xl font-bold text-white mb-2">Chưa có item nào được lưu</p>
            <p className="text-sm" style={{ color: '#A1A1A1' }}>
              Nhấn vào icon ❤️ trên các sản phẩm để lưu vào danh sách yêu thích
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
          >
            Khám phá ngay
          </Link>
        </div>
      )}
    </div>
  );
}
