import { useLocation } from 'react-router';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

const CATEGORY_CONFIG: Record<string, { title: string; subtitle: string; emoji: string }> = {
  free: {
    title: 'Miễn phí',
    subtitle: 'Khám phá các file mô hình 3D hoàn toàn miễn phí dành cho cộng đồng',
    emoji: '🎁',
  },
  anime: {
    title: 'Anime',
    subtitle: 'Bộ sưu tập file mô hình 3D nhân vật anime từ nhiều series nổi tiếng',
    emoji: '⚡',
  },
  monsters: {
    title: 'Monsters',
    subtitle: 'Bộ sưu tập các mô hình quái vật, sinh vật huyền thoại độc đáo',
    emoji: '👾',
  },
};

export function CategoryPage() {
  const location = useLocation();
  const category = location.pathname.replace('/', '') as 'free' | 'anime' | 'monsters';
  const config = CATEGORY_CONFIG[category] ?? {
    title: 'Danh mục',
    subtitle: 'Khám phá các mô hình 3D',
    emoji: '📦',
  };

  const products = PRODUCTS.filter((p) => {
    if (category === 'free') return p.isFree;
    return p.category === category;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-14">
      {/* Header */}
      <div className="mb-10 md:mb-14">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <span>{config.emoji}</span>
          Category
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
          {config.title}
        </h1>
        <p className="text-base md:text-lg" style={{ color: '#A1A1A1' }}>
          {config.subtitle}
        </p>
        <p className="text-sm mt-2" style={{ color: '#A1A1A1' }}>
          {products.length} models
        </p>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-4 text-center"
          style={{ borderColor: '#262626', backgroundColor: '#111111' }}
        >
          <span className="text-5xl">{config.emoji}</span>
          <p className="text-lg font-semibold text-white">Chưa có sản phẩm nào</p>
          <p className="text-sm" style={{ color: '#A1A1A1' }}>
            Danh mục này đang được cập nhật. Vui lòng quay lại sau!
          </p>
        </div>
      )}
    </div>
  );
}
