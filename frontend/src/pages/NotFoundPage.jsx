import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ShoppingBag } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 text-center">
      <div className="glass-panel p-12 sm:p-16 rounded-3xl border border-white/10 max-w-lg w-full space-y-6 shadow-2xl">
        <div className="relative">
          <span className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400 font-heading">
            404
          </span>
          <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full -z-10 pointer-events-none" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-heading">
            Lost in Cyberspace
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            The page coordinate you requested does not exist or has been relocated to another sector.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-obsidian-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};
