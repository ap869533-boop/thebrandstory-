import React from 'react';
import { ArrowLeft, Sparkles, Compass, Flame, PlusCircle, LayoutDashboard, LogIn, User } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

interface SubPageHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

export const SubPageHeader: React.FC<SubPageHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  backTo = 'home'
}) => {
  const { navigateTo, authUser, currentView } = usePlatform();

  const isCreator = authUser?.role === 'CREATOR';
  const isBrand = authUser?.role === 'BRAND';
  const isAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'SALES';

  return (
    <header className="sticky top-0 z-40 bg-[#051126]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Optional Back */}
        <div className="flex items-center gap-3 sm:gap-4">
          {showBack && (
            <button
              onClick={() => navigateTo((backTo as any) || 'home')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => navigateTo('home')}
            className="cursor-pointer inline-flex items-center group select-none"
          >
            <div className="text-xl sm:text-2xl tracking-tighter">
              <span className="font-light text-white">the</span>
              <span className="font-black text-[#D4A338]">brands</span>
              <span className="font-light text-white">story</span>
              <span className="font-black text-[#D4A338]">.</span>
            </div>
          </div>

          {title && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
              <span className="font-bold text-white tracking-wide">{title}</span>
              {subtitle && <span className="text-slate-400">· {subtitle}</span>}
            </div>
          )}
        </div>

        {/* Center / Right: Clean Navigation Links & Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigateTo('explore')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentView === 'explore'
                ? 'bg-[#D4A338] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => navigateTo('opportunities')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentView === 'opportunities'
                ? 'bg-[#D4A338] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Opportunities</span>
          </button>

          {/* Conditional Role Action Button */}
          {authUser ? (
            <button
              onClick={() => {
                if (isCreator) navigateTo('creator-dashboard');
                else if (isBrand) navigateTo('brand-dashboard');
                else if (isAdmin) navigateTo('admin-dashboard');
                else navigateTo('home');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-800" />
              <span>Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('login', { mode: 'login' })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => navigateTo('login', { mode: 'signup' })}
                className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#759BF6] hover:bg-[#6089f3] text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
