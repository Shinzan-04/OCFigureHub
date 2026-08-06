import { useEffect } from 'react';
import { Link } from 'react-router';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { useSavedStore } from '../../store/savedStore';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../../types/product';

function savedItemToProduct(item: ReturnType<typeof useSavedStore.getState>['savedItems'][number]): Product {
  return {
    id: item.productId,
    name: item.productName,
    category: item.category,
    creator: item.creator,
    price: item.price,
    thumbnailUrl: item.thumbnailUrl,
    previewModelUrl: item.previewModelUrl,
    isPro: item.isPro,
    isEnabled: true,
    tags: '',
    license: item.license,
  };
}

export function SavedPage() {
  const { savedItems, isLoading, isLoaded, fetchSaved, removeItem } = useSavedStore();

  useEffect(() => {
    if (!isLoaded) {
      fetchSaved();
    }
  }, [isLoaded, fetchSaved]);

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeItem(productId);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14">
      {/* Header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Heart size={12} />
          Saved Items
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2">Saved</h1>
        <p className="text-sm" style={{ color: '#A1A1A1' }}>
          {isLoading ? 'Loading...' : `${savedItems.length} saved items`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin" style={{ color: '#8B5CF6' }} />
          <p className="text-sm" style={{ color: '#A1A1AA' }}>Loading your saved items...</p>
        </div>
      ) : savedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {savedItems.map((item) => (
            <ProductCard
              key={item.productId}
              product={savedItemToProduct(item)}
              actionNode={
                <button
                  onClick={(e) => handleRemove(item.productId, e)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-red-500/80"
                  style={{ backgroundColor: 'rgba(239,68,68,0.7)', backdropFilter: 'blur(4px)' }}
                  title="Remove from saved items"
                >
                  <Trash2 size={14} className="text-white sm:w-4 sm:h-4" />
                </button>
              }
            />
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
            <p className="text-xl font-bold text-white mb-2">No saved items yet</p>
            <p className="text-sm" style={{ color: '#A1A1A1' }}>
              Click the heart icon on products to save them to your favorites list
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
          >
            Explore now
          </Link>
        </div>
      )}
    </div>
  );
}
