import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters State
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [priceRange, setPriceRange] = useState(50000);
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Electronics', 'Fashion', 'Home'];

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        let queryUrl = '/api/products?';
        if (selectedCategory && selectedCategory !== 'All') {
          queryUrl += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        if (searchQuery.trim()) {
          queryUrl += `search=${encodeURIComponent(searchQuery.trim())}&`;
        }
        if (priceRange) {
          queryUrl += `maxPrice=${priceRange}&`;
        }
        if (sortBy) {
          queryUrl += `sort=${sortBy}&`;
        }

        const data = await api.get(queryUrl);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange(50000);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" /> Full Catalog & Department
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Showing {products.length} {products.length === 1 ? 'item' : 'items'}
              {searchQuery && <span> matching "<span className="text-cyan-400">{searchQuery}</span>"</span>}
            </p>
          </div>

          {/* Controls: Search, Sort, Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-obsidian-900 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-medium"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block glass-panel p-6 rounded-3xl border border-white/10 space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Filter By
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Search inside filter */}
          <div>
            <label htmlFor="shop-keyword-search" className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Keyword
            </label>
            <div className="relative">
              <input
                id="shop-keyword-search"
                name="keyword"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Filter products by keyword"
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
            </div>
          </div>

          {/* Categories List */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Categories
            </label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider">Max Price</span>
              <span className="font-bold text-cyan-400">₹{priceRange.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="glass-card rounded-2xl h-80 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">No Products Found</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                No products match the selected filters or keyword. Try resetting your search or adjusting the price filter.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-obsidian-950 font-semibold text-xs border border-cyan-500/40 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-obsidian-950 border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-heading font-bold text-white text-lg">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Category
                </label>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        handleCategorySelect(cat);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">Max Price</span>
                  <span className="font-bold text-cyan-400">₹{priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 font-semibold text-xs border border-white/10"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
