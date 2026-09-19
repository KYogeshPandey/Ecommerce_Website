import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Check, 
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);

  const { addItem, openDrawer } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/api/products/${id}`);
        setProduct(data);

        // Fetch related products in category
        const all = await api.get('/api/products');
        const related = all.filter(p => (p._id || p.id) !== id && p.category === data.category);
        setRelatedProducts(related.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="glass-card aspect-square rounded-3xl animate-pulse bg-white/5" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-6 w-1/4 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-slate-400 text-xs">The requested product could not be located.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs">
          Browse Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id || product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-white transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-cyan-400 truncate max-w-xs font-medium">{product.title}</span>
      </nav>

      {/* Main Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Media Gallery */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 aspect-square bg-obsidian-950 relative group">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
              alt={product.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg bg-obsidian-950/80 backdrop-blur-md border border-cyan-500/30 text-xs font-bold text-cyan-300">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">{product.rating || 4.8}</span>
                <span className="text-slate-400">({product.numReviews || 128} reviews)</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock ({product.stock || 25} available)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-heading tracking-tight">
              {product.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-black text-cyan-400 font-heading">
                ₹{(product.price || 0).toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 line-through">
                ₹{Math.round((product.price || 0) * 1.25).toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                20% OFF
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            {product.description || 'High precision craftsmanship designed for optimal ergonomic comfort and durable performance.'}
          </p>

          {/* Quantity & Actions Bar */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-white/10 rounded-xl bg-obsidian-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  added
                    ? 'bg-emerald-500 text-obsidian-950 font-bold'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-colors"
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-400'
                }`}
                aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Micro Value Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Fast Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>30 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details Tabs */}
      <div className="mt-16 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex border-b border-white/10 gap-6 text-sm font-semibold pb-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`transition-colors pb-1 relative ${
              activeTab === 'description' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Description
            {activeTab === 'description' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`transition-colors pb-1 relative ${
              activeTab === 'specs' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Specifications
            {activeTab === 'specs' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`transition-colors pb-1 relative ${
              activeTab === 'reviews' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Reviews ({product.numReviews || 12})
            {activeTab === 'reviews' && (
              <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        </div>

        <div className="pt-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <p>
                Engineered with high grade aerospace-grade composites and precision internals to deliver uninterrupted reliability. Backed by the ShopEase Quality Guarantee.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Category</span>
                <span className="text-white font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Stock Availability</span>
                <span className="text-emerald-400 font-medium">{product.stock || 20} In Stock</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Warranty</span>
                <span className="text-white font-medium">24 Months Manufacturer</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Origin</span>
                <span className="text-white font-medium">Certified Genuine</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Rohit M.</span>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>
                <p className="text-slate-400 text-xs">
                  "Exceeded my expectations! Build quality feels ultra premium and shipping arrived in under 36 hours."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Pooja S.</span>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>
                <p className="text-slate-400 text-xs">
                  "The glassmorphic design and the product in person look stunning. Highly recommended."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-black text-white font-heading mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id || item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
