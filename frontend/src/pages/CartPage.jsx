import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Tag, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const subtotal = getTotalPrice();
  const discountAmount = (subtotal * discountPercent) / 100;
  const freeShippingThreshold = 15000;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 199;
  const total = subtotal - discountAmount + shipping;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const code = promoCode.trim().toUpperCase();
    if (code === 'CYBER20') {
      setDiscountPercent(20);
      setPromoSuccess('20% Cyber Discount Applied!');
    } else if (code === 'SAVE10') {
      setDiscountPercent(10);
      setPromoSuccess('10% VIP Discount Applied!');
    } else {
      setPromoError('Invalid coupon code. Try CYBER20 or SAVE10');
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-12 sm:p-16 rounded-3xl text-center max-w-xl mx-auto border border-white/10 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white font-heading">Your Cart is Empty</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Explore our curated catalog of next-generation tech, audio gear, and lifestyle essentials.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Order Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Shopping Cart ({items.length})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Table */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {items.map((item) => {
              const id = item.product._id || item.product.id;
              const unitPrice = item.product.price || 0;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  {/* Item Image & Title */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                      alt={item.product.title}
                      className="w-20 h-20 rounded-xl object-cover bg-obsidian-950 border border-white/5 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white hover:text-cyan-400 transition-colors truncate">
                        <Link to={`/product/${id}`}>
                          {item.product.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.product.category || 'Gear'}</p>
                      <p className="text-xs font-semibold text-cyan-400 sm:hidden mt-1">
                        ₹{unitPrice.toLocaleString()} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0">
                    {/* Stepper */}
                    <div className="flex items-center border border-white/10 rounded-xl bg-obsidian-900">
                      <button
                        onClick={() => updateQuantity(id, item.quantity - 1)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(id, item.quantity + 1)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Total Price for item */}
                    <div className="text-right min-w-[90px]">
                      <div className="text-sm sm:text-base font-bold text-cyan-400 font-heading">
                        ₹{itemTotal.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 hidden sm:block">
                        ₹{unitPrice.toLocaleString()} ea
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove product"
                      aria-label={`Remove ${item.product.title} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. CYBER20"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  Apply
                </button>
              </div>

              {promoSuccess && (
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {promoSuccess}
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {promoError}
                </p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline font-bold text-white">
                <span className="text-base">Grand Total</span>
                <span className="text-2xl font-black text-cyan-400 font-heading">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
