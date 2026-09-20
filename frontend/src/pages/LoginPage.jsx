import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LAMP_PALETTES } from '../components/InteractiveLamp';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Outlet context from AuthLayout (if wrapped in AuthLayout)
  const outletCtx = useOutletContext();
  const currentTheme = outletCtx?.currentTheme || LAMP_PALETTES[0];

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Auth store
  const { login, demoLogin, loading, error } = useAuthStore();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const data = await login(email, password);
      if (data.role === 'admin' || data.role === 'seller') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleDemo = async (role) => {
    setLocalError('');
    try {
      await demoLogin(role);
      if (role === 'admin' || role === 'seller') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Demo login failed. Please verify server is in demo mode.');
    }
  };

  const handleForgotClick = () => {
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 3500);
  };

  return (
    <div 
      className="rounded-[24px] p-7 sm:p-8 border-2 transition-all duration-500 shadow-2xl relative"
      style={{
        backgroundColor: 'rgba(18, 25, 33, 0.92)',
        borderColor: currentTheme.glowHex,
        boxShadow: `0 0 15px rgba(255, 255, 255, 0.08), 0 0 30px ${currentTheme.glowColor}, inset 0 0 15px rgba(255, 255, 255, 0.03)`
      }}
    >
      {/* Header Title */}
      <div className="text-center mb-6">
        <h1 
          className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          style={{ textShadow: `0 0 12px ${currentTheme.glowColor}` }}
        >
          Welcome Back
        </h1>
        <p className="text-xs text-slate-400 mt-1.5">
          Sign in to access your orders, cart, and wishlist.
        </p>
      </div>

      {/* Notification Alerts */}
      {(localError || error) && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center justify-between">
          <span>{localError || error}</span>
        </div>
      )}

      {forgotSent && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Password reset link sent to your email.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Username / Email Field */}
        <div>
          <label 
            htmlFor="username" 
            className="text-slate-300 font-medium block mb-1.5"
            style={{ textShadow: `0 0 5px ${currentTheme.glowColor}` }}
          >
            Username or Email
          </label>
          <div className="relative">
            <input
              id="username"
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full bg-white/[0.06] border-2 border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = currentTheme.glowHex;
                e.currentTarget.style.boxShadow = `0 0 10px ${currentTheme.glowColor}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className="text-slate-300 font-medium block mb-1.5"
            style={{ textShadow: `0 0 5px ${currentTheme.glowColor}` }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full bg-white/[0.06] border-2 border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = currentTheme.glowHex;
                e.currentTarget.style.boxShadow = `0 0 10px ${currentTheme.glowColor}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white shadow-lg transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 mt-2"
          style={{
            background: currentTheme.btnBg,
            boxShadow: `0 4px 18px ${currentTheme.glowColor}`
          }}
        >
          {loading ? 'Authenticating...' : 'Login'}
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Forgot Password */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleForgotClick}
            className="text-xs text-slate-400 hover:text-white transition-colors focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>
      </form>

      {/* Instant Demo Profiles */}
      <div className="pt-4 mt-3 border-t border-white/10 text-center space-y-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
          ⚡ Instant Demo Profiles
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemo('buyer')}
            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            Buyer Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemo('seller')}
            className="py-1.5 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400/40"
          >
            Seller Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemo('admin')}
            className="py-1.5 px-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
          >
            Admin Demo
          </button>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center text-xs text-slate-400 pt-3">
        Don't have an account?{' '}
        <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
