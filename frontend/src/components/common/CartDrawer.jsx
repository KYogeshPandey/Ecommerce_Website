import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export const CartDrawer = () => {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const freeShippingThreshold = 15000; // in INR / or currency units
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-obsidian-900/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Shopping Cart</h3>
                  <p className="text-xs text-slate-400">{items.length} {items.length === 1 ? 'item' : 'items'} in cart</p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-3 bg-obsidian-950/60 border-b border-white/5">
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-400 font-semibold">🎉 You unlocked Free Express Shipping!</span>
                  ) : (
                    <span>Add ₹{(freeShippingThreshold - subtotal).toLocaleString()} more for Free Shipping</span>
                  )}
                </span>
                <span className="text-cyan-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Drawer Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-white font-semibold text-base mb-1">Your cart is empty</h4>
                  <p className="text-slate-400 text-xs max-w-xs mb-6">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button
                    onClick={() => {
                      closeDrawer();
                      navigate('/shop');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 font-medium text-sm transition-all"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const id = item.product._id || item.product.id;
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/20 transition-colors"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                        alt={item.product.title}
                        className="w-20 h-20 rounded-lg object-cover bg-obsidian-950 border border-white/5 flex-shrink-0"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-medium text-white truncate hover:text-cyan-400 transition-colors">
                              <Link to={`/product/${id}`} onClick={closeDrawer}>
                                {item.product.title}
                              </Link>
                            </h4>
                            <button
                              onClick={() => removeItem(id)}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              title="Remove item"
                              aria-label={`Remove ${item.product.title} from cart`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{item.product.category || 'Gear'}</p>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-white/10 rounded-lg bg-obsidian-950/80">
                            <button
                              onClick={() => updateQuantity(id, item.quantity - 1)}
                              className="p-1.5 text-slate-400 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(id, item.quantity + 1)}
                              className="p-1.5 text-slate-400 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-sm font-bold text-cyan-400">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-obsidian-950/90 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-medium">
                      {subtotal >= freeShippingThreshold ? 'FREE' : '₹199'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-cyan-400 text-lg">
                      ₹{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 199)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      closeDrawer();
                      navigate('/cart');
                    }}
                    className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors text-center"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
