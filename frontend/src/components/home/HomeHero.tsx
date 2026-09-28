import React, { useState } from 'react';
import {
  Search,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  Users,
  Heart,
  Megaphone,
  CreditCard,
  HelpCircle,
  LogOut,
  Building2,
  CheckCircle2,
  User,
  ArrowRight
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const HomeHero: React.FC = () => {
  const {
    filters,
    setFilters,
    navigateTo,
    authUser,
    openAuthModal,
    openSavedDrawer,
    savedCreatorIds,
    logout,
    creators,
  } = usePlatform();

  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCreator = authUser?.role === 'CREATOR';
  const isBrand = authUser?.role === 'BRAND';
  const isAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'SALES';

  // User display details
  const matchedCreator = isCreator
    ? creators.find(
        (c) =>
          c.email?.toLowerCase() === authUser?.email?.toLowerCase() ||
          c.id === authUser?.id ||
          c.id === authUser?.creatorProfile?.id
      ) || authUser?.creatorProfile
    : null;

  const displayName = isCreator
    ? (matchedCreator?.name || authUser?.name || 'Creator')
    : isBrand
    ? (authUser?.brandProfile?.brandName || authUser?.name || 'Brand Partner')
    : (authUser?.name || 'Guest User');

  const displayHandle = isCreator
    ? `@${matchedCreator?.username || authUser?.name?.toLowerCase().replace(/\s+/g, '') || 'creator'}`
    : isBrand
    ? `@${authUser?.name?.toLowerCase().replace(/\s+/g, '') || 'brand'}`
    : '@guest';

  const avatarSrc = isCreator
    ? (matchedCreator?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=D4A338&color=000&bold=true`)
    : isBrand
    ? (authUser?.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0F172A&color=fff&bold=true`)
    : null;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isCreator) {
      navigateTo('opportunities', { searchQuery: keyword });
    } else {
      setFilters({
        ...filters,
        searchQuery: keyword,
      });
      navigateTo('explore');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#051126] via-[#071736] to-[#091f48] text-white min-h-screen md:min-h-[740px] flex flex-col justify-between py-4 sm:py-8 px-4 sm:px-6 md:px-[6vw] font-sans w-full max-w-full select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4A338]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-blue-600/10 rounded-full blur-[130px]" />
      </div>

      {/* 🎯 1. TOP HEADER BAR: Wider Search Bar on Desktop + White Rounded Square Menu Button on Right */}
      <div className="w-full max-w-xl md:max-w-none mx-auto relative z-20 flex items-center justify-between gap-3 sm:gap-4 pt-2 pb-4 md:grid md:grid-cols-[1fr_64px] md:gap-5 md:pb-6">
        <button type="button" onClick={() => navigateTo('home')} className="hidden md:block shrink-0 text-left cursor-pointer" aria-label="Go to home">
          <span className="text-3xl lg:text-[3rem] tracking-tight leading-none">
            <span className="text-white font-medium">the</span><span className="text-[#D4A338] font-black">brands</span><span className="text-white font-medium">story</span><span className="text-[#D4A338]">.</span>
          </span>
        </button>
        {/* Search Input Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="hero-search-form flex-1 relative flex items-center bg-white backdrop-blur-md rounded-full border border-white px-4 sm:px-6 py-2.5 sm:py-3.5 md:absolute md:left-[64%] md:-translate-x-1/2 md:w-[580px] md:h-[54px] md:py-0 md:px-6 transition-all shadow-lg shadow-black/10 group"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#3977c9] shrink-0 mr-2.5 sm:mr-3.5" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={
              isCreator
                ? "Search brands here..."
                : "Search creators here..."
            }
            className="hero-search-input w-full bg-transparent text-xs sm:text-base text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="text-xs sm:text-sm text-slate-400 hover:text-slate-900 font-bold px-1.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </form>

        {/* White Rounded Square Hamburger Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          title="Open Menu"
          className="hero-menu-button w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[20px] bg-white md:bg-transparent hover:bg-slate-100 text-slate-950 md:text-[#8eb6ff] md:border-2 md:border-[#8eb6ff] flex items-center justify-center transition-all duration-200 shadow-md md:shadow-none cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 stroke-[2]" />
        </button>
      </div>

      {/* 🎯 2. HERO CONTENT: Logo, Headline, Stats, Creator Selfie Illustration, and Inline Buttons */}
      <div className="max-w-2xl md:max-w-none mx-auto w-full text-center md:text-left relative z-10 flex flex-col items-center justify-center my-auto space-y-4 sm:space-y-6 md:grid md:grid-cols-2 md:items-center md:gap-x-0 md:gap-y-10 md:space-y-0">
        
        {/* Brand Logo */}
        <div className="cursor-pointer group select-none mt-2 md:hidden" onClick={() => navigateTo('home')}>
          <h2 className="text-[2.35rem] sm:text-5xl md:text-5xl font-black tracking-tight leading-none">
            <span className="text-white font-medium">the</span>
            <span className="text-[#D4A338] font-black">brands</span>
            <span className="text-white font-medium">story</span>
            <span className="text-[#D4A338]">.</span>
          </h2>
        </div>

        {/* Main Title */}
        <div className="space-y-2.5 md:space-y-12 max-w-xl mx-auto md:mx-0 md:col-start-1 md:row-start-1 md:self-end">
          <h1 className="text-3xl sm:text-4xl md:text-[2.3rem] font-black tracking-tight text-white leading-tight">
            Your next collab is here
          </h1>
          
          {/* Subheading & Stats */}
          <div className="space-y-1 md:space-y-3 text-slate-300">
            <p className="text-xs sm:text-sm md:text-[1.45rem] font-semibold text-[#8eb6ff] tracking-wide">
              1,00,000+ Influencers <span className="text-slate-400">|</span> 10,000+ Brands
            </p>
            <p className="text-[11px] sm:text-xs md:text-[1.1rem] text-[#8eb6ff]/85 font-medium tracking-normal">
              No Middleman <span className="text-slate-500">•</span> 0% Commission <span className="text-slate-500">•</span> 100% Free
            </p>
          </div>
        </div>

        {/* Responsive creator illustration */}
        <div className="w-full max-w-[300px] sm:max-w-[420px] md:max-w-[560px] mx-auto py-1 sm:py-2 md:mx-0 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
          <img
            src="/creator-selfie.png"
            alt="Two creators taking a selfie"
            className="block w-full h-auto object-contain drop-shadow-lg"
          />
        </div>

        {/* 🎯 3. Dynamic Buttons (Strictly in ONE Single Horizontal Row) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto pt-2 pb-4 md:mx-0 md:col-start-1 md:row-start-2 md:self-start md:justify-self-start">
          {/* SCENARIO 1: INFLUENCER / CREATOR LOGGED IN */}
          {isCreator && (
            <div className="flex flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 md:gap-5 w-full md:w-auto">
              <button
                type="button"
                id="hero-search-brands-btn"
                onClick={() => navigateTo('opportunities')}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#D4A338]" />
                <span>Search Brands</span>
              </button>

              <button
                type="button"
                id="hero-creator-dashboard-btn"
                onClick={() => navigateTo('creator-dashboard')}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full bg-[#6495ED] hover:bg-[#5284dc] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-[#6495ED]/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4 text-white" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          )}

          {/* SCENARIO 2: BRAND LOGGED IN */}
          {isBrand && (
            <div className="flex flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 w-full">
              <button
                type="button"
                id="hero-search-influencers-btn"
                onClick={() => navigateTo('explore')}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap"
              >
                <Users className="w-4 h-4 text-[#D4A338]" />
                <span>Search Influencers</span>
              </button>

              <button
                type="button"
                id="hero-brand-dashboard-btn"
                onClick={() => navigateTo('brand-dashboard')}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full bg-[#6495ED] hover:bg-[#5284dc] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-[#6495ED]/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4 text-white" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          )}

          {/* SCENARIO 3: ADMIN LOGGED IN */}
          {isAdmin && (
            <div className="flex flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 w-full">
              <button
                type="button"
                id="hero-explore-all-btn"
                onClick={() => navigateTo('explore')}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#D4A338]" />
                <span>Search Influencers</span>
              </button>

              <button
                type="button"
                id="hero-admin-panel-btn"
                onClick={() => navigateTo('admin-dashboard')}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-[#D4A338]/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-950" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* SCENARIO 4: GUEST / NOT LOGGED IN */}
          {!authUser && (
            <div className="flex flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 md:gap-5 w-full md:w-auto">
              {/* Button 1: Sign in (White button) */}
              <button
                type="button"
                id="hero-signin-btn"
                onClick={() => navigateTo('login', { mode: 'login' })}
                className="hero-signin-button flex-1 md:flex-none md:w-[150px] md:h-[72px] md:py-0 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full md:rounded-[24px] bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm md:text-xl tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer text-center whitespace-nowrap"
              >
                Sign in
              </button>

              {/* Button 2: Get Started For Free (Periwinkle Blue button) */}
              <button
                type="button"
                id="hero-get-started-btn"
                onClick={() => openAuthModal('signup', 'CREATOR')}
                className="flex-1 md:flex-none md:w-[326px] md:h-[72px] md:py-0 py-3 sm:py-3.5 px-3 sm:px-6 rounded-full md:rounded-[24px] bg-[#759BF6] hover:bg-[#628bf0] text-white font-black text-xs sm:text-sm md:text-xl tracking-wide transition-all shadow-lg shadow-[#759BF6]/30 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer text-center whitespace-nowrap"
              >
                Get Started For Free
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 4. FLOATING POPUP DRAWER MODAL */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-stretch justify-end p-0 animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="h-full w-[min(88vw,390px)] bg-[#101b31] shadow-[-20px_0_60px_rgba(0,0,0,0.45)] overflow-hidden border-l border-white/10 flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Top Banner */}
            <div className="bg-[#0b1b3b] px-6 py-4 flex items-center justify-between">
              <div className="text-xl font-bold tracking-tight">
                <span className="text-white">the</span>
                <span className="text-[#D4A338]">brands</span>
                <span className="text-white">story</span>
                <span className="text-[#D4A338]">.</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-slate-100">
              {/* User Profile Card */}
              {authUser ? (
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#D4A338] via-amber-300 to-[#D4A338] shadow-md">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#0b1b3b] text-white flex items-center justify-center font-black text-lg">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate leading-tight">
                        Hi, {displayName}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-[#0095F6] fill-[#0095F6] text-white shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{displayHandle}</p>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (isCreator) navigateTo('creator-dashboard');
                        else if (isBrand) navigateTo('brand-dashboard');
                        else navigateTo('home');
                      }}
                      className="text-[11px] font-bold text-[#b88628] hover:text-[#D4A338] mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isBrand ? 'View Brand Profile' : 'View Profile'}</span>
                      <span className="text-[10px]">&gt;</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pb-3 border-b border-slate-100 space-y-2 text-left">
                  <p className="text-xs text-slate-500 font-medium">
                    India's biggest influencer & brand collaboration ecosystem.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateTo('login');
                      }}
                      className="flex-1 py-2 rounded-full border border-slate-200 text-slate-900 font-bold text-xs hover:bg-slate-50 text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('signup', 'CREATOR');
                      }}
                      className="flex-1 py-2 rounded-full bg-[#D4A338] text-slate-950 font-black text-xs hover:bg-[#be8f2b] text-center"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}

              {/* Gold Primary Search Button */}
              <div>
                {isBrand ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('explore');
                    }}
                    className="w-full py-3 px-4 rounded-full bg-[#D4A338] hover:bg-[#be8f2b] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#D4A338]/25 transition cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Find influencers</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('opportunities');
                    }}
                    className="w-full py-3 px-4 rounded-full bg-[#D4A338] hover:bg-[#be8f2b] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#D4A338]/25 transition cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Find Brands</span>
                  </button>
                )}
              </div>

              {/* Menu Items */}
              <div className="space-y-1 text-slate-700 text-xs sm:text-sm font-bold text-left">
                {/* Wish List */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSavedDrawer();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-slate-900 fill-slate-900" />
                    <span>Wish list</span>
                  </div>
                  {savedCreatorIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black">
                      {savedCreatorIds.length}
                    </span>
                  )}
                </button>

                {/* Pitches */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isCreator) navigateTo('creator-dashboard');
                    else if (isBrand) navigateTo('brand-dashboard');
                    else navigateTo('opportunities');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-slate-900" />
                    <span>Pitches</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#8e6819] text-[10px] font-black">
                    {isBrand ? '3 New' : '2 New'}
                  </span>
                </button>

                {/* Role specific items */}
                {isBrand ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateTo('brand-dashboard');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4 text-slate-900" />
                      <span>My Campaign</span>
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateTo('brand-dashboard');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-slate-900" />
                      <span>Brand Profile</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (isCreator) navigateTo('creator-dashboard');
                      else navigateTo('login');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-900" />
                    <span>My Profile</span>
                  </button>
                )}

                {/* Wallet / Billing */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isCreator) navigateTo('creator-dashboard');
                    else if (isBrand) navigateTo('brand-dashboard');
                    else navigateTo('login');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-slate-900" />
                  <span>Wallet / Billing</span>
                </button>

                {/* Help and Support */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('blog');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-900" />
                  <span>Help and Support</span>
                </button>

                {/* Logout or Sign In */}
                {authUser ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-rose-50 flex items-center gap-3 text-left text-rose-500 font-bold transition cursor-pointer mt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('login');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left text-slate-900 font-bold transition cursor-pointer mt-2"
                  >
                    <User className="w-4 h-4 text-slate-900" />
                    <span>Sign in</span>
                  </button>
                )}
              </div>
            </div>

            {/* Version Footer */}
            <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                v2.4.1 • {isBrand ? 'Brand Account' : isCreator ? 'Creator Account' : 'Guest Account'}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
