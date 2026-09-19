import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Dynamic Color Palettes cycling once per completed toggle
const PALETTES = [
  {
    name: 'lavender',
    shadeColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    glowHex: '#c084fc',
    btnBg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    cordColor: '#e9d5ff',
    handleColor: '#c084fc',
  },
  {
    name: 'pink',
    shadeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.55)',
    glowHex: '#f472b6',
    btnBg: 'linear-gradient(135deg, #ec4899, #be185d)',
    cordColor: '#fce7f3',
    handleColor: '#f472b6',
  },
  {
    name: 'amber',
    shadeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    glowHex: '#fbbf24',
    btnBg: 'linear-gradient(135deg, #f59e0b, #b45309)',
    cordColor: '#fef3c7',
    handleColor: '#f59e0b',
  },
  {
    name: 'cyan',
    shadeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    glowHex: '#38bdf8',
    btnBg: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
    cordColor: '#e0f2fe',
    handleColor: '#38bdf8',
  },
  {
    name: 'mint',
    shadeColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.55)',
    glowHex: '#34d399',
    btnBg: 'linear-gradient(135deg, #10b981, #047857)',
    cordColor: '#d1fae5',
    handleColor: '#10b981',
  },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Lamp state (strictly OFF initially)
  const [lampOn, setLampOn] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  // Elastic Pull Wire Geometry State
  const REST_CORD_Y = 348;
  const ANCHOR_X = 124;
  const ANCHOR_Y = 190;
  const [cordEndY, setCordEndY] = useState(REST_CORD_Y);

  // Interaction & Duplicate-Event Guards
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartYRef = useRef(0);
  const currentDragYRef = useRef(REST_CORD_Y);
  const lastToggleTimeRef = useRef(0);
  const ignoreClickUntilRef = useRef(0);
  const animFrameRef = useRef(null);
  const cordLineRef = useRef(null);
  const cordHandleRef = useRef(null);

  // Auth store
  const { login, demoLogin, loading, error } = useAuthStore();
  const [localError, setLocalError] = useState('');

  const currentTheme = PALETTES[colorIndex];

  // Subtle realistic mechanical click sound using native Web Audio API
  const playClickSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {}
  }, []);

  // Spring physics animation to release the wire back to resting position
  // IMPORTANT: This animation NEVER toggles lamp state or changes colors.
  const animateSpringRelease = useCallback((fromY) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    let pos = fromY;
    let velocity = 0;
    const stiffness = 0.28;
    const damping = 0.68;
    let frames = 0;

    const step = () => {
      frames++;
      const force = (REST_CORD_Y - pos) * stiffness;
      velocity = (velocity + force) * damping;
      pos += velocity;

      setCordEndY(pos);
      if (cordLineRef.current) cordLineRef.current.setAttribute('y2', pos);
      if (cordHandleRef.current) cordHandleRef.current.setAttribute('cy', pos);

      if (Math.abs(pos - REST_CORD_Y) < 0.25 && Math.abs(velocity) < 0.15) {
        setCordEndY(REST_CORD_Y);
        if (cordLineRef.current) cordLineRef.current.setAttribute('y2', REST_CORD_Y);
        if (cordHandleRef.current) cordHandleRef.current.setAttribute('cy', REST_CORD_Y);
      } else if (frames < 90) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setCordEndY(REST_CORD_Y);
        if (cordLineRef.current) cordLineRef.current.setAttribute('y2', REST_CORD_Y);
        if (cordHandleRef.current) cordHandleRef.current.setAttribute('cy', REST_CORD_Y);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [REST_CORD_Y]);

  // The ONLY function that toggles lamp state and advances the color
  // Protected with a 500ms debounce guard against duplicate events.
  const triggerLampToggle = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 500) {
      return false;
    }
    lastToggleTimeRef.current = now;

    playClickSound();
    setLampOn((prev) => !prev);
    setColorIndex((prev) => (prev + 1) % PALETTES.length);
    return true;
  }, [playClickSound]);

  // Direct click / tap / keyboard trigger on the pull wire or lampshade
  const handlePullAction = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 500) return;
    if (now < ignoreClickUntilRef.current) return;
    if (isDraggingRef.current) return;

    // 1. Physically stretch the cord downward
    const pullDistance = 50;
    const targetY = REST_CORD_Y + pullDistance;
    setCordEndY(targetY);
    if (cordLineRef.current) cordLineRef.current.setAttribute('y2', targetY);
    if (cordHandleRef.current) cordHandleRef.current.setAttribute('cy', targetY);

    // 2. Toggle state exactly ONCE
    triggerLampToggle();

    // 3. Spring back with elastic motion
    setTimeout(() => {
      animateSpringRelease(targetY);
    }, 110);
  }, [REST_CORD_Y, triggerLampToggle, animateSpringRelease]);

  // Pointer drag events for realistic stretchable elastic wire
  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartYRef.current = e.clientY;
    currentDragYRef.current = REST_CORD_Y;
    if (e.currentTarget?.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - dragStartYRef.current;
    if (Math.abs(deltaY) > 6) {
      hasDraggedRef.current = true;
    }
    const stretch = deltaY > 0 ? Math.min(130, deltaY * 0.85) : Math.max(-15, deltaY * 0.2);
    const newY = REST_CORD_Y + stretch;
    currentDragYRef.current = newY;
    setCordEndY(newY);
    if (cordLineRef.current) cordLineRef.current.setAttribute('y2', newY);
    if (cordHandleRef.current) cordHandleRef.current.setAttribute('cy', newY);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.currentTarget?.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }

    // Block subsequent synthetic click events generated by this pointer interaction
    ignoreClickUntilRef.current = Date.now() + 600;

    const finalY = currentDragYRef.current;
    const draggedDistance = finalY - REST_CORD_Y;

    if (hasDraggedRef.current) {
      if (draggedDistance > 25) {
        // Valid physical drag pull -> toggle exactly once!
        triggerLampToggle();
      }
      // Always spring back smoothly without extra toggle
      animateSpringRelease(finalY);
    } else {
      // Stationary tap / quick click on handle -> handle single pull action
      handlePullAction();
    }
  };

  const handlePointerCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    animateSpringRelease(currentDragYRef.current);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

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
    <div className={`min-h-screen pt-16 pb-8 flex flex-col justify-between items-center relative overflow-hidden transition-colors duration-700 select-none ${
      lampOn ? 'bg-[#101721]' : 'bg-[#0b0e14]'
    }`}>
      {/* Dynamic Ambient Background Illumination */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-0"
        style={{
          background: lampOn 
            ? `radial-gradient(circle at 35% 45%, ${currentTheme.glowColor} 0%, transparent 60%)` 
            : 'none',
          opacity: lampOn ? 0.35 : 0
        }}
      />

      {/* Main Responsive Canvas: Lamp (Left 30-35%) & Login Form (Right) */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-12 py-4 gap-8 lg:gap-14 relative z-10">
        
        {/* =========================================================== */}
        {/* 1. CUTE TABLE LAMP (SCALED TO ~68% VISUAL PROPORTION) */}
        {/* =========================================================== */}
        <div className="w-full lg:w-[35%] flex flex-col items-center justify-center relative select-none">
          <svg
            className="w-[170px] sm:w-[200px] lg:w-[225px] h-auto filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
            viewBox="0 0 333 484"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Underside Opening Shade Gradient */}
              <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#000000" />
                <stop offset="1" stopColor="#1e293b" stopOpacity="0" />
              </linearGradient>

              {/* Light Cone Gradient */}
              <linearGradient id="lamp-light-cone" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffbeb" stopOpacity="0.42" />
                <stop offset="0.6" stopColor="#fef08a" stopOpacity="0.14" />
                <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
              </linearGradient>

              {/* Base Gradient Shading */}
              <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse">
                <stop stopColor={lampOn ? '#cbd5e1' : '#334155'} />
                <stop offset="0.8" stopColor={lampOn ? '#94a3b8' : '#1e293b'} stopOpacity="0" />
              </linearGradient>

              {/* Post Gradient Shading */}
              <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse">
                <stop stopColor={lampOn ? '#cbd5e1' : '#334155'} />
                <stop offset="1" stopColor={lampOn ? '#94a3b8' : '#1e293b'} stopOpacity="0" />
              </linearGradient>

              {/* Top Lampshade Shading */}
              <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse">
                <stop stopColor={lampOn ? currentTheme.shadeColor : '#475569'} stopOpacity="0.85" />
                <stop offset="1" stopColor="#000000" stopOpacity="0.25" />
              </linearGradient>

              {/* Mouth Tongue Clip */}
              <clipPath id="lamp-mouth-clip">
                <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" />
              </clipPath>
            </defs>

            {/* A. Soft Light Cone (Originates from underside when ON) */}
            {lampOn && (
              <path
                d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z"
                fill="url(#lamp-light-cone)"
                className="transition-opacity duration-500 pointer-events-none"
              />
            )}

            {/* B. Base of the Lamp */}
            <g className="lamp__base">
              {/* Base Bottom Rim */}
              <path
                d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z"
                fill={lampOn ? '#cbd5e1' : '#1e293b'}
                className="transition-colors duration-500"
              />
              <path
                d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z"
                fill="url(#base-shading)"
              />
              {/* Base Top Circular Disc */}
              <ellipse
                cx="165"
                cy="430"
                rx="80"
                ry="20"
                fill={lampOn ? '#e2e8f0' : '#334155'}
                className="transition-colors duration-500"
              />
              <ellipse
                cx="165"
                cy="430"
                rx="80"
                ry="20"
                fill="url(#base-shading)"
              />
            </g>

            {/* C. Vertical Stand / Post */}
            <g className="lamp__post">
              <path
                d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z"
                fill={lampOn ? '#e2e8f0' : '#334155'}
                className="transition-colors duration-500"
              />
              <path
                d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z"
                fill="url(#post-shading)"
              />
            </g>

            {/* D. Underside / Opening of Shade */}
            <g className="lamp__shade-opening">
              <ellipse
                cx="165"
                cy="220"
                rx="130"
                ry="20"
                fill={lampOn ? '#fffbeb' : '#141d27'}
                className="transition-colors duration-500"
              />
              {!lampOn && (
                <ellipse
                  cx="165"
                  cy="220"
                  rx="130"
                  ry="20"
                  fill="url(#opening-shade)"
                />
              )}
            </g>

            {/* E. Conical Lampshade Shell */}
            <g className="lamp__top">
              <path
                d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z"
                fill={lampOn ? currentTheme.shadeColor : '#2b333e'}
                className="transition-colors duration-500 cursor-pointer"
                onClick={handlePullAction}
              />
              <path
                d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z"
                fill="url(#top-shading)"
                className="cursor-pointer"
                onClick={handlePullAction}
              />
            </g>

            {/* F. Cute Animated Face */}
            <g className="lamp__face pointer-events-none">
              {/* Happy Mouth with Cute Tongue (Visible when ON) */}
              {lampOn && (
                <g className="lamp__mouth animate-fade-in">
                  <path
                    d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z"
                    fill="#141414"
                  />
                  <g clipPath="url(#lamp-mouth-clip)">
                    <circle cx="179.4" cy="172.6" r="18" fill="#e06952" />
                  </g>
                </g>
              )}

              {/* Eyes: Closed Sleepy (OFF) vs Happy Smiling (ON) */}
              <g className="lamp__eyes transition-transform duration-300">
                {lampOn ? (
                  <>
                    {/* Happy open smiling arcs */}
                    <path
                      d="M89 125c0 5.523 5.82 10 13 10s13-4.477 13-10"
                      fill="none"
                      stroke="#141414"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M215 125c0 5.523 5.82 10 13 10s13-4.477 13-10"
                      fill="none"
                      stroke="#141414"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    {/* Sleepy closed curved eyelids */}
                    <path
                      d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </g>
            </g>

            {/* G. Highly Elastic Dynamic Pull Wire */}
            <g className="lamp__cords">
              {/* Dynamic Elastic Cord Line */}
              <line
                ref={cordLineRef}
                x1={ANCHOR_X}
                y1={ANCHOR_Y}
                x2={ANCHOR_X}
                y2={cordEndY}
                stroke={lampOn ? currentTheme.cordColor : '#94a3b8'}
                strokeWidth="5"
                strokeLinecap="round"
                className="transition-colors duration-300 pointer-events-none"
              />

              {/* Pull Handle / Bead at bottom of cord */}
              <circle
                ref={cordHandleRef}
                cx={ANCHOR_X}
                cy={cordEndY}
                r="7"
                fill={lampOn ? currentTheme.handleColor : '#94a3b8'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-colors duration-300 pointer-events-none"
              />

              {/* Interactive Button / Drag Hit Target */}
              <g
                id="pull-wire-handle"
                role="button"
                tabIndex={0}
                aria-label={lampOn ? "Pull wire to turn off lamp" : "Pull wire to turn on lamp"}
                aria-pressed={lampOn}
                className="cursor-grab active:cursor-grabbing focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handlePullAction();
                }}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handlePullAction();
                  }
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                <circle
                  cx={ANCHOR_X}
                  cy={cordEndY}
                  r="30"
                  fill="transparent"
                  className="touch-none select-none"
                />
              </g>
            </g>
          </svg>
        </div>

        {/* =========================================================== */}
        {/* 2. COMPACT LOGIN FORM (RIGHT 55-60% VIEWPORT) */}
        {/* STRICTLY INVISIBLE WHEN LAMP IS OFF */}
        {/* =========================================================== */}
        <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start justify-center relative min-h-[460px]">
          <AnimatePresence>
            {lampOn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.82, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.82, y: 20 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-full max-w-[380px] select-text"
              >
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
                      Sign in to access your orders, cart, and drops.
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
                          autoComplete="username email"
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

                  {/* Instant Demo Profiles (Preserved) */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ============================================================= */}
      {/* 3. SUBTLE FOOTER CREDIT AS SEEN IN REFERENCE */}
      {/* ============================================================= */}
      <footer className="relative z-20 text-center pb-2">
        <p className="text-[13px] text-white/50 font-normal">
          Designed by <strong className="text-white/80 font-semibold">U. Rohith</strong> • <span className="text-white/60">ShopEase</span>
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
