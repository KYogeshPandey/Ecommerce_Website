import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Package, 
  ShoppingBag, 
  Heart 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const { getTotalCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('B-402, Cyber Heights, Bandra West, Mumbai 400050');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          My Account
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Manage your personal details, delivery preferences, and security settings.
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Link
          to="/orders"
          className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Orders Placed</span>
            <h3 className="text-lg font-bold text-white font-heading">View History</h3>
          </div>
        </Link>

        <Link
          to="/cart"
          className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Cart</span>
            <h3 className="text-lg font-bold text-white font-heading">{getTotalCount()} Items</h3>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-colors flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Saved Items</span>
            <h3 className="text-lg font-bold text-white font-heading">{wishlistItems.length} Products</h3>
          </div>
        </Link>
      </div>

      {/* Profile Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white uppercase shadow-lg shadow-cyan-500/20">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">{user?.name || 'Account User'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'user@shopease.com'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
              {user?.role || 'Buyer'}
            </span>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> Profile details saved successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-cyan-500/50"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || 'user@shopease.com'}
                  disabled
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 pl-10 text-slate-400 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Contact Phone</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-cyan-500/50"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Default Shipping Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-cyan-500/50"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
