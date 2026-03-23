import { useState, useEffect, useCallback } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Product } from '../../types/product';
import { useSaved } from '../context/SavedContext';

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

interface HeroCarouselProps {
  products: Product[];
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { toggleSaved, isSaved } = useSaved();

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + products.length) % products.length);
  }, [products.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % products.length);
  }, [products.length]);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next]);

  if (!products.length) return null;

  return (
    <div className="relative w-full h-full flex flex-col gap-4">
      {/* Cards */}
      <div className="relative flex items-center justify-center overflow-hidden h-[420px] md:h-[460px]">
        {products.map((product, idx) => {
          const offset = idx - current;
          const isCurrent = offset === 0;
          const isPrev = offset === -1 || (current === 0 && idx === products.length - 1);
          const isNext = offset === 1 || (current === products.length - 1 && idx === 0);

          let translateX = '0%';
          let scale = 1;
          let opacity = 0;
          let zIndex = 0;

          if (isCurrent) { translateX = '0%'; scale = 1; opacity = 1; zIndex = 10; }
          else if (isPrev) { translateX = '-75%'; scale = 0.82; opacity = 0.5; zIndex = 5; }
          else if (isNext) { translateX = '75%'; scale = 0.82; opacity = 0.5; zIndex = 5; }

          const isFree = product.price === 0;

          return (
            <div
              key={product.id}
              className="absolute w-[75%] md:w-[68%] transition-all duration-500 ease-in-out cursor-pointer"
              style={{ transform: `translateX(${translateX}) scale(${scale})`, opacity, zIndex }}
              onClick={() => {
                if (isCurrent) navigate(`/product/${product.id}`);
                else if (isPrev) prev();
                else if (isNext) next();
              }}
            >
              <div className="rounded-2xl overflow-hidden border relative" style={{ backgroundColor: '#111111', borderColor: '#262626' }}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {/* Media Content */}
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-6xl font-black"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                        color: '#8B5CF630',
                      }}
                    >
                      {product.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                    >
                      Featured
                    </span>
                  </div>

                  {/* Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSaved(product.id); }}
                    className="absolute top-3 right-3 p-2 rounded-full transition-all duration-200"
                    style={{ backgroundColor: isSaved(product.id) ? '#8B5CF6' : 'rgba(0,0,0,0.6)' }}
                  >
                    <Heart size={16} fill={isSaved(product.id) ? 'white' : 'none'} className="text-white" />
                  </button>

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ backgroundColor: '#262626', color: '#A1A1A1' }}>
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                    <span className="text-sm font-bold" style={{ color: isFree ? '#10B981' : '#8B5CF6' }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prev} className="p-2 rounded-full border transition-colors duration-200 hover:border-[#8B5CF6]" style={{ borderColor: '#262626', color: '#A1A1A1' }}>
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className="rounded-full transition-all duration-300"
              style={{ width: idx === current ? '24px' : '8px', height: '8px', backgroundColor: idx === current ? '#8B5CF6' : '#262626' }}
            />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full border transition-colors duration-200 hover:border-[#8B5CF6]" style={{ borderColor: '#262626', color: '#A1A1A1' }}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
