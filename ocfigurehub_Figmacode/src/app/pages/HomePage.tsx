import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ChevronLeft, ChevronRight, X, ArrowUpDown, Check, SlidersHorizontal, ChevronUp } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { SkeletonProductCard } from '../components/SkeletonProductCard';
import { EmptyState } from '../components/EmptyState';
import type { ProductQueryParams } from '../../types/pagination';
import { statsApi, type PlatformStats } from '../../api/stats';
import Hero3D from '../components/Hero3D';

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const pageSize = 12;

  const activeFilterCount = [
    priceRange !== 'all' ? 1 : 0,
    format !== '' ? 1 : 0,
    license !== '' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Close popovers on outside click
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch platform stats
  useEffect(() => {
    statsApi.getPlatformStats().then(setPlatformStats).catch(console.error);
  }, []);

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
    <div className="relative w-full min-h-screen overflow-hidden" style={{ backgroundColor: '#050505' }}>
      
      {/* 
        Thẻ bọc này CHUẨN XÁC bằng 1 màn hình (h-screen). 
        Tất cả các Canvas bên trong sẽ dùng nó làm eventSource để không bị lệch trục Y khi cuộn trang.
        ĐỒNG THỜI nó cũng ôm trọn phần Chữ phía trên, để sự kiện rê chuột vào chữ vẫn được lọt xuống ngân hà.
      */}
      <div id="hero-event-source" className="relative w-full h-screen z-0">
        {/* Dark gradient background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse at 60% 40%, #1a1a2e 0%, #0a0a0a 50%, #050505 100%)',
          }}
        />
        
        {/* Background 3D Model - Đặt trong hộp 1440px để cân bằng tuyệt đối với chữ */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="max-w-[1440px] w-full h-full mx-auto relative flex items-center">
            {/* Dùng opacity-100 để không bị nhìn xuyên thấu, và z-[5] để đè lên dải ngân hà */}
            <div className="absolute right-0 w-full lg:w-[60%] h-full opacity-40 lg:opacity-100 z-[5] transition-opacity duration-500 -mt-20">
              <Hero3D />
            </div>
          </div>
        </div>

        {/* Main Foreground Content */}
        <div className="relative z-10 w-full h-full pointer-events-none">
          {/* Hero Section */}
          <section className="max-w-[1440px] w-full mx-auto px-6 md:px-12 lg:px-20 xl:px-24 relative h-full flex items-center">
        {/* Dùng -mt-20 cố định để không bị giật khi kéo cửa sổ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 w-full -mt-20">
          
          {/* Left */}
          <div className="flex flex-col gap-6 lg:gap-8 pointer-events-auto relative z-10">
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
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
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
                { value: platformStats ? `${platformStats.models}+` : `${totalItems}+`, label: 'Models' },
                { value: platformStats ? `${platformStats.creators}+` : '120+', label: 'Creators' },
                { value: platformStats ? (platformStats.downloads >= 1000 ? `${Math.floor(platformStats.downloads / 1000)}K+` : `${platformStats.downloads}+`) : '50K+', label: 'Downloads' },
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

          {/* Right - Model 3D (Đã được chuyển xuống làm background để có thể tương tác) */}
          <div className="w-full hidden lg:block pointer-events-none">
            {/* Giữ nguyên div rỗng này để giữ cấu trúc grid 2 cột cho phần text bên trái */}
          </div>
        </div>
      </section>
      </div> {/* Kết thúc thẻ Main Foreground Content */}
      </div> {/* Kết thúc thẻ hero-event-source */}

      {/* Divider */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 pointer-events-auto">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* ======================== FILTERS BAR ======================== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pointer-events-auto py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">

          {/* Category chips – horizontal scroll on mobile */}
          <div className="flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto overflow-x-auto scrollbar-hide" style={{ borderColor: '#262626', backgroundColor: '#0d0d0d' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setCategory(cat.key); handleFilterChange(); }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
                style={{
                  backgroundColor: category === cat.key ? '#8B5CF6' : 'transparent',
                  color: category === cat.key ? '#FFFFFF' : '#A1A1AA',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filters + Sort + Clear — right side */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Filters */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150"
                style={{
                  backgroundColor: filterOpen ? '#8B5CF620' : '#0d0d0d',
                  borderColor: filterOpen || activeFilterCount > 0 ? '#8B5CF6' : '#262626',
                  color: activeFilterCount > 0 ? '#FFFFFF' : '#A1A1AA',
                }}
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="px-2 rounded-full text-xs font-bold leading-none" style={{ backgroundColor: '#8B5CF6', color: '#fff', minWidth: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: '#111111', borderColor: '#262626' }}>
                  <div className="p-5 space-y-5">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#6b7280' }}>Price</div>
                      <div className="flex flex-wrap gap-2">
                        {PRICE_RANGES.map((opt) => (
                          <button key={opt.key} onClick={() => { setPriceRange(opt.key); handleFilterChange(); }}
                            className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150"
                            style={{ backgroundColor: priceRange === opt.key ? '#8B5CF6' : 'transparent', borderColor: priceRange === opt.key ? '#8B5CF6' : '#333333', color: priceRange === opt.key ? '#fff' : '#a1a1aa' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#6b7280' }}>Format</div>
                      <div className="flex flex-wrap gap-2">
                        {FORMATS.map((opt) => (
                          <button key={opt.key} onClick={() => { setFormat(opt.key); handleFilterChange(); }}
                            className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150"
                            style={{ backgroundColor: format === opt.key ? '#8B5CF6' : 'transparent', borderColor: format === opt.key ? '#8B5CF6' : '#333333', color: format === opt.key ? '#fff' : '#a1a1aa' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#6b7280' }}>License</div>
                      <div className="flex flex-wrap gap-2">
                        {LICENSE_OPTIONS.map((opt) => (
                          <button key={opt.key} onClick={() => { setLicense(opt.key); handleFilterChange(); }}
                            className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150"
                            style={{ backgroundColor: license === opt.key ? '#8B5CF6' : 'transparent', borderColor: license === opt.key ? '#8B5CF6' : '#333333', color: license === opt.key ? '#fff' : '#a1a1aa' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: '#1f1f1f' }}>
                    <span className="text-sm" style={{ color: '#a1a1aa' }}>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
                    <button onClick={() => { setPriceRange('all'); setFormat(''); setLicense(''); handleFilterChange(); }} className="text-sm font-medium transition-colors hover:underline" style={{ color: '#8B5CF6' }}>Reset all</button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150"
                style={{
                  backgroundColor: sortOpen ? '#8B5CF620' : '#0d0d0d',
                  borderColor: sortOpen ? '#8B5CF6' : '#262626',
                  color: '#FFFFFF',
                }}
              >
                <ArrowUpDown size={15} style={{ color: '#A1A1AA' }} />
                <span style={{ color: '#A1A1AA' }}>Sort:</span>
                <span>{SORT_OPTIONS.find(s => s.key === sort)?.label}</span>
              </button>

              {sortOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 sm:w-60 rounded-2xl border shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: '#111111', borderColor: '#262626' }}>
                  <div className="p-1.5">
                    {SORT_OPTIONS.map((s) => (
                      <button key={s.key} onClick={() => { setSort(s.key); setSortOpen(false); handleFilterChange(); }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                        style={{ backgroundColor: sort === s.key ? '#8B5CF620' : 'transparent', color: sort === s.key ? '#fff' : '#a1a1aa' }}
                        onMouseEnter={(e) => { if (sort !== s.key) e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                        onMouseLeave={(e) => { if (sort !== s.key) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                        {s.label}
                        {sort === s.key && <Check size={15} style={{ color: '#8B5CF6' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <button onClick={handleClearFilters} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:text-red-400" style={{ color: '#A1A1AA' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 pointer-events-auto">
        {/* Section header */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
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
