import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  Layers,
  Briefcase,
  ChevronDown,
  Check,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CATEGORIES_LIST, CITIES_LIST } from '../../data/initialData';

export const HomeHero: React.FC = () => {
  const {
    filters,
    setFilters,
    navigateTo,
    categories,
    cities,
    requireRole,
    authUser,
  } = usePlatform();

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [selectedCity, setSelectedCity] = useState(
    filters.city && filters.city !== 'all' ? filters.city : 'all'
  );

  const syncCitySelection = (city: string) => {
    setSelectedCity(city);
  };

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilters({
      ...filters,
      searchQuery: keyword,
      category: selectedCategory,
      city: selectedCity,
    });
    navigateTo('explore');
  };

  const getSelectedCategoryLabel = () => {
    if (selectedCategory === 'all') return 'All Categories';
    return selectedCategory;
  };

  const getSelectedCityLabel = () => {
    if (selectedCity === 'all') return 'All India';
    return selectedCity;
  };

  return (
    <section className="relative overflow-hidden bg-transparent text-slate-900 flex-1 flex flex-col justify-center py-4 xs:py-5 sm:py-10 min-h-0 border-b border-slate-200/80 font-sans w-full max-w-full">
      {/* Subtle Premium Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[450px] bg-[#D4A338]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[400px] bg-[#D4A338]/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center relative z-10 space-y-3 xs:space-y-3.5 sm:space-y-8 my-auto w-full max-w-full">
        {/* Headline */}
        <div className="max-w-5xl mx-auto w-full pt-0 pb-2.5 xs:pb-3.5 sm:pb-4">
          <h1 className="font-sans text-[22px] xs:text-[27px] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none whitespace-nowrap text-slate-900">
            Biggest Influencer Marketplace
          </h1>
        </div>

        {/* 3. 🎯 Fully Responsive Smart Search Bar */}
        <div className="max-w-4xl sm:max-w-5xl mx-auto w-full bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200 relative z-30">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 w-full">
            {/* Keyword Input */}
            <div className="relative flex-1 w-full flex items-center bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-slate-300 transition px-3 sm:px-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Influencers by name, category or city..."
                className="w-full pl-6 sm:pl-7 pr-3 py-2.5 sm:py-4 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdowns: 2-Col Grid on Mobile, Side-by-side on Desktop */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
              {/* Category Dropdown */}
              <div ref={categoryRef} className="relative w-full sm:w-52">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryDropdownOpen(!categoryDropdownOpen);
                    setCityDropdownOpen(false);
                  }}
                  className={`w-full bg-slate-50 rounded-xl sm:rounded-2xl border px-2.5 sm:px-4 py-2.5 sm:py-4 text-[11px] sm:text-xs font-semibold text-slate-700 flex items-center justify-between gap-1 sm:gap-2 transition cursor-pointer ${
                    categoryDropdownOpen ? 'border-[#D4A338] text-slate-900 bg-white ring-2 ring-[#D4A338]/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                    <Layers className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
                    <span className="truncate">{getSelectedCategoryLabel()}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      categoryDropdownOpen ? 'rotate-180 text-[#D4A338]' : ''
                    }`}
                  />
                </button>

                {/* Popover Menu */}
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 sm:w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 sm:max-h-72 overflow-y-auto text-left space-y-1 animate-fadeIn">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Select Category
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-[#D4A338] text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((cat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          selectedCategory === cat.name
                            ? 'bg-[#D4A338] text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {selectedCategory === cat.name && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Dropdown */}
              <div ref={cityRef} className="relative w-full sm:w-48">
                <button
                  type="button"
                  onClick={() => {
                    setCityDropdownOpen(!cityDropdownOpen);
                    setCategoryDropdownOpen(false);
                  }}
                  className={`w-full bg-slate-50 rounded-xl sm:rounded-2xl border px-2.5 sm:px-4 py-2.5 sm:py-4 text-[11px] sm:text-xs font-semibold text-slate-700 flex items-center justify-between gap-1 sm:gap-2 transition cursor-pointer ${
                    cityDropdownOpen ? 'border-[#D4A338] text-slate-900 bg-white ring-2 ring-[#D4A338]/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
                    <span className="truncate">{getSelectedCityLabel()}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      cityDropdownOpen ? 'rotate-180 text-[#D4A338]' : ''
                    }`}
                  />
                </button>

                {cityDropdownOpen && (
                  <div className="absolute top-full right-0 sm:left-0 mt-2 w-56 sm:w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 sm:max-h-80 overflow-y-auto text-left space-y-1 animate-fadeIn">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Select City
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        syncCitySelection('all');
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                        selectedCity === 'all'
                          ? 'bg-[#D4A338] text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>All India</span>
                      {selectedCity === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          syncCitySelection(c.name);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          selectedCity === c.name
                            ? 'bg-[#D4A338] text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {selectedCity === c.name && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button (Full width bar on mobile, icon button on desktop) */}
            <button
              type="submit"
              id="hero-search-btn"
              title="Search Influencers"
              className="w-full sm:w-12 sm:h-12 py-2.5 sm:py-0 bg-[#D4A338] hover:bg-[#b88628] text-white rounded-xl sm:rounded-2xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-[#D4A338]/30 gap-2 font-bold text-xs sm:text-base"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
              <span className="sm:hidden text-white font-bold">Search Influencers</span>
            </button>
          </form>
        </div>

        {/* 4. Responsive 2-Action CTA Row */}
        <div className="pt-0.5 sm:pt-1 flex flex-row items-center justify-center gap-1.5 sm:gap-3 relative z-10 w-full max-w-md mx-auto">
          <button
            type="button"
            id="hero-join-brand-btn"
            onClick={() => {
              if (authUser?.role === 'BRAND') {
                navigateTo('brand-dashboard');
                return;
              }
              navigateTo('login', { mode: 'signup', role: 'BRAND' });
            }}
            className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#D4A338] hover:bg-[#b88628] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#D4A338]/25 transition cursor-pointer whitespace-nowrap"
          >
            <Briefcase className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Join as a Brand</span>
          </button>

          <button
            type="button"
            id="hero-list-free-btn"
            onClick={() => navigateTo('login', { mode: 'signup', role: 'CREATOR' })}
            className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/15 transition cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
            <span>Join as Influencer</span>
          </button>
        </div>
      </div>
    </section>
  );
};
