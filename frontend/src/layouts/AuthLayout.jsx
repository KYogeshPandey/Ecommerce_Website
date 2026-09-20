import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveLamp, LAMP_PALETTES } from '../components/InteractiveLamp';

// Generate random palette index
const getRandomColorIndex = () => Math.floor(Math.random() * LAMP_PALETTES.length);

const getRandomColorIndexExcept = (exclude) => {
  if (LAMP_PALETTES.length <= 1) return 0;
  let idx = Math.floor(Math.random() * LAMP_PALETTES.length);
  while (idx === exclude) {
    idx = Math.floor(Math.random() * LAMP_PALETTES.length);
  }
  return idx;
};

export const AuthLayout = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  // Deterministic random initial colors for Login and Register (independent)
  const loginColorRef = useRef(null);
  const registerColorRef = useRef(null);
  if (loginColorRef.current === null) {
    loginColorRef.current = getRandomColorIndex();
    registerColorRef.current = getRandomColorIndexExcept(loginColorRef.current);
  }

  // Lamp state (strictly OFF initially)
  const [lampOn, setLampOn] = useState(false);
  const hasBeenToggledRef = useRef(false);

  // Initialize color based on current route
  const [colorIndex, setColorIndex] = useState(() => {
    return isRegister ? registerColorRef.current : loginColorRef.current;
  });

  // If user navigates between /login and /register while lamp is still OFF,
  // update colorIndex to that route's independent random color
  useEffect(() => {
    if (!hasBeenToggledRef.current && !lampOn) {
      setColorIndex(isRegister ? registerColorRef.current : loginColorRef.current);
    }
  }, [isRegister, lampOn]);

  const handleToggle = () => {
    hasBeenToggledRef.current = true;
    setLampOn((prev) => !prev);
    setColorIndex((prev) => (prev + 1) % LAMP_PALETTES.length);
  };

  const currentTheme = LAMP_PALETTES[colorIndex];

  return (
    <div className={`min-h-screen pt-16 pb-8 flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-700 select-none ${
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

      {/* Main Responsive Canvas: Lamp (Left 30-35%) & Form (Right 55-60%) */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-12 py-4 gap-8 lg:gap-14 relative z-10">
        
        {/* Cute Table Lamp */}
        <InteractiveLamp
          lampOn={lampOn}
          onToggle={handleToggle}
          currentTheme={currentTheme}
        />

        {/* Form Container with smooth transition & state preservation */}
        <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start justify-center relative min-h-[460px]">
          <motion.div
            animate={{
              opacity: lampOn ? 1 : 0,
              scale: lampOn ? 1 : 0.85,
              y: lampOn ? 0 : 20,
              pointerEvents: lampOn ? 'auto' : 'none',
            }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-[420px] select-text"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: isRegister ? 18 : -18, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isRegister ? -18 : 18, scale: 0.98 }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
                className="w-full"
              >
                <Outlet context={{ currentTheme, lampOn }} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
