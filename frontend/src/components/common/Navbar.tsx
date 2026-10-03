import React, { useState, useRef, useEffect } from 'react';
import { Heart, HelpCircle, LogOut, Menu, Megaphone, MessageCircle, Search, User, Wallet, X } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { apiUrl, authHeaders } from '../../config/api';

export const Navbar: React.FC = () => {
  const { authUser, filters, navigateTo, setFilters, creators, partnerBrands, openAuthModal, openSavedDrawer, logout } = usePlatform();
  const [keyword, setKeyword] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [navLogo, setNavLogo] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.role === 'BRAND') {
      fetch(apiUrl('/api/brands/profile'), { headers: authHeaders() })
        .then(res => res.json())
        .then(data => {
          if (data.profile?.logoUrl) {
            setNavLogo(data.profile.logoUrl);
          }
        })
        .catch(() => { });
    } else if (authUser?.role === 'CREATOR' && authUser.creatorProfile?.avatar) {
      setNavLogo(authUser.creatorProfile.avatar);
    } else if (authUser?.avatar || (authUser as any)?.logoUrl) {
      setNavLogo(authUser?.avatar || (authUser as any)?.logoUrl);
    } else {
      setNavLogo(null);
    }
  }, [authUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isCreator = authUser?.role === 'CREATOR';
  const isBrand = authUser?.role === 'BRAND';
  const accountSlug = (authUser?.companyName || authUser?.name || 'account').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const closeMenu = () => setMenuOpen(false);
  const goTo = (view: string, params?: any) => { closeMenu(); navigateTo(view, params); };

  const q = keyword.trim().toLowerCase();

  const matchedCreators = q.length >= 2
    ? creators.filter(c =>
      c.status === 'active' &&
      (c.name?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q) ||
        c.primaryCategory?.toLowerCase().includes(q) ||
        c.currentCity?.toLowerCase().includes(q))
    ).slice(0, 5)
    : [];

  const matchedBrands = q.length >= 2 && partnerBrands
    ? partnerBrands.filter((b: any) =>
      b.name?.toLowerCase().includes(q) ||
      b.brandName?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    ).slice(0, 3)
    : [];

  const hasResults = matchedCreators.length > 0 || matchedBrands.length > 0;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = keyword.trim();
    if (!searchQuery) return;
    setShowResults(false);
    setFilters({ ...filters, searchQuery });
    navigateTo('explore');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#051126] text-white border-b border-white/10 shadow-lg">
      <div className="w-full px-5 sm:px-8 md:px-[6vw] h-[75px] sm:h-[80px] flex items-center justify-between gap-4">

        {/* LEFT: Logo */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="shrink-0 cursor-pointer select-none"
          aria-label="Go to home"
        >
          <span className="text-[1.4rem] sm:text-[1.6rem] lg:text-[1.8rem] tracking-tight leading-none">
            <span className="font-medium text-white">the</span>
            <span className="font-black text-[#D4A338]">brands</span>
            <span className="font-medium text-white">story</span>
            <span className="text-[#D4A338]">.</span>
          </span>
        </button>

        {/* RIGHT: Search bar + Menu button grouped */}
        <div className="flex items-center gap-5 sm:gap-6">

          {/* Search bar â€” white bg, right side, next to menu */}
          <div ref={searchRef} className="relative hidden sm:block">
            <form
              onSubmit={submitSearch}
              className="subpage-search-form flex-1 relative flex items-center bg-white backdrop-blur-md rounded-full border border-white px-3 sm:px-5 py-1.5 sm:py-2 md:ml-auto md:flex-none md:w-[480px] lg:w-[600px] md:h-[36px] lg:h-[40px] md:py-0 md:px-5 transition-all shadow-lg shadow-black/10 group"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#3977c9] shrink-0 mr-2.5 sm:mr-3.5" />
              <input
                type="search"
                value={keyword}
                onChange={e => {
                  setKeyword(e.target.value);
                  setShowResults(e.target.value.trim().length >= 2);
                }}
                onFocus={() => keyword.trim().length >= 2 && setShowResults(true)}
                placeholder="Search Influencer here..."
                className="subpage-search-input w-full bg-transparent text-xs sm:text-base text-slate-900 placeholder:text-slate-500 focus:outline-none min-w-0"
              />
              {keyword && (
                <button type="button" aria-label="Clear search" onClick={() => { setKeyword(''); setShowResults(false); }} className="text-xs sm:text-sm text-slate-400 hover:text-slate-900 font-bold px-1.5 cursor-pointer shrink-0">
                  clear
                </button>
              )}
            </form>

            {/* Live Dropdown Results */}
            {showResults && hasResults && (
              <div className="absolute top-[52px] right-0 w-full min-w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-slate-900">
                {matchedCreators.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Creators</p>
                    {matchedCreators.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setShowResults(false); setKeyword(''); navigateTo('creator-detail', { id: c.id }); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                      >
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">@{c.username} Â· {c.primaryCategory} Â· {c.currentCity}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {matchedBrands.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Brands</p>
                    {matchedBrands.map((b: any) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => { setShowResults(false); setKeyword(''); navigateTo('brand-detail', { id: b.id }); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {b.logoUrl
                            ? <img src={b.logoUrl} alt={b.name || b.brandName} className="w-full h-full object-cover" />
                            : <span className="text-xs font-black text-slate-400">{(b.name || b.brandName || 'B')[0]}</span>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{b.name || b.brandName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{b.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-4 py-2.5 border-t border-slate-100">
                  <button type="button" onClick={submitSearch} className="text-[11px] font-bold text-[#D4A338] hover:underline cursor-pointer">
                    See all results for "{keyword}" ’
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: search icon only */}
          <button
            type="button"
            onClick={() => { setFilters({ ...filters, searchQuery: '' }); navigateTo('explore'); }}
            className="sm:hidden w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-slate-300 hover:bg-white/10 transition cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Three-line (hamburger) Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            title="Open menu"
            className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-xl md:rounded-[14px] bg-white md:bg-transparent hover:bg-slate-100 text-slate-950 md:text-[#8eb6ff] md:border-2 md:border-[#8eb6ff] flex items-center justify-center transition-all duration-200 shadow-md md:shadow-none cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 stroke-[2]" />
          </button>
        </div>

      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" onClick={closeMenu}>
          <aside className="flex h-full w-[min(88vw,390px)] flex-col bg-[#101b31] shadow-[-20px_0_60px_rgba(0,0,0,0.45)]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1b3b] px-6 py-5">
              <span className="text-xl font-bold tracking-tight"><span>the</span><span className="text-[#D4A338]">brands</span><span>story</span><span className="text-[#D4A338]">.</span></span>
              <button type="button" onClick={closeMenu} aria-label="Close menu" className="rounded-full p-2 text-white hover:bg-white/10 cursor-pointer"><X className="h-6 w-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!authUser ? (
                <div className="space-y-4">
                  <button type="button" onClick={() => goTo('login', { mode: 'login' })} className="h-11 w-full rounded-full border border-white/20 text-sm font-bold text-white hover:bg-white/10 cursor-pointer">Sign In</button>
                  <button type="button" onClick={() => goTo('login', { mode: 'signup', role: 'CREATOR' })} className="h-11 w-full rounded-full bg-[#D4A338] text-sm font-black text-slate-950 hover:bg-[#be8f2b] cursor-pointer">Get Started For Free</button>
                  <div className="mt-6 border-t border-white/10 pt-4"><button type="button" onClick={() => goTo('blog')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-bold hover:bg-white/10 cursor-pointer"><HelpCircle className="h-5 w-5" />Help and Support</button></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#D4A338] bg-[#0b1b3b] overflow-hidden font-black text-lg text-white">
                      {navLogo ? (
                        <img src={navLogo} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        (authUser.name || authUser.companyName || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0"><p className="truncate font-extrabold">Hi, {authUser.name || authUser.companyName}</p><p className="truncate text-xs text-slate-400">{isBrand ? authUser.companyName : `@${authUser.name?.toLowerCase().replace(/\s+/g, '_')}`}</p><button type="button" onClick={() => isBrand ? goTo('brand-profile', { slug: accountSlug }) : goTo('creator-detail', { username: authUser.creatorProfile?.username || accountSlug })} className="mt-1 text-xs font-bold text-[#D4A338] cursor-pointer">View Profile ›</button></div>
                  </div>

                  <button type="button" onClick={() => goTo(isBrand ? 'explore' : 'opportunities')} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#D4A338] font-black text-slate-950 hover:bg-[#be8f2b] cursor-pointer"><Search className="h-5 w-5" />{isBrand ? 'Find Influencers' : 'Find Brands'}</button>
                  <nav className="mt-5 space-y-1 text-sm font-bold">
                    <button type="button" onClick={() => { closeMenu(); openSavedDrawer(); }} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-white/10 cursor-pointer"><Heart className="h-5 w-5" />Wish list</button>
                    {isBrand && <button type="button" onClick={() => goTo('brand-campaigns', { slug: accountSlug })} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-white/10 cursor-pointer"><Megaphone className="h-5 w-5" />My Campaigns</button>}
                    <button type="button" onClick={() => goTo('pitches', { username: accountSlug })} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-white/10 cursor-pointer"><Megaphone className="h-5 w-5" />Pitches</button>
                    <button type="button" onClick={() => goTo('wallet')} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-white/10 cursor-pointer"><Wallet className="h-5 w-5" />Wallet / Billing</button>
                    <button type="button" onClick={() => goTo('help-support')} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-white/10 cursor-pointer"><HelpCircle className="h-5 w-5" />Help and Support</button>
                  </nav>
                  <button type="button" onClick={() => { closeMenu(); logout(); }} className="mt-6 flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left font-bold text-rose-400 hover:bg-rose-500/10 cursor-pointer"><LogOut className="h-5 w-5" />Log out</button>
                </>
              )}
            </div>
            <div className="border-t border-white/10 bg-[#0b1b3b] px-6 py-4 text-center text-[11px] text-slate-500">{isBrand ? 'Brand' : isCreator ? 'Creator' : 'Admin'} Account</div>
          </aside>
        </div>
      )}
    </header>
  );
};
