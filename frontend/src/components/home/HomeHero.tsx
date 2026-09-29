import React, { useMemo, useState } from 'react';
import {
  Search,
  Menu,
  Compass,
  LayoutDashboard,
  Users,
  Heart,
  Megaphone,
  CreditCard,
  HelpCircle,
  MessageCircle,
  LogOut,
  Building2,
  CheckCircle2,
  User,
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
  const isAdmin = authUser?.role === 'ADMIN';
  const isSales = authUser?.role === 'SALES';

  /*
   * --------------------------------------------------------------------------
   * USER PROFILE
   * --------------------------------------------------------------------------
   */

  const matchedCreator = useMemo(() => {
    if (!isCreator) return null;

    const creatorProfile = authUser?.creatorProfile;

    if (creatorProfile) {
      return creatorProfile;
    }

    if (!Array.isArray(creators) || !authUser) {
      return null;
    }

    const authEmail = authUser.email?.toLowerCase();

    return (
      creators.find(
        (creator) =>
          (authEmail &&
            creator.email?.toLowerCase() === authEmail) ||
          creator.id === authUser.id
      ) || null
    );
  }, [
    isCreator,
    creators,
    authUser?.email,
    authUser?.id,
    authUser?.creatorProfile,
  ]);

  const displayName = isCreator
    ? matchedCreator?.name || authUser?.name || 'Creator'
    : isBrand
      ? authUser?.brandProfile?.brandName ||
        authUser?.name ||
        'Brand Partner'
      : authUser?.name || (isSales ? 'Sales' : 'Guest User');

  const displayHandle = isCreator
    ? `@${
        matchedCreator?.username ||
        authUser?.name?.toLowerCase().replace(/\s+/g, '') ||
        'creator'
      }`
    : isBrand
      ? `@${
          authUser?.name?.toLowerCase().replace(/\s+/g, '') ||
          'brand'
        }`
      : isSales
        ? '@sales'
        : '@guest';

  const avatarSrc = isCreator
    ? matchedCreator?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        displayName
      )}&background=D4A338&color=000&bold=true`
    : isBrand
      ? authUser?.brandProfile?.logoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=0F172A&color=fff&bold=true`
      : null;

  /*
   * --------------------------------------------------------------------------
   * SEARCH
   * --------------------------------------------------------------------------
   */

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const searchQuery = keyword.trim();

    if (isCreator) {
      navigateTo('opportunities', {
        searchQuery,
      });
      return;
    }

    setFilters((previousFilters) => ({
      ...previousFilters,
      searchQuery,
    }));

    navigateTo('explore');
  };

  const searchPlaceholder = isCreator
    ? 'Search brands here...'
    : 'Search creators here...';

  /*
   * --------------------------------------------------------------------------
   * COMMON HERO BUTTON STYLES
   *
   * All logged-in and guest buttons now use the same visual system.
   * Only the button variant/content changes.
   * --------------------------------------------------------------------------
   */

  const heroButtonBase =
    'h-12 sm:h-13 md:h-[56px] rounded-full flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 font-black text-xs sm:text-sm tracking-wide whitespace-nowrap text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5';

  const heroPrimaryButton = `${heroButtonBase} bg-white hover:bg-slate-100 text-slate-950 shadow-lg hover:shadow-xl`;

  const heroSecondaryButton = `${heroButtonBase} bg-[#759BF6] hover:bg-[#628bf0] text-white shadow-lg shadow-[#759BF6]/30 hover:shadow-xl`;

  const heroAdminButton = `${heroButtonBase} bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 shadow-lg shadow-[#D4A338]/30 hover:shadow-xl`;

  /*
   * --------------------------------------------------------------------------
   * ROLE BASED HERO ACTIONS
   * --------------------------------------------------------------------------
   */

  const renderHeroActions = () => {
    if (isCreator) {
      return (
        <>
          <button
            type="button"
            id="hero-search-brands-btn"
            onClick={() => navigateTo('opportunities')}
            className={`${heroPrimaryButton} flex-1 md:flex-none md:min-w-[180px]`}
          >
            <Compass className="w-4 h-4 text-[#D4A338] shrink-0" />
            <span>Search Brands</span>
          </button>

          <button
            type="button"
            id="hero-creator-dashboard-btn"
            onClick={() => navigateTo('creator-dashboard')}
            className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[180px]`}
          >
            <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
            <span>Go to Dashboard</span>
          </button>
        </>
      );
    }

    if (isBrand) {
      return (
        <>
          <button
            type="button"
            id="hero-search-influencers-btn"
            onClick={() => navigateTo('explore')}
            className={`${heroPrimaryButton} flex-1 md:flex-none md:min-w-[200px]`}
          >
            <Users className="w-4 h-4 text-[#D4A338] shrink-0" />
            <span>Search Influencers</span>
          </button>

          <button
            type="button"
            id="hero-brand-dashboard-btn"
            onClick={() => navigateTo('brand-dashboard')}
            className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[180px]`}
          >
            <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
            <span>Go to Dashboard</span>
          </button>
        </>
      );
    }

    if (isAdmin) {
      return (
        <>
          <button
            type="button"
            id="hero-explore-all-btn"
            onClick={() => navigateTo('explore')}
            className={`${heroPrimaryButton} flex-1 md:flex-none md:min-w-[200px]`}
          >
            <Compass className="w-4 h-4 text-[#D4A338] shrink-0" />
            <span>Search Influencers</span>
          </button>

          <button
            type="button"
            id="hero-admin-panel-btn"
            onClick={() => navigateTo('admin-dashboard')}
            className={`${heroAdminButton} flex-1 md:flex-none md:min-w-[190px]`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Admin Dashboard</span>
          </button>
        </>
      );
    }

    if (isSales) {
      return (
        <>
          <button
            type="button"
            id="hero-sales-explore-btn"
            onClick={() => navigateTo('explore')}
            className={`${heroPrimaryButton} flex-1 md:flex-none md:min-w-[200px]`}
          >
            <Compass className="w-4 h-4 text-[#D4A338] shrink-0" />
            <span>Explore</span>
          </button>

          <button
            type="button"
            id="hero-sales-dashboard-btn"
            onClick={() => navigateTo('home')}
            className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[180px]`}
          >
            <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
            <span>Dashboard</span>
          </button>
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          id="hero-signin-btn"
          onClick={() => navigateTo('login', { mode: 'login' })}
          className={`${heroPrimaryButton} flex-1 md:flex-none md:min-w-[150px]`}
        >
          <span>Sign in</span>
        </button>

        <button
          type="button"
          id="hero-get-started-btn"
          onClick={() => openAuthModal('signup', 'CREATOR')}
          className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[220px]`}
        >
          <span>Get Started For Free</span>
        </button>
      </>
    );
  };

  /*
   * --------------------------------------------------------------------------
   * MOBILE MENU HELPERS
   * --------------------------------------------------------------------------
   */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleProfileNavigation = () => {
    closeMobileMenu();

    if (isCreator) {
      navigateTo('creator-dashboard');
      return;
    }

    if (isBrand) {
      navigateTo('brand-dashboard');
      return;
    }

    if (isAdmin) {
      navigateTo('admin-dashboard');
      return;
    }

    navigateTo('login');
  };

  const handlePrimaryMobileSearch = () => {
    closeMobileMenu();

    if (isBrand) {
      navigateTo('explore');
      return;
    }

    if (isCreator) {
      navigateTo('opportunities');
      return;
    }

    if (isAdmin || isSales) {
      navigateTo('explore');
      return;
    }

    navigateTo('explore');
  };

  const handleWalletNavigation = () => {
    closeMobileMenu();

    if (isCreator) {
      navigateTo('creator-dashboard');
      return;
    }

    if (isBrand) {
      navigateTo('brand-dashboard');
      return;
    }

    if (isAdmin) {
      navigateTo('admin-dashboard');
      return;
    }

    navigateTo('login');
  };

  /*
   * --------------------------------------------------------------------------
   * RENDER
   * --------------------------------------------------------------------------
   */

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#051126] via-[#071736] to-[#091f48] text-white min-h-screen md:min-h-[740px] flex flex-col justify-between py-4 sm:py-8 px-4 sm:px-6 md:px-[6vw] font-sans w-full max-w-full">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4A338]/10 rounded-full blur-[120px]" />

        <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-blue-600/10 rounded-full blur-[130px]" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER */}
      {/* ------------------------------------------------------------------ */}

      <div className="w-full max-w-xl md:max-w-none mx-auto relative z-20 flex items-center justify-between gap-3 sm:gap-4 pt-2 pb-4 md:grid md:grid-cols-[1fr_64px] md:gap-5 md:pb-6">
        {/* Desktop Logo */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="hidden md:block shrink-0 text-left cursor-pointer select-none"
          aria-label="Go to home"
        >
          <span className="text-3xl lg:text-[3rem] tracking-tight leading-none">
            <span className="text-white font-medium">the</span>
            <span className="text-[#D4A338] font-black">brands</span>
            <span className="text-white font-medium">story</span>
            <span className="text-[#D4A338]">.</span>
          </span>
        </button>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hero-search-form flex-1 relative flex items-center bg-white backdrop-blur-md rounded-full border border-white px-4 sm:px-6 py-2.5 sm:py-3.5 md:absolute md:left-[64%] md:-translate-x-1/2 md:w-[580px] md:h-[54px] md:py-0 md:px-6 transition-all shadow-lg shadow-black/10 group"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#3977c9] shrink-0 mr-2.5 sm:mr-3.5" />

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="hero-search-input w-full bg-transparent text-xs sm:text-base text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />

          {keyword && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setKeyword('')}
              className="text-xs sm:text-sm text-slate-400 hover:text-slate-900 font-bold px-1.5 cursor-pointer shrink-0"
            >
              ✕
            </button>
          )}
        </form>

        {/* Menu */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          title="Open Menu"
          aria-label="Open menu"
          className="hero-menu-button w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[20px] bg-white md:bg-transparent hover:bg-slate-100 text-slate-950 md:text-[#8eb6ff] md:border-2 md:border-[#8eb6ff] flex items-center justify-center transition-all duration-200 shadow-md md:shadow-none cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 stroke-[2]" />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO CONTENT */}
      {/* ------------------------------------------------------------------ */}

      <div className="max-w-2xl md:max-w-none mx-auto w-full text-center md:text-left relative z-10 flex flex-col items-center justify-center my-auto space-y-4 sm:space-y-6 md:grid md:grid-cols-2 md:items-center md:gap-x-0 md:gap-y-10 md:space-y-0">
        {/* Mobile Logo */}
        <button
          type="button"
          className="cursor-pointer group select-none mt-2 md:hidden"
          onClick={() => navigateTo('home')}
          aria-label="Go to home"
        >
          <h2 className="text-[2.35rem] sm:text-5xl font-black tracking-tight leading-none">
            <span className="text-white font-medium">the</span>
            <span className="text-[#D4A338] font-black">brands</span>
            <span className="text-white font-medium">story</span>
            <span className="text-[#D4A338]">.</span>
          </h2>
        </button>

        {/* Main Title */}
        <div className="space-y-2.5 md:space-y-12 max-w-xl mx-auto md:mx-0 md:col-start-1 md:row-start-1 md:self-end">
          <h1 className="text-3xl sm:text-4xl md:text-[2.3rem] font-black tracking-tight text-white leading-tight">
            Your next collab is here
          </h1>

          <div className="space-y-1 md:space-y-3 text-slate-300">
            <p className="text-xs sm:text-sm md:text-[1.45rem] font-semibold text-[#8eb6ff] tracking-wide">
              1,00,000+ Influencers{' '}
              <span className="text-slate-400">|</span>{' '}
              10,000+ Brands
            </p>

            <p className="text-[11px] sm:text-xs md:text-[1.1rem] text-[#8eb6ff]/85 font-medium tracking-normal">
              No Middleman{' '}
              <span className="text-slate-500">•</span> 0% Commission{' '}
              <span className="text-slate-500">•</span> 100% Free
            </p>
          </div>
        </div>

        {/* Creator Illustration */}
        <div className="w-full max-w-[300px] sm:max-w-[420px] md:max-w-[560px] mx-auto py-1 sm:py-2 md:mx-0 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
          <img
            src="/creator-selfie.png"
            alt="Two creators taking a selfie"
            className="block w-full h-auto object-contain drop-shadow-lg"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* HERO ACTIONS */}
        {/* ---------------------------------------------------------------- */}

        <div className="w-full max-w-sm sm:max-w-md md:max-w-none mx-auto pt-2 pb-4 md:mx-0 md:col-start-1 md:row-start-2 md:self-start md:justify-self-start">
          <div className="flex flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 w-full md:w-auto">
            {renderHeroActions()}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE DRAWER */}
      {/* ------------------------------------------------------------------ */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-stretch justify-end p-0 animate-fadeIn"
          onClick={closeMobileMenu}
          role="presentation"
        >
          <div
            className="h-full w-[min(88vw,390px)] bg-[#101b31] shadow-[-20px_0_60px_rgba(0,0,0,0.45)] overflow-hidden border-l border-white/10 flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer Header */}
            <div className="bg-[#0b1b3b] px-6 py-4 flex items-center justify-between">
              <div className="text-xl font-bold tracking-tight select-none">
                <span className="text-white">the</span>
                <span className="text-[#D4A338]">brands</span>
                <span className="text-white">story</span>
                <span className="text-[#D4A338]">.</span>
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <span className="text-sm leading-none">✕</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* User */}
              {authUser ? (
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#D4A338] via-amber-300 to-[#D4A338] shadow-md">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover bg-slate-100"
                          loading="lazy"
                          decoding="async"
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
                      <h4 className="font-extrabold text-white text-sm truncate leading-tight">
                        Hi, {displayName}
                      </h4>

                      <CheckCircle2 className="w-4 h-4 text-[#0095F6] fill-[#0095F6] text-white shrink-0" />
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {displayHandle}
                    </p>

                    <button
                      type="button"
                      onClick={handleProfileNavigation}
                      className="text-[11px] font-bold text-[#D4A338] hover:text-[#f0c75a] mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {isBrand ? 'View Brand Profile' : 'View Profile'}
                      </span>
                      <span className="text-[10px]">›</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pb-4 border-b border-white/10 space-y-3 text-left">
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    India&apos;s biggest influencer &amp; brand collaboration
                    ecosystem.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        navigateTo('login', { mode: 'login' });
                      }}
                      className="flex-1 h-10 rounded-full border border-white/15 text-white font-bold text-xs hover:bg-white/5 text-center transition cursor-pointer"
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        openAuthModal('signup', 'CREATOR');
                      }}
                      className="flex-1 h-10 rounded-full bg-[#D4A338] text-slate-950 font-black text-xs hover:bg-[#be8f2b] text-center transition cursor-pointer"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Search */}
              {authUser && <div>
                <button
                  type="button"
                  onClick={handlePrimaryMobileSearch}
                  className="w-full h-11 px-4 rounded-full bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#D4A338]/25 transition cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />

                  <span>
                    {isBrand
                      ? 'Find Influencers'
                      : isCreator
                        ? 'Find Brands'
                        : 'Explore'}
                  </span>
                </button>
              </div>}

              {/* Menu Items */}
              <div className="space-y-1 text-slate-200 text-xs sm:text-sm font-bold text-left">
                {/* Wishlist */}
                {authUser && <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    openSavedDrawer();
                  }}
                  className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-white fill-white" />
                    <span>Wish list</span>
                  </div>

                  {savedCreatorIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-black">
                      {savedCreatorIds.length}
                    </span>
                  )}
                </button>}

                {/* Pitches */}
                {authUser && <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();

                    if (isCreator) {
                      navigateTo('creator-dashboard');
                    } else if (isBrand) {
                      navigateTo('brand-dashboard');
                    } else if (isAdmin) {
                      navigateTo('admin-dashboard');
                    } else {
                      navigateTo('opportunities');
                    }
                  }}
                  className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-white" />
                    <span>Pitches</span>
                  </div>
                </button>}

                {/* Chat is available to signed-in creators and brands. */}
                {(isCreator || isBrand) && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      navigateTo('chat', {
                        username: isCreator
                          ? matchedCreator?.username || authUser?.name?.toLowerCase().replace(/\s+/g, '-')
                          : displayName.toLowerCase().replace(/\s+/g, '-'),
                      });
                    }}
                    className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>Chat</span>
                  </button>
                )}

                {/* Brand Items */}
                {isBrand && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        navigateTo('brand-dashboard');
                      }}
                      className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4 text-white" />
                      <span>My Campaign</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        navigateTo('brand-dashboard');
                      }}
                      className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-white" />
                      <span>Brand Profile</span>
                    </button>
                  </>
                )}

                {/* Creator / Other Profile */}
                {authUser && !isBrand && (
                  <button
                    type="button"
                    onClick={handleProfileNavigation}
                    className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-white" />
                    <span>My Profile</span>
                  </button>
                )}

                {/* Wallet / Billing */}
                {authUser && <button
                  type="button"
                  onClick={handleWalletNavigation}
                  className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Wallet / Billing</span>
                </button>}

                {/* Help */}
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    navigateTo('blog');
                  }}
                  className="w-full px-3 py-3 rounded-xl hover:bg-white/5 flex items-center gap-3 text-left transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-white" />
                  <span>Help and Support</span>
                </button>

                {/* Logout */}
                {authUser && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    className="w-full px-3 py-3 rounded-xl hover:bg-rose-500/10 flex items-center gap-3 text-left text-rose-400 font-bold transition cursor-pointer mt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Log out</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#0b1b3b] px-6 py-3 border-t border-white/10 text-center">
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                v2.4.1 •{' '}
                {isBrand
                  ? 'Brand Account'
                  : isCreator
                    ? 'Creator Account'
                    : isAdmin
                      ? 'Admin Account'
                      : isSales
                        ? 'Sales Account'
                        : 'Guest Account'}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
