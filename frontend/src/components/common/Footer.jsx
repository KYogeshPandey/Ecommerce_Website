import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Check } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-obsidian-950 border-t border-white/10 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Value Badges Bar */}
      <div className="border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Free Express Delivery</h4>
                <p className="text-xs text-slate-400">On all orders over ₹15,000</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Secure Payments</h4>
                <p className="text-xs text-slate-400">256-bit SSL encrypted</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">30 Days Return</h4>
                <p className="text-xs text-slate-400">Hassle-free money back</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24/7 Dedicated Support</h4>
                <p className="text-xs text-slate-400">Direct expert assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div id="about" className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
                <div className="w-full h-full bg-obsidian-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-black text-white font-heading">
                Shop<span className="text-cyan-400">Ease</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Your trusted online store for electronics, trendy fashion, home essentials, and everyday lifestyle products. Quality items, competitive prices, and reliable delivery right to your doorstep.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              <p>Shop smart, live better with ShopEase.</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/shop" className="hover:text-cyan-400 transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Electronics" className="hover:text-cyan-400 transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/shop?category=Fashion" className="hover:text-cyan-400 transition-colors">Apparel & Watches</Link></li>
              <li><Link to="/shop?category=Home" className="hover:text-cyan-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/wishlist" className="hover:text-cyan-400 transition-colors">Saved Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div id="contact">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-4">
              Customer Hub
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/orders" className="hover:text-cyan-400 transition-colors">Track Orders</Link></li>
              <li><Link to="/cart" className="hover:text-cyan-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/profile" className="hover:text-cyan-400 transition-colors">My Profile</Link></li>
              <li><span className="text-slate-500 cursor-not-allowed">Shipping Policy</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">Terms & Conditions</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-4">
              Stay Connected
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe for new arrivals, exclusive discounts, and seasonal offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address for newsletter subscription"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  subscribed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-obsidian-950 border border-cyan-500/40'
                }`}
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Subscribed!
                  </>
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShopEase Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
