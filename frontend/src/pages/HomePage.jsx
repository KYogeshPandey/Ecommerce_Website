import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  ChevronRight, 
  Flame, 
  Star,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';

export const HomePage = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/api/products');
        setTrendingProducts(data.slice(0, 4));
      } catch (err) {
        console.warn('Using default featured items:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    {
      name: 'Electronics & Audio',
      slug: 'Electronics',
      count: '24+ Items',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      gradient: 'from-cyan-500/20 to-indigo-600/20',
    },
    {
      name: 'Apparel & Lifestyle',
      slug: 'Fashion',
      count: '48+ Items',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      gradient: 'from-purple-500/20 to-pink-600/20',
    },
    {
      name: 'Smart Home & Living',
      slug: 'Home',
      count: '18+ Items',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      gradient: 'from-emerald-500/20 to-teal-600/20',
    },
    {
      name: 'Footwear & Athletic',
      slug: 'Fashion',
      count: '32+ Items',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      gradient: 'from-amber-500/20 to-rose-600/20',
    },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase shadow-sm shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                YOUR ONE-STOP ONLINE STORE
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight leading-[1.1]"
              >
                Better Products. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  A Smoother Shopping Experience.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Discover top products, great deals and a seamless shopping experience — all in one place. Shop smart, find what you need, and enjoy reliable delivery.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#categories"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 text-white font-semibold text-sm transition-all text-center"
                >
                  Browse Categories
                </a>
              </motion.div>

              {/* Micro Stats / Benefits */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0"
              >
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white font-heading">Free Shipping</h4>
                  <p className="text-xs text-slate-400 mt-0.5">On orders over ₹999</p>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-cyan-400 font-heading">Secure Payments</h4>
                  <p className="text-xs text-slate-400 mt-0.5">100% safe & reliable</p>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-indigo-400 font-heading">24/7 Support</h4>
                  <p className="text-xs text-slate-400 mt-0.5">We're here for you</p>
                </div>
              </motion.div>
            </div>

            {/* Right Hero Showcase Card (Fixed bounds, no mobile overflow) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
              >
                {/* 3D Glass Hero Showcase */}
                <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-obsidian-950/80 mb-5">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
                      alt="Featured Headphones"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-80" />

                    {/* Contained Glass Badges */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-lg bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-xs font-bold text-cyan-300 shadow-md">
                        BEST SELLER
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">AUDIO</p>
                          <h3 className="text-lg font-bold text-white font-heading">Quantum ANC Studio</h3>
                          <p className="text-xs text-slate-300 mt-0.5">Immersive sound. Zero distractions.</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-black text-cyan-400 font-heading block">₹14,999</span>
                          <span className="text-xs text-slate-500 line-through">₹19,999</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-white">4.9</span>
                      <span className="text-slate-400">(420 reviews)</span>
                    </div>
                    <Link
                      to="/shop?category=Electronics"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-obsidian-950 text-xs font-semibold transition-all border border-cyan-500/30"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">Free Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Free on orders above ₹15,000 across India.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">2-Year Warranty</h4>
              <p className="text-xs text-slate-400 mt-1">Full replacement on verified hardware faults.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">Razorpay & UPI</h4>
              <p className="text-xs text-slate-400 mt-1">Instant 1-click checkout with fraud protection.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-colors flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">24/7 Customer Care</h4>
              <p className="text-xs text-slate-400 mt-1">Friendly support team available anytime you need help.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BROWSE BY CATEGORY */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Popular Categories
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            Explore All Categories <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${cat.slug}`}
              className="group relative h-72 rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 flex flex-col justify-end transition-all hover:border-cyan-500/40 hover:-translate-y-1.5"
            >
              {/* Image Background */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent ${cat.gradient}`} />

              <div className="relative z-10 space-y-1">
                <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                  {cat.count}
                </span>
                <h3 className="text-xl font-bold text-white font-heading group-hover:text-cyan-400 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" /> Customer Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Trending Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            Explore All Products <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl h-80 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. PROMOTIONAL FEATURE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/70 via-obsidian-950/90 to-indigo-950/70" />
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
              Special Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Upgrade Your Audio Experience Today.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Immerse yourself in crystal-clear sound with advanced noise cancellation and all-day battery life. Shop top-rated audio gear at unbeatable prices.
            </p>
            <div className="pt-2">
              <Link
                to="/shop?category=Electronics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-obsidian-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-400/25"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
