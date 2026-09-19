import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export const ProductCard = ({ product }) => {
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const id = product._id || product.id;
  const isWishlisted = isInWishlist(id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const rating = product.rating || 4.7;
  const reviews = product.numReviews || 24;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col group relative"
    >
      {/* 1. Image Container */}
      <Link to={`/product/${id}`} className="relative aspect-square overflow-hidden bg-obsidian-950 block">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badge (Featured / Category) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className="px-2.5 py-1 rounded-md bg-obsidian-900/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-wider uppercase text-cyan-300">
            {product.category || 'Gear'}
          </span>
          {product.featured && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-indigo-500/50">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
              : 'bg-obsidian-900/80 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
          }`}
          aria-label={isWishlisted ? `Remove ${product.title} from Wishlist` : `Add ${product.title} to Wishlist`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </Link>

      {/* 2. Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-200">{rating}</span>
            <span className="text-slate-500 text-[11px]">({reviews})</span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            <Link to={`/product/${id}`}>
              {product.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">
            {product.description || 'Premium craftsmanship with modern functionality.'}
          </p>
        </div>

        {/* 3. Bottom Row: Price & Add to Cart */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 mt-auto">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-base sm:text-lg font-bold text-cyan-400 font-heading">
              ₹{(product.price || 0).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={added}
            aria-label={added ? `Added ${product.title} to cart` : `Add ${product.title} to cart`}
            className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              added
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-indigo-600 border border-cyan-500/30 text-cyan-300 hover:text-white hover:shadow-cyan-500/25'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
