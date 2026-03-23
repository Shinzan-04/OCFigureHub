import { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { SkeletonProductCard } from '../components/SkeletonProductCard';
import { EmptyState } from '../components/EmptyState';
import type { Product } from '../../types/product';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'anime', label: 'Anime' },
  { key: 'monsters', label: 'Monsters' },
];

export function HomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { data: products, isLoading } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeCategory === 'all' ||
        (activeCategory === 'free' && p.price === 0) ||
        p.category.toLowerCase() === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory, products]);

  // Use first few products as featured for the carousel
  const featuredProducts = useMemo(() => {
    if (!products) return [];
    return products.slice(0, 4);
  }, [products]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Badge */}
            <div className="flex items-center gap-2 w-fit">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
              >
                <Sparkles size={12} />
                Marketplace 3D Figure hàng đầu Việt Nam
              </div>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-3">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
                style={{ color: '#FFFFFF' }}
              >
                Chào mừng đến với{' '}
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  OC Figure HUB
                </span>
              </h1>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: '#A1A1A1' }}>
                Nâng tầm sáng tạo với kho tàng file mô hình 3D chất lượng cao. Khám phá hàng ngàn thiết kế anime, monsters và nhiều hơn nữa.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: '#A1A1A1' }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm nhân vật, creator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #262626',
                  color: '#FFFFFF',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                onBlur={(e) => (e.target.style.borderColor = '#262626')}
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200"
                  style={{
                    backgroundColor: activeCategory === cat.key ? '#8B5CF6' : '#111111',
                    borderColor: activeCategory === cat.key ? '#8B5CF6' : '#262626',
                    color: activeCategory === cat.key ? '#FFFFFF' : '#A1A1A1',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {[
                { value: `${products?.length || 0}+`, label: 'Models' },
                { value: '120+', label: 'Creators' },
                { value: '50K+', label: 'Downloads' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-black" style={{ color: '#8B5CF6' }}>
                    {stat.value}
                  </span>
                  <span className="text-xs" style={{ color: '#A1A1A1' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Carousel */}
          <div className="w-full">
            {!isLoading && featuredProducts.length > 0 && (
              <HeroCarousel products={featuredProducts} />
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Product Grid */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {activeCategory === 'all' && 'Tất cả models'}
              {activeCategory === 'free' && 'Models miễn phí'}
              {activeCategory === 'anime' && 'Anime figures'}
              {activeCategory === 'monsters' && 'Monster figures'}
            </h2>
            <p className="text-sm" style={{ color: '#A1A1A1' }}>
              {isLoading ? 'Đang tải...' : `${filteredProducts.length} kết quả`}
            </p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="Không tìm thấy kết quả"
            description="Thử tìm kiếm với từ khóa khác"
          />
        )}
      </section>
    </div>
  );
}
