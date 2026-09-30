import React from 'react';
import { Compass, LayoutDashboard, Users } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const HomeHero: React.FC = () => {
  const {
    navigateTo,
    authUser,
    openAuthModal,
  } = usePlatform();

  const isCreator = authUser?.role === 'CREATOR';
  const isBrand = authUser?.role === 'BRAND';
  const isAdmin = authUser?.role === 'ADMIN';
  const isSales = authUser?.role === 'SALES';

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
            id="hero-creator-opportunities-btn"
            onClick={() => navigateTo('opportunities')}
            className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[180px]`}
          >
            <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
            <span>View Opportunities</span>
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
            id="hero-brand-campaigns-btn"
            onClick={() => navigateTo('brand-campaigns', { slug: 'account' })}
            className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[180px]`}
          >
            <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
            <span>My Campaigns</span>
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
          onClick={() => navigateTo('login', { mode: 'signup' })}
          className={`${heroSecondaryButton} flex-1 md:flex-none md:min-w-[220px]`}
        >
          <span>Get Started For Free</span>
        </button>
      </>
    );
  };

  /*
   * --------------------------------------------------------------------------
   * RENDER
   * --------------------------------------------------------------------------
   */

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#051126] via-[#071736] to-[#091f48] text-white min-h-[calc(100dvh-75px)] md:min-h-[680px] flex flex-col justify-center py-8 sm:py-10 px-4 sm:px-6 md:px-[6vw] font-sans w-full max-w-full">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4A338]/10 rounded-full blur-[120px]" />

        <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-blue-600/10 rounded-full blur-[130px]" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO CONTENT */}
      {/* ------------------------------------------------------------------ */}

      <div className="max-w-2xl md:max-w-none mx-auto w-full text-center md:text-left relative z-10 flex flex-col items-center justify-center my-auto space-y-4 sm:space-y-6 md:grid md:grid-cols-2 md:items-center md:gap-x-0 md:gap-y-10 md:space-y-0">

        {/* Main Title */}
        <div className="space-y-2.5 md:space-y-12 max-w-xl mx-auto md:mx-0 md:col-start-1 md:row-start-1 md:self-end">
          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] font-black tracking-tight text-white leading-tight">
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
              <span className="text-slate-500">â€¢</span> 0% Commission{' '}
              <span className="text-slate-500">â€¢</span> 100% Free
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

    </section>
  );
};
