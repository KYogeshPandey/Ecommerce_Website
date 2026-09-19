import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get('/api/orders/my');
        setOrders(data);
      } catch (err) {
        console.warn('Using sample order records for demo view:', err.message);
        // Default sample orders for presentation
        setOrders([
          {
            _id: 'ORD-78921',
            createdAt: new Date('2025-02-10'),
            status: 'Processing',
            totalAmount: 14999,
            paymentMethod: 'Razorpay',
            shippingAddress: { city: 'Mumbai', address: 'Bandra West' },
            items: [
              {
                product: {
                  title: 'Wireless Noise-Canceling Headphones',
                  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
                  price: 14999
                },
                quantity: 1,
                price: 14999
              }
            ]
          },
          {
            _id: 'ORD-54310',
            createdAt: new Date('2025-01-24'),
            status: 'Delivered',
            totalAmount: 5999,
            paymentMethod: 'COD',
            shippingAddress: { city: 'Bengaluru', address: 'Indiranagar' },
            items: [
              {
                product: {
                  title: 'Minimalist Chronograph Watch',
                  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
                  price: 5999
                },
                quantity: 1,
                price: 5999
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return (order.status || order.orderStatus || '').toLowerCase() === activeTab;
  });

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" /> Fulfillment Center
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          Order History
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Track packages, view receipts, and monitor shipment status.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/10 mb-8 overflow-x-auto max-w-full text-xs font-semibold">
        {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-cyan-500 text-obsidian-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel h-48 rounded-3xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">No Orders Found</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
            You don't have any orders matching the selected status.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const rawItems = order.items || order.products || [];
            return (
              <div
                key={order._id}
                className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">Order #{order._id}</h4>
                        {getStatusBadge(order.status || order.orderStatus)}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-base font-bold text-cyan-400 font-heading">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-3">
                  {rawItems.map((item, idx) => {
                    const prod = item.product || item.productId || {};
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                            alt={prod.title || 'Product'}
                            className="w-12 h-12 rounded-lg object-cover bg-obsidian-950 border border-white/5"
                          />
                          <div>
                            <h5 className="font-semibold text-white">{prod.title || 'Tech Product'}</h5>
                            <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-slate-300 font-medium">
                          ₹{(item.price || prod.price || 0).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom details */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                  <div className="text-slate-400">
                    <span>Payment Method: </span>
                    <span className="text-slate-200 font-medium">{order.paymentMethod || 'COD'}</span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                  >
                    View Shipment Progress <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
