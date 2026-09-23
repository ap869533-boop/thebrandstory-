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
  ArrowRight
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
    requireRole
  } = usePlatform();

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery);
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
      if (target instanceof Element && !target.closest('[data-mobile-menu]')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeDropdownsOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeDropdownsOnOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleDropdown(false);
    if (role === 'CREATOR') navigateTo('creator-dashboard');
    else if (role === 'BRAND') navigateTo('brand-dashboard');
    else if (role === 'ADMIN' || role === 'SALES') navigateTo('admin-dashboard');
    else navigateTo('home');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Left: Official Brand Logo */}
          <div
            id="logo-brand-btn"
            onClick={() => navigateTo('home')}
            className="cursor-pointer flex items-center group shrink-0"
          >
            <div className="text-2xl sm:text-3xl tracking-tighter">
              <span className="font-normal text-black">the</span>
              <span className="font-bold text-[#D4A338]">brands</span>
              <span className="font-normal text-black">story</span>
              <span className="font-bold text-[#D4A338]">.</span>
            </div>
          </div>

          {/* 2. Center: Clean & Spacious Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              id="nav-opportunities-btn"
              onClick={() => navigateTo('opportunities')}
              className={`hover:text-slate-900 transition flex items-center gap-1.5 py-1 cursor-pointer ${
                currentView === 'opportunities' ? 'text-[#D4A338] font-bold' : ''
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A338]" />
              <span>Live Collaboration</span>
            </button>

            <button
              id="nav-post-req-header-btn"
              onClick={() => {
                if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                navigateTo('post-requirement');
              }}
              className={`hover:text-[#D4A338] transition py-1 cursor-pointer ${
                currentView === 'post-requirement' ? 'text-[#D4A338] font-bold' : ''
              }`}
            >
              <span>+ Post Requirement</span>
            </button>
          </nav>

          {/* 3. Right: Clean Minimal Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Compare Shortcut if items active - hidden on mobile */}
            {compareList.length > 0 && (
              <button
                onClick={() => setCompareDrawerOpen(true)}
                title="Compare Creators"
                className="hidden sm:flex relative p-2 rounded-lg text-slate-600 hover:text-[#D4A338] hover:bg-slate-100 transition cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#D4A338] text-black rounded-full text-[8px] font-bold flex items-center justify-center">
                  {compareList.length}
                </span>
              </button>
            )}

            {/* Saved Heart Shortcut - hidden on mobile */}
            <button
              id="header-saved-btn"
              onClick={openSavedDrawer}
              title={`Saved Creators (${savedCreatorIds.length})`}
              className={`hidden sm:flex p-2 rounded-xl transition-all relative cursor-pointer items-center gap-1 ${
                savedCreatorIds.length > 0
                  ? 'text-rose-600 bg-rose-50/80 hover:bg-rose-100 hover:text-rose-700'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${savedCreatorIds.length > 0 ? 'fill-rose-600' : ''}`} />
              {savedCreatorIds.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-full leading-none">
                  {savedCreatorIds.length}
                </span>
              )}
            </button>

            {/* Notifications - hidden on mobile */}
            <div ref={notificationRef} className="relative hidden sm:block">
              <button
                id="header-notif-btn"
                onClick={() => {
                  setShowNotifDropdown(open => !open);
                  setShowRoleDropdown(false);
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4A338] rounded-full" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-fadeIn text-xs space-y-3">
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
                            notif.read ? 'bg-slate-50 text-slate-500' : 'bg-amber-50/60 text-slate-800 font-semibold'
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

            {/* User Profile / Auth Action */}
            {authUser ? (
              <div ref={profileMenuRef} className="relative hidden sm:block">
                <button
                  onClick={() => {
                    setShowRoleDropdown(open => !open);
                    setShowNotifDropdown(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D4A338] text-black flex items-center justify-center text-[10px] font-bold">
                    {authUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{authUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Menu Popover */}
                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn text-xs space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <span className="font-bold text-slate-900 block truncate">{authUser.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{authUser.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#D4A338]/15 text-[#8e6819] text-[10px] font-black uppercase">
                        {authUser.role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        if (authUser.role === 'CREATOR') navigateTo('creator-dashboard');
                        else if (authUser.role === 'BRAND') navigateTo('brand-dashboard');
                        else if (authUser.role === 'ADMIN' || authUser.role === 'SALES') navigateTo('admin-dashboard');
                        else navigateTo('home');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span>
                        {authUser.role === 'CREATOR'
                          ? 'Creator Dashboard'
                          : authUser.role === 'BRAND'
                          ? 'Brand Dashboard'
                          : authUser.role === 'ADMIN'
                          ? 'Admin Control Panel'
                          : 'My Dashboard'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#b88628] transition cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Primary CTA Button - available only to logged-out visitors */}
            {!authUser && (
              <button
                id="header-list-free-btn"
                onClick={() => openAuthModal('signup')}
                className="hidden sm:inline-flex bg-[#D4A338] hover:bg-[#b88628] text-black px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer items-center gap-1 shrink-0 shadow-sm"
              >
                <span>List Free</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              data-mobile-menu
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div data-mobile-menu className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-fadeIn text-xs font-medium">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigateTo('opportunities');
            }}
            className="w-full p-2.5 bg-slate-50 rounded-lg text-left flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Live Collaboration</span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
              navigateTo('post-requirement');
            }}
            className="w-full p-2.5 bg-slate-50 text-slate-700 rounded-lg text-left flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-[#D4A338]" />
            <span>+ Post Requirement</span>
          </button>
          {/* Mobile-only account actions */}
          <div className="flex gap-2 pt-1">
            {authUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (authUser.role === 'CREATOR') navigateTo('creator-dashboard');
                    else if (authUser.role === 'BRAND') navigateTo('brand-dashboard');
                    else if (authUser.role === 'ADMIN' || authUser.role === 'SALES') navigateTo('admin-dashboard');
                    else navigateTo('home');
                  }}
                  className="flex-1 p-2.5 bg-slate-900 text-white rounded-lg text-center font-bold text-xs"
                >
                  {authUser.role === 'CREATOR'
                    ? 'Creator Dashboard'
                    : authUser.role === 'BRAND'
                    ? 'Brand Dashboard'
                    : 'Admin Dashboard'}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-2.5 bg-rose-50 text-rose-600 rounded-lg text-center font-bold text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); navigateTo('login'); }}
                className="flex-1 p-2.5 bg-slate-50 text-slate-700 rounded-lg text-center font-bold text-xs"
              >
                Sign In
              </button>
            )}
            {!authUser && (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal('signup'); }}
                className="flex-1 p-2.5 bg-[#D4A338] text-black rounded-lg text-center font-bold text-xs hover:bg-[#b88628] transition"
              >
                List Influencer Free
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
