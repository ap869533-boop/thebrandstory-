import React from 'react';
import { MapPin, IndianRupee, Rocket, ArrowRight } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';
import { matchesCityLocation } from '../../utils/location';

export const RegionalShowcases: React.FC = () => {
  const { creators, setFilters, navigateTo, filters } = usePlatform();

  const cityActive = filters.city && filters.city !== 'all';

  // Helper to check if a creator matches the selected city filter strictly by actual location
  const matchesCity = (c: typeof creators[0]) => {
    if (!cityActive) return true;
    return matchesCityLocation(c.currentCity || '', filters.city);
  };

  // City-specific Creators (uses filter city or defaults to Delhi NCR)
  const cityCreators = creators
    .filter((c) => {
      if (cityActive) return matchesCity(c);
      // Default: Delhi NCR
      return c.currentCity.toLowerCase().includes('delhi') ||
        c.currentCity.toLowerCase().includes('noida') ||
        c.currentCity.toLowerCase().includes('gurgaon');
    })
    .slice(0, 4);

  // Budget Friendly (Under 5k) — also filtered by city
  const budgetCreators = creators
    .filter((c) => c.startingPrice <= 5000 && matchesCity(c))
    .slice(0, 4);

  // Rising Creators — also filtered by city
  const risingCreators = creators
    .filter((c) => (c.isRising || c.engagementRate >= 5.0) && matchesCity(c))
    .slice(0, 4);

  const cityLabel = cityActive ? filters.city : 'Delhi NCR';

  const exploreCity = () => {
    if (cityActive) {
      setFilters((prev) => ({ ...prev, city: filters.city, searchQuery: '', category: 'all' }));
      navigateTo('explore');
    } else {
      setFilters((prev) => ({ ...prev, city: 'Delhi NCR', searchQuery: '', category: 'all' }));
      navigateTo('city-page', { citySlug: 'delhi' });
    }
  };

  const exploreBudget = () => {
    setFilters((prev) => ({ ...prev, priceRange: 'under-5k', searchQuery: '', category: 'all', city: filters.city || 'all' }));
    navigateTo('explore');
  };

  const exploreRising = () => {
    setFilters((prev) => ({ ...prev, sortBy: 'rising', searchQuery: '', category: 'all', city: filters.city || 'all' }));
    navigateTo('explore');
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-8 sm:py-12 bg-white font-sans w-full max-w-full overflow-hidden">
      {/* 1. City Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4A338]" />
              <span>{cityActive ? `${filters.city} Spotlight` : 'Capital Region Spotlight'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top Influencers in {cityLabel}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              {cityActive
                ? `Verified creators based in ${filters.city} across all categories`
                : 'Verified lifestyle, fashion, food & tech creators based in Delhi, Noida & Gurgaon'}
            </p>
          </div>

          <button
            onClick={exploreCity}
            className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All {cityLabel} Influencers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {cityCreators.length > 0 ? cityCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          )) : (
            <div className="col-span-full text-center py-6">
              <p className="text-sm text-slate-400 font-medium">No creators found in {cityLabel}.</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Budget-Friendly Under ₹5,000 */}
      <section className="bg-slate-50/70 py-8 sm:py-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[#D4A338] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1">
                <IndianRupee className="w-3.5 h-3.5 text-[#D4A338]" />
                <span>High ROI for Startups & Local Outlets</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Budget-Friendly Influencers{cityActive ? ` in ${filters.city}` : ''} (Under ₹5,000 & Barter)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                High-converting micro-influencers with engaged niche communities and affordable pricing
              </p>
            </div>

            <button
              onClick={exploreBudget}
              className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer self-start sm:self-auto"
            >
              <span>View All Budget Creators</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {budgetCreators.length > 0 ? budgetCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            )) : (
              <div className="col-span-full text-center py-6">
                <p className="text-sm text-slate-400 font-medium">No budget-friendly creators found{cityActive ? ` in ${filters.city}` : ''}.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Rising Stars & High Engagement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1">
              <Rocket className="w-3.5 h-3.5 text-[#D4A338]" />
              <span>Fastest Growing Talents</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rising Stars{cityActive ? ` in ${filters.city}` : ''} & Viral Creators
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              High-growth influencers with industry-leading organic engagement rates &gt;5.0%
            </p>
          </div>

          <button
            onClick={exploreRising}
            className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer self-start sm:self-auto"
          >
            <span>Discover Rising Talents</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {risingCreators.length > 0 ? risingCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          )) : (
            <div className="col-span-full text-center py-6">
              <p className="text-sm text-slate-400 font-medium">No rising creators found{cityActive ? ` in ${filters.city}` : ''}.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
