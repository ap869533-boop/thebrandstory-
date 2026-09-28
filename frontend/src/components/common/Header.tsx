import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Sparkles,
  Heart,
  Bell,
  Scale,
  Menu,
  X,
  PlusCircle,
  Flame,
  ChevronDown,
  User,
  ArrowRight,
  Compass,
  Megaphone,
  CreditCard,
  HelpCircle,
  LogOut,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentView,
    navigateTo,
    currentRole,
    setCurrentRole,
    filters,
    setFilters,
    savedCreatorIds,
    openSavedDrawer,
    compareList,
    setCompareDrawerOpen,
    openOnboardingModal,
    openAuthModal,
    authUser,
    logout,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    siteLogo,
    requireRole,
    creators,
  } = usePlatform();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeDropdownsOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', closeDropdownsOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeDropdownsOnOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isHome = currentView === 'home';
  const isCreator = authUser?.role === 'CREATOR';
  const isBrand = authUser?.role === 'BRAND';
  const isAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'SALES';

  // Get current user display info
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

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md transition-all font-sans ${
          isHome
            ? 'bg-[#061226]/90 border-b border-slate-800/80 text-white'
            : 'bg-white/95 border-b border-slate-200/80 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 1. Left: Official Brand Logo */}
            <div
              id="logo-brand-btn"
              onClick={() => navigateTo('home')}
              className="cursor-pointer flex items-center group shrink-0"
            >
              <div className="text-2xl sm:text-3xl tracking-tighter">
                <span className={`font-normal ${isHome ? 'text-white' : 'text-slate-950'}`}>the</span>
                <span className="font-bold text-[#D4A338]">brands</span>
                <span className={`font-normal ${isHome ? 'text-white' : 'text-slate-950'}`}>story</span>
                <span className="font-bold text-[#D4A338]">.</span>
              </div>
            </div>

            {/* 2. Center: Clean Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
              <button
                id="nav-opportunities-btn"
                onClick={() => navigateTo('opportunities')}
                className={`transition flex items-center gap-1.5 py-1 cursor-pointer ${
                  currentView === 'opportunities'
                    ? 'text-[#D4A338] font-bold'
                    : isHome
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A338]" />
                <span>Live Opportunities</span>
              </button>

              <button
                id="nav-explore-btn"
                onClick={() => navigateTo('explore')}
                className={`transition py-1 cursor-pointer ${
                  currentView === 'explore'
                    ? 'text-[#D4A338] font-bold'
                    : isHome
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Find Creators</span>
              </button>

              <button
                id="nav-post-req-header-btn"
                onClick={() => {
                  if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                  navigateTo('post-requirement');
                }}
                className={`transition py-1 cursor-pointer font-bold ${
                  currentView === 'post-requirement'
                    ? 'text-[#D4A338]'
                    : isHome
                    ? 'text-[#f5c35b] hover:text-[#D4A338]'
                    : 'text-[#D4A338] hover:text-[#b88628]'
                }`}
              >
                <span>+ Post Requirement</span>
              </button>
            </nav>

            {/* 3. Right: Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Compare Shortcut */}
              {compareList.length > 0 && (
                <button
                  onClick={() => setCompareDrawerOpen(true)}
                  title="Compare Creators"
                  className={`hidden sm:flex relative p-2 rounded-xl transition cursor-pointer ${
                    isHome ? 'text-slate-300 hover:text-[#D4A338] hover:bg-white/10' : 'text-slate-600 hover:text-[#D4A338] hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#D4A338] text-black rounded-full text-[8px] font-bold flex items-center justify-center">
                    {compareList.length}
                  </span>
                </button>
              )}

              {/* Saved Heart Shortcut */}
              <button
                id="header-saved-btn"
                onClick={openSavedDrawer}
                title={`Saved Wishlist (${savedCreatorIds.length})`}
                className={`hidden sm:flex p-2 rounded-xl transition-all relative cursor-pointer items-center gap-1 ${
                  savedCreatorIds.length > 0
                    ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                    : isHome
                    ? 'text-slate-300 hover:text-rose-400 hover:bg-white/10'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${savedCreatorIds.length > 0 ? 'fill-rose-500' : ''}`} />
                {savedCreatorIds.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full leading-none">
                    {savedCreatorIds.length}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <div ref={notificationRef} className="relative hidden sm:block">
                <button
                  id="header-notif-btn"
                  onClick={() => {
                    setShowNotifDropdown((open) => !open);
                    setShowRoleDropdown(false);
                  }}
                  className={`p-2 rounded-xl transition relative cursor-pointer ${
                    isHome ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4A338] rounded-full ring-2 ring-[#061226]" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-fadeIn text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-[#b88628] font-bold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-2.5 rounded-xl transition cursor-pointer ${
                              notif.read ? 'bg-slate-50 text-slate-500' : 'bg-amber-50/70 text-slate-800 font-semibold'
                            }`}
                          >
                            <p className="text-xs">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop User / Auth Button */}
              {authUser ? (
                <div ref={profileMenuRef} className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      setShowRoleDropdown((open) => !open);
                      setShowNotifDropdown(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition text-xs font-bold cursor-pointer ${
                      isHome
                        ? 'border-slate-700 bg-[#0d224b]/80 text-white hover:border-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D4A338] text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-60 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn text-xs space-y-1">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <span className="font-bold text-slate-900 block truncate">{displayName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{displayHandle}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#D4A338]/15 text-[#8e6819] text-[10px] font-black uppercase">
                          {authUser.role} Account
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          if (isCreator) navigateTo('creator-dashboard');
                          else if (isBrand) navigateTo('brand-dashboard');
                          else if (isAdmin) navigateTo('admin-dashboard');
                          else navigateTo('home');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span>
                          {isCreator ? 'Creator Dashboard' : isBrand ? 'Brand Dashboard' : 'Admin Panel'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowRoleDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition cursor-pointer flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('login')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition cursor-pointer ${
                      isHome ? 'text-white hover:text-[#D4A338]' : 'text-slate-700 hover:text-[#D4A338]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup', 'CREATOR')}
                    className="bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer shadow-sm shadow-[#D4A338]/30"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Hamburger Menu Button (Matches Screenshot 1 top right) */}
              <button
                data-mobile-menu
                onClick={() => setMobileMenuOpen(true)}
                title="Open Menu"
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                  isHome
                    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-md'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Menu className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 🎯 FLOATING POPUP DRAWER MODAL (Exact design from Screenshots 4 & 5) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-end sm:items-center sm:justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-[340px] bg-white rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden border border-slate-100 flex flex-col my-auto animate-scaleUp"
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
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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

                  <div className="min-w-0 flex-1">
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
                <div className="pb-3 border-b border-slate-100 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Connect with thousands of brands and creators across India.
                  </p>
                  <div className="flex gap-2">
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

              {/* Gold Primary Search Button (Screenshots 4 & 5) */}
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

              {/* Navigation Items List with Clean Icons */}
              <div className="space-y-1 text-slate-700 text-xs sm:text-sm font-bold">
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

                {/* Brand specific or Creator specific menu items */}
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

            {/* Drawer Footer Tag */}
            <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                v2.4.1 • {isBrand ? 'Brand Account' : isCreator ? 'Creator Account' : 'Guest Account'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
