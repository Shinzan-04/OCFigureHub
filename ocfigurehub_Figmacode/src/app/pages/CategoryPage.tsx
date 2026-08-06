import { useLocation } from 'react-router';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { SkeletonProductCard } from '../components/SkeletonProductCard';

const CATEGORY_CONFIG: Record<string, { title: string; subtitle: string; emoji: string }> = {
  free: {
    title: 'Free',
    subtitle: 'Explore completely free 3D models for the community',
    emoji: '🎁',
  },
  anime: {
    title: 'Anime',
    subtitle: 'A collection of 3D anime character models from famous series',
    emoji: '⚡',
  },
  monsters: {
    title: 'Monsters',
    subtitle: 'A collection of unique monsters and mythical creatures',
    emoji: '👾',
  },
};

export function CategoryPage() {
  const location = useLocation();
  const category = location.pathname.replace('/', '') as 'free' | 'anime' | 'monsters';
  
  const config = CATEGORY_CONFIG[category] ?? {
    title: 'Category',
    subtitle: 'Explore 3D models',
    emoji: '📦',
  };

  // Fetch from real API
  const { data, isLoading } = useProducts({
    category: category === 'free' ? undefined : category,
    maxPrice: category === 'free' ? 0 : undefined,
    pageSize: 50 // Show many on category pages
  });

  const products = data?.items || [];

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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
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
          <p className="text-lg font-semibold text-white">No products found</p>
          <p className="text-sm" style={{ color: '#A1A1A1' }}>
            This category is currently being updated. Please come back later!
          </p>
        </div>
      )}
    </div>
  );
}
