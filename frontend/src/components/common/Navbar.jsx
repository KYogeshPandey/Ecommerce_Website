import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  Package, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { openDrawer, getTotalCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const cartCount = getTotalCount();
  const wishlistCount = wishlistItems.length;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-navbar py-3 shadow-lg shadow-black/40'
            : 'bg-gradient-to-b from-obsidian-950/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* 1. Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="w-full h-full bg-obsidian-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                Shop<span className="text-cyan-400">Ease</span>
              </span>
            </Link>

            {/* 2. Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link
                to="/"
                className={`transition-colors hover:text-cyan-400 ${
                  location.pathname === '/' && !location.hash ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`transition-colors hover:text-cyan-400 ${
                  location.pathname === '/shop' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                Shop
              </Link>
              <a
                href="/#categories"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
              >
                Categories
              </a>
              <a
                href="/#about"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
              >
                About
              </a>
              <a
                href="/#contact"
                className="text-slate-300 hover:text-cyan-400 transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* 3. Search Bar (Desktop) */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
                <input
                  id="desktop-search"
                  name="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands..."
                  aria-label="Search for products, brands"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" aria-hidden="true" />
              </form>
            </div>

            {/* 4. Action Icons: Wishlist, Cart, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-slate-300 hover:text-cyan-400 lg:hidden rounded-lg hover:bg-white/5 transition-colors"
                aria-label={searchOpen ? "Close mobile search" : "Open mobile search"}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="p-2 text-slate-300 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors relative"
                aria-label={`View wishlist (${wishlistCount} items)`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openDrawer}
                className="p-2 text-slate-300 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-colors relative group"
                aria-label={`Open shopping cart (${cartCount} items)`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Dropdown / Auth CTA */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-slate-900/60 hover:border-cyan-500/40 transition-all text-xs text-white"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white uppercase text-xs">
                      {user?.name ? user.name[0] : 'U'}
                    </div>
                    <span className="hidden sm:inline font-medium truncate max-w-[90px]">
                      {user?.name || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-obsidian-900 border border-white/10 shadow-2xl backdrop-blur-2xl py-2 z-50 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-medium uppercase tracking-wider border border-cyan-500/20">
                          {user?.role || 'Buyer'}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-cyan-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Package className="w-4 h-4 text-indigo-400" />
                          Order History
                        </Link>
                        {isAdmin() && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors font-medium"
                          >
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className={
                      location.pathname === '/login'
                        ? 'px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 transition-all'
                        : 'px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all'
                    }
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className={`hidden sm:inline-flex ${
                      location.pathname === '/login'
                        ? 'px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all'
                        : 'px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 transition-all'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white md:hidden rounded-lg hover:bg-white/5 transition-colors"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Dropdown */}
          {searchOpen && (
            <div className="pt-3 pb-2 lg:hidden">
              <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
                <input
                  id="mobile-search"
                  name="mobile-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands..."
                  aria-label="Search for products, brands"
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-2.5" aria-hidden="true" />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 font-medium"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 font-medium"
            >
              Shop
            </Link>
            <a
              href="/#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 font-medium"
            >
              Categories
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 font-medium"
            >
              About
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 font-medium"
            >
              Contact
            </a>
            {!isAuthenticated && (
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <Link
                  to="/login"
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/login'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/login'
                      ? 'bg-white/5 text-slate-300 border border-white/10 hover:text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
