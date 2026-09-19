import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        // Sample order fallback for demo
        setOrder({
          _id: id,
          createdAt: new Date(),
          status: 'Processing',
          totalAmount: 14999,
          paymentMethod: 'Razorpay',
          shippingAddress: {
            name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            address: 'B-402, Cyber Heights, Bandra West',
            city: 'Mumbai',
            postalCode: '400050'
          },
          items: [
            {
              product: {
                title: 'Wireless Noise-Canceling Headphones',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
                price: 14999
              },
              quantity: 1,
              price: 14999
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
        <div className="glass-panel h-96 rounded-3xl animate-pulse bg-white/5" />
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', completed: true },
    { title: 'Processing', completed: true },
    { title: 'Shipped', completed: order?.status === 'Shipped' || order?.status === 'Delivered' },
    { title: 'Delivered', completed: order?.status === 'Delivered' },
  ];

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Order History
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Order Tracking</span>
          <h1 className="text-3xl font-black text-white font-heading mt-1">
            Order #{order?._id}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on {new Date(order?.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold self-start sm:self-auto">
          Status: {order?.status || 'Processing'}
        </div>
      </div>

      {/* Shipment Tracker Stepper */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
          Shipment Progress
        </h3>
        <div className="relative flex justify-between items-center max-w-xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 w-1/2" />
          </div>

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step.completed
                    ? 'bg-cyan-500 border-cyan-400 text-obsidian-950 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {step.completed ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-[11px] font-semibold text-center whitespace-nowrap ${
                step.completed ? 'text-white' : 'text-slate-500'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Items & Shipping Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="font-heading font-bold text-base text-white pb-3 border-b border-white/10">
            Purchased Products
          </h3>
          <div className="divide-y divide-white/5">
            {(order?.items || order?.products || []).map((item, idx) => {
              const prod = item.product || item.productId || {};
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                      alt={prod.title}
                      className="w-14 h-14 rounded-xl object-cover bg-obsidian-950 border border-white/5"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-xs sm:text-sm">{prod.title}</h4>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-cyan-400 font-bold text-xs sm:text-sm font-heading">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 text-xs">
            <h3 className="font-heading font-bold text-sm text-white pb-2 border-b border-white/10">
              Delivery Details
            </h3>

            <div className="space-y-2 text-slate-300">
              <p className="font-bold text-white">{order?.shippingAddress?.name || 'Rahul Sharma'}</p>
              <p className="text-slate-400">{order?.shippingAddress?.address || 'Bandra West'}</p>
              <p className="text-slate-400">
                {order?.shippingAddress?.city || 'Mumbai'}, {order?.shippingAddress?.postalCode || '400050'}
              </p>
              <p className="text-slate-400">Phone: {order?.shippingAddress?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <span className="text-slate-400 block mb-1">Payment Method:</span>
              <span className="font-bold text-cyan-300">{order?.paymentMethod || 'Razorpay Online'}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline font-bold">
              <span className="text-slate-300">Total Paid:</span>
              <span className="text-lg font-black text-cyan-400 font-heading">
                ₹{(order?.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
