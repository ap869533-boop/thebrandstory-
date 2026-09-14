import { apiUrl } from '../../config/api';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  Layers,
  ShieldCheck,
  Flame,
  ChevronDown,
  Check,
  Navigation,
  Loader2
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
  } = usePlatform();

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [selectedCity, setSelectedCity] = useState('all');

  const syncCitySelection = (city: string) => {
    setSelectedCity(city);
    setDetectedCityBadge(city === 'all' ? null : city);
  };

  const applyDetectedLocation = async (city: string | null) => {
    if (!city || city === 'all') return;
    syncCitySelection(city);
    sessionStorage.setItem('sc_detected_city', city);
  };

  // Geolocation states
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCityBadge, setDetectedCityBadge] = useState<string | null>(null);

  // Custom Dropdown Open States
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Detect the current location on entry for the search control only.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchCityFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setIsDetectingLocation(false);
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  }, []);

  // Reverse Geocoding API handler for GPS
  const fetchCityFromCoordinates = async (lat: number, lng: number) => {
    setIsDetectingLocation(true);
    try {
      const res = await fetch(apiUrl(`/api/detect-location?lat=${lat}&lng=${lng}`));
      if (!res.ok) {
        throw new Error(`Location lookup failed with status ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || !data.matchedCity) {
        throw new Error('Location lookup did not return a supported city');
      }
      await applyDetectedLocation(data.matchedCity);
    } catch {
      sessionStorage.removeItem('sc_detected_city');
      setSelectedCity('all');
      setDetectedCityBadge(null);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Manual Trigger to re-detect location
  const handleManualLocationDetect = () => {
    setCityDropdownOpen(false);

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser. Please select your city manually.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchCityFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      async (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission was denied. Please allow location access and try again.');
          return;
        }
        alert('We could not detect your location. Please select your city manually.');
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

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
    <section className="relative overflow-hidden bg-black text-white flex-1 flex flex-col justify-center py-4 xs:py-5 sm:py-10 min-h-0 border-b border-zinc-900/60 font-sans w-full max-w-full">
      {/* Subtle Premium Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[450px] bg-[#D4A338]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[400px] bg-[#D4A338]/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center relative z-10 space-y-3 xs:space-y-3.5 sm:space-y-8 my-auto w-full max-w-full">
        {/* 1. Verified Network Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-0.5 sm:py-1.5 bg-black text-zinc-300 text-[9.5px] sm:text-xs font-semibold rounded-full border border-zinc-800 shadow-md max-w-full">
          <span className="w-2 h-2 rounded-full bg-[#D4A338] animate-pulse shrink-0" />
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
          <span className="truncate">India's Biggest Influencer Marketplace</span>
          <span className="hidden xs:inline text-zinc-500">•</span>
          <span className="hidden xs:inline text-[#D4A338] font-bold">50,000+ Verified Creators</span>
        </div>

        {/* 2. Responsive Headline & Subtitle */}
        <div className="space-y-1 sm:space-y-2.5 max-w-3xl mx-auto w-full">
          <h1 className="text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Search Influencers & Promote Your Brand
          </h1>
          <p className="text-[9.5px] xs:text-[11px] sm:text-sm md:text-base text-zinc-400 font-medium max-w-2xl mx-auto leading-snug sm:leading-relaxed">
            Create Profile in Seconds <span className="text-[#D4A338] font-bold">•</span> 100% Free <span className="text-[#D4A338] font-bold">•</span> Trusted Profile
          </p>
        </div>

        {/* 3. 🎯 Fully Responsive Smart Search Bar */}
        <div className="max-w-4xl sm:max-w-5xl mx-auto w-full bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 shadow-2xl border border-[#D4A338]/40 relative z-30">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 w-full">
            {/* Keyword Input */}
            <div className="relative flex-1 w-full flex items-center bg-zinc-950 rounded-xl sm:rounded-2xl border border-zinc-800 hover:border-zinc-700 transition px-3 sm:px-4">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Influencers by name, category or city..."
                className="w-full pl-6 sm:pl-7 pr-3 py-2.5 sm:py-4 bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="text-xs text-zinc-400 hover:text-white font-bold p-1 cursor-pointer"
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
                  className={`w-full bg-zinc-950 rounded-xl sm:rounded-2xl border px-2.5 sm:px-4 py-2.5 sm:py-4 text-[11px] sm:text-xs font-semibold text-zinc-200 flex items-center justify-between gap-1 sm:gap-2 transition cursor-pointer ${
                    categoryDropdownOpen ? 'border-[#D4A338] text-white bg-black' : 'border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                    <Layers className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
                    <span className="truncate">{getSelectedCategoryLabel()}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      categoryDropdownOpen ? 'rotate-180 text-[#D4A338]' : ''
                    }`}
                  />
                </button>

                {/* Popover Menu */}
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 sm:w-72 bg-black text-white rounded-2xl shadow-2xl border border-zinc-800 p-2 z-50 max-h-64 sm:max-h-72 overflow-y-auto text-left space-y-1 animate-fadeIn">
                    <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
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
                          ? 'bg-[#D4A338] text-black font-bold'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
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
                            ? 'bg-[#D4A338] text-black font-bold'
                            : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
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
                  className={`w-full bg-zinc-950 rounded-xl sm:rounded-2xl border px-2.5 sm:px-4 py-2.5 sm:py-4 text-[11px] sm:text-xs font-semibold text-zinc-200 flex items-center justify-between gap-1 sm:gap-2 transition cursor-pointer ${
                    cityDropdownOpen ? 'border-[#D4A338] text-white bg-black' : 'border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
                    <span className="truncate">{getSelectedCityLabel()}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      cityDropdownOpen ? 'rotate-180 text-[#D4A338]' : ''
                    }`}
                  />
                </button>

                {/* Popover Menu with GPS Location option */}
                {cityDropdownOpen && (
                  <div className="absolute top-full right-0 sm:left-0 mt-2 w-56 sm:w-72 bg-black text-white rounded-2xl shadow-2xl border border-zinc-800 p-2 z-50 max-h-64 sm:max-h-80 overflow-y-auto text-left space-y-1 animate-fadeIn">
                    {/* GPS Detect Location Option */}
                    <button
                      type="button"
                      onClick={handleManualLocationDetect}
                      disabled={isDetectingLocation}
                      className="w-full px-2.5 py-1.5 sm:py-2 bg-[#D4A338]/15 hover:bg-[#D4A338]/25 text-[#D4A338] border border-[#D4A338]/30 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-between transition cursor-pointer mb-1"
                    >
                      <div className="flex items-center gap-1.5">
                        {isDetectingLocation ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A338]" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-[#D4A338]" />
                        )}
                        <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect Location'}</span>
                      </div>
                      <span className="text-[9px] bg-[#D4A338] text-black px-1 py-0.2 rounded-md font-black">GPS</span>
                    </button>

                    <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
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
                          ? 'bg-[#D4A338] text-black font-bold'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
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
                            ? 'bg-[#D4A338] text-black font-bold'
                            : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
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
              className="w-full sm:w-12 sm:h-12 py-2.5 sm:py-0 bg-[#D4A338] hover:bg-[#b88628] text-black rounded-xl sm:rounded-2xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-[#D4A338]/30 gap-2 font-bold text-xs sm:text-base"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" />
              <span className="sm:hidden text-black font-bold">Search Influencers</span>
            </button>
          </form>
        </div>

        {/* 4. Responsive 2-Action CTA Row */}
        <div className="pt-0.5 sm:pt-1 flex flex-row items-center justify-center gap-1.5 sm:gap-3 relative z-10 w-full max-w-md mx-auto">
          <button
            type="button"
            id="hero-post-brief-btn"
            onClick={() => {
              if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
              navigateTo('post-requirement');
            }}
            className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#D4A338]/25 transition cursor-pointer whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 text-black shrink-0" />
            <span>Post Campaign</span>
          </button>

          <button
            type="button"
            id="hero-list-free-btn"
            onClick={() => navigateTo('login', { mode: 'signup', role: 'CREATOR' })}
            className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#D4A338]/25 transition cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
            <span>Join as Influencer</span>
          </button>
        </div>
      </div>
    </section>
  );
};
