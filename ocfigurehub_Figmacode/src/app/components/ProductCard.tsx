import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Product } from '../../types/product';
import { useSaved } from '../context/SavedContext';

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const navigate = useNavigate();
  const { toggleSaved, isSaved } = useSaved();
  const saved = isSaved(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved(product.id);
  };

  const isFree = product.price === 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 hover:border-[#8B5CF6] hover:scale-[1.02]"
      style={{ backgroundColor: '#111111', borderColor: '#262626' }}
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-black">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl font-black"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
              color: '#8B5CF640',
            }}
          >
            {product.name.charAt(0)}
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isFree && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: '#10B981', color: '#fff' }}
            >
              Free
            </span>
          )}
        </div>

        {/* Heart */}
        <button
          onClick={handleHeartClick}
          className="absolute top-3 right-3 p-2 rounded-full transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: saved ? '#8B5CF6' : 'rgba(0,0,0,0.6)' }}
        >
          <Heart size={16} fill={saved ? 'white' : 'none'} className="text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ backgroundColor: '#262626', color: '#A1A1A1' }}>
            {product.category}
          </span>
        </div>
        <h3 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: '#FFFFFF' }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold" style={{ color: isFree ? '#10B981' : '#FFFFFF' }}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

export { formatPrice };
