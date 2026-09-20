import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LAMP_PALETTES } from '../components/InteractiveLamp';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();

  const outletCtx = useOutletContext();
  const currentTheme = outletCtx?.currentTheme || LAMP_PALETTES[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 6) strength += 25;
    if (/[A-Z]/.test(p)) strength += 25;
    if (/[0-9]/.test(p)) strength += 25;
    if (/[^A-Za-z0-9]/.test(p)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (data.role === 'seller' || data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div 
      className="rounded-[24px] p-6 sm:p-7 border-2 transition-all duration-500 shadow-2xl relative"
      style={{
        backgroundColor: 'rgba(18, 25, 33, 0.92)',
        borderColor: currentTheme.glowHex,
        boxShadow: `0 0 15px rgba(255, 255, 255, 0.08), 0 0 30px ${currentTheme.glowColor}, inset 0 0 15px rgba(255, 255, 255, 0.03)`
      }}
    >
      {/* Header Title */}
      <div className="text-center mb-5">
        <h1 
          className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          style={{ textShadow: `0 0 12px ${currentTheme.glowColor}` }}
        >
          Create an Account
        </h1>
        <p className="text-xs text-slate-400 mt-1.5">
          Join ShopEase to unlock personalized recommendations & exclusive drops.
        </p>
      </div>

      {/* Role Toggle */}
      <div className="grid grid-cols-2 p-1 mb-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, role: 'buyer' })}
          className={`py-2 rounded-lg transition-all ${
            formData.role === 'buyer'
              ? 'font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          style={formData.role === 'buyer' ? { background: currentTheme.glowHex, color: '#0f172a' } : {}}
        >
          Buyer Account
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, role: 'seller' })}
          className={`py-2 rounded-lg transition-all ${
            formData.role === 'seller'
              ? 'text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          style={formData.role === 'seller' ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : {}}
        >
          Seller / Creator
        </button>
      </div>

      {/* Error Notification Alert */}
      {(localError || error) && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center justify-between">
          <span>{localError || error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Full Name Field */}
        <div>
          <label 
            htmlFor="register-name"
            className="text-slate-300 font-medium block mb-1"
            style={{ textShadow: `0 0 5px ${currentTheme.glowColor}` }}
          >
            Full Name
          </label>
          <div className="relative">
            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              required
              className="w-full bg-white/[0.06] border-2 border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = currentTheme.glowHex;
                e.currentTarget.style.boxShadow = `0 0 10px ${currentTheme.glowColor}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label 
            htmlFor="register-email"
            className="text-slate-300 font-medium block mb-1"
            style={{ textShadow: `0 0 5px ${currentTheme.glowColor}` }}
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full bg-white/[0.06] border-2 border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = currentTheme.glowHex;
                e.currentTarget.style.boxShadow = `0 0 10px ${currentTheme.glowColor}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="register-password"
            className="text-slate-300 font-medium block mb-1"
            style={{ textShadow: `0 0 5px ${currentTheme.glowColor}` }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-white/[0.06] border-2 border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = currentTheme.glowHex;
                e.currentTarget.style.boxShadow = `0 0 10px ${currentTheme.glowColor}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-1.5 space-y-1">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    strength <= 25
                      ? 'bg-rose-500 w-1/4'
                      : strength <= 50
                      ? 'bg-amber-500 w-2/4'
                      : strength <= 75
                      ? 'bg-sky-400 w-3/4'
                      : 'bg-emerald-400 w-full'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Strength:{' '}
                <span className="font-semibold text-slate-200">
                  {strength <= 25 ? 'Weak' : strength <= 50 ? 'Medium' : strength <= 75 ? 'Good' : 'Cyber-Secure'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label 
            htmlFor="register-confirm-password"
            className="text-slate-300 font-medium block mb-1"
            style={{ textShadow: `0 0 5px ${currentTheme.glowColor}` }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-white/[0.06] border-2 border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = currentTheme.glowHex;
                e.currentTarget.style.boxShadow = `0 0 10px ${currentTheme.glowColor}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
          {loading ? 'Creating Profile...' : 'Complete Registration'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center text-xs text-slate-400 pt-3">
        Already have an account?{' '}
        <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
