import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const SubPageHeader: React.FC = () => {
  const { authUser, filters, navigateTo, setFilters, creators, partnerBrands, currentView } = usePlatform();
  const [keyword, setKeyword] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Hide completely on home page — hero section has its own header
  if (currentView === 'home') return null;

  const openMenuDestination = () => {
    if (authUser?.role === 'CREATOR') navigateTo('creator-dashboard');
    else if (authUser?.role === 'BRAND') navigateTo('brand-dashboard');
    else if (authUser?.role === 'ADMIN' || authUser?.role === 'SALES') navigateTo('admin-dashboard');
    else navigateTo('login', { mode: 'login' });
  };

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
    <header className="sticky top-0 z-40 bg-[#051126] text-white border-b border-white/10 shadow-lg">
      <div className="w-full px-4 sm:px-6 md:px-10 h-[68px] flex items-center justify-between gap-4">

        {/* LEFT: Logo */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="shrink-0 cursor-pointer select-none"
          aria-label="Go to home"
        >
          <span className="text-[1.65rem] sm:text-[1.9rem] tracking-tight leading-none">
            <span className="font-medium text-white">the</span>
            <span className="font-black text-[#D4A338]">brands</span>
            <span className="font-medium text-white">story</span>
            <span className="text-[#D4A338]">.</span>
          </span>
        </button>

        {/* RIGHT: Search bar + Menu button grouped */}
        <div className="flex items-center gap-3">

          {/* Search bar — white bg, right side, next to menu */}
          <div ref={searchRef} className="relative hidden sm:block">
            <form
              onSubmit={submitSearch}
              className="flex-1 relative flex items-center bg-white backdrop-blur-md rounded-full border border-white px-4 sm:px-6 py-2.5 sm:py-3.5 md:ml-auto md:flex-none md:w-[580px] md:h-[54px] md:py-0 md:px-6 transition-all shadow-lg shadow-black/10 group"
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
                placeholder="Search brands here..."
                className="w-full bg-transparent text-xs sm:text-base text-slate-900 placeholder:text-slate-500 focus:outline-none min-w-0"
              />
              {keyword && (
                <button type="button" aria-label="Clear search" onClick={() => { setKeyword(''); setShowResults(false); }} className="text-xs sm:text-sm text-slate-400 hover:text-slate-900 font-bold px-1.5 cursor-pointer shrink-0">
                  ✕
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
                        onClick={() => { setShowResults(false); setKeyword(''); navigateTo('creator-detail', { creatorId: c.id }); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                      >
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">@{c.username} · {c.primaryCategory} · {c.currentCity}</p>
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
                        onClick={() => { setShowResults(false); setKeyword(''); navigateTo('brand-detail', { brandId: b.id }); }}
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
                    See all results for "{keyword}" →
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
            onClick={openMenuDestination}
            title="Open menu"
            className="w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] md:w-[54px] md:h-[54px] rounded-2xl md:rounded-[20px] bg-white md:bg-transparent hover:bg-slate-100 text-slate-950 md:text-[#8eb6ff] md:border-2 md:border-[#8eb6ff] flex items-center justify-center transition-all duration-200 shadow-md md:shadow-none cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 stroke-[2]" />
          </button>
        </div>

      </div>
    </header>
  );
};
