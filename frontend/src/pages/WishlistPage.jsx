import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { ProductCard } from '../components/common/ProductCard';

export const WishlistPage = () => {
  const { items, clearWishlist } = useWishlistStore();
  const { addItem, openDrawer } = useCartStore();

  const handleMoveAllToCart = () => {
    items.forEach((item) => addItem(item, 1));
    openDrawer();
  };

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 max-w-xl mx-auto px-4 text-center">
        <div className="glass-panel p-12 rounded-3xl border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white font-heading">Your Wishlist is Empty</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Save items you love by tapping the heart icon on any product card.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              Explore Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Personal Collection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            My Wishlist ({items.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMoveAllToCart}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-obsidian-950 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> Move All to Cart
          </button>
          <button
            onClick={clearWishlist}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
