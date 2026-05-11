import { useState, useEffect } from 'react';
import { Search, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { SkeletonProductCard } from '../components/SkeletonProductCard';
import { EmptyState } from '../components/EmptyState';
import type { ProductQueryParams } from '../../types/pagination';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'Anime', label: 'Anime' },
  { key: 'Game', label: 'Game' },
  { key: 'Figure', label: 'Figure' },
  { key: 'Chibi', label: 'Chibi' },
  { key: 'Monster', label: 'Monster' },
  { key: 'Robot', label: 'Robot' },
  { key: 'Weapon', label: 'Weapon' },
  { key: 'Accessory', label: 'Accessory' },
];

const PRICE_RANGES = [
  { key: 'all', label: 'All', min: undefined, max: undefined },
  { key: 'free', label: 'Free', min: 0, max: 0 },
  { key: 'under50k', label: 'Under 50k', min: 0, max: 50000 },
  { key: '50k-200k', label: '50k - 200k', min: 50000, max: 200000 },
  { key: 'over200k', label: 'Over 200k', min: 200000, max: undefined },
];

const FORMATS = [
  { key: '', label: 'All' },
  { key: 'GLB', label: 'GLB' },
  { key: 'GLTF', label: 'GLTF' },
  { key: 'STL', label: 'STL' },
  { key: 'OBJ', label: 'OBJ' },
  { key: 'FBX', label: 'FBX' },
  { key: 'ZIP', label: 'ZIP' },
];

const LICENSE_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'Personal', label: 'Personal' },
  { key: 'Commercial', label: 'Commercial' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'popular', label: 'Popular' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
];

export function HomePage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [format, setFormat] = useState('');
  const [license, setLicense] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Build query params
  const selectedPriceRange = PRICE_RANGES.find((p) => p.key === priceRange);
  const queryParams: ProductQueryParams = {
    search: debouncedSearch || undefined,
    category: category || undefined,
    minPrice: selectedPriceRange?.min,
    maxPrice: selectedPriceRange?.max,
    format: format || undefined,
    license: license || undefined,
    sort,
    page,
    pageSize,
  };

  const { data, isLoading } = useProducts(queryParams);

  const products = data?.items || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.totalItems || 0;

  // Featured products for carousel (first 4 from first page)
  const { data: featuredData } = useProducts({ page: 1, pageSize: 4, sort: 'newest' });
  const featuredProducts = featuredData?.items || [];

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setPriceRange('all');
    setFormat('');
    setLicense('');
    setSort('newest');
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to page 1 when any filter changes
  };

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
                placeholder="Tìm model, nhân vật, tag..."
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
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full transition-colors"
                  style={{ color: '#A1A1A1' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {[
                { value: `${totalItems}+`, label: 'Models' },
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
            {featuredProducts.length > 0 && <HeroCarousel products={featuredProducts} />}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Filters Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col gap-4">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#A1A1A1' }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setCategory(cat.key);
                    handleFilterChange();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200"
                  style={{
                    backgroundColor: category === cat.key ? '#8B5CF6' : '#111111',
                    borderColor: category === cat.key ? '#8B5CF6' : '#262626',
                    color: category === cat.key ? '#FFFFFF' : '#A1A1A1',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price, Format, License, Sort in one row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Price Range */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#A1A1A1' }}>
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all duration-200"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#262626',
                  color: '#FFFFFF',
                }}
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.key} value={pr.key}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#A1A1A1' }}>
                Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all duration-200"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#262626',
                  color: '#FFFFFF',
                }}
              >
                {FORMATS.map((fmt) => (
                  <option key={fmt.key} value={fmt.key}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* License */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#A1A1A1' }}>
                License
              </label>
              <select
                value={license}
                onChange={(e) => {
                  setLicense(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all duration-200"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#262626',
                  color: '#FFFFFF',
                }}
              >
                {LICENSE_OPTIONS.map((lic) => (
                  <option key={lic.key} value={lic.key}>
                    {lic.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#A1A1A1' }}>
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all duration-200"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#262626',
                  color: '#FFFFFF',
                }}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 hover:border-[#8B5CF6]"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#262626',
                  color: '#A1A1A1',
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8 py-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {debouncedSearch ? (
                <>
                  Kết quả cho "<span style={{ color: '#8B5CF6' }}>{debouncedSearch}</span>"
                </>
              ) : category ? (
                `${category} models`
              ) : (
                'All models'
              )}
            </h2>
            <p className="text-sm" style={{ color: '#A1A1A1' }}>
              {isLoading ? 'Đang tải...' : `${totalItems} kết quả`}
            </p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#8B5CF6]"
                  style={{
                    backgroundColor: '#111111',
                    borderColor: '#262626',
                    color: '#FFFFFF',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm" style={{ color: '#A1A1A1' }}>
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#8B5CF6]"
                  style={{
                    backgroundColor: '#111111',
                    borderColor: '#262626',
                    color: '#FFFFFF',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            message={debouncedSearch ? `Không tìm thấy "${debouncedSearch}"` : "Không tìm thấy kết quả"}
            description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
          />
        )}
      </section>
    </div>
  );
}
