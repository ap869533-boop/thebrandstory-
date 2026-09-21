import React, { useRef } from 'react';
import { MapPin, IndianRupee, Rocket, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';

export const RegionalShowcases: React.FC = () => {
  const { creators, setFilters, navigateTo } = usePlatform();
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const budgetScrollRef = useRef<HTMLDivElement>(null);

  const cityCreators = creators
    .filter((c) => {
      if (c.status !== 'active') return false;
      const city = (c.currentCity || '').toLowerCase();
      return city.includes('delhi') || city.includes('noida') || city.includes('gurgaon');
    })
    .slice(0, 10);

  const budgetCreators = creators
    .filter((c) => c.status === 'active' && c.startingPrice <= 5000)
    .slice(0, 10);

  const risingCreators = creators
    .filter((c) => c.status === 'active' && c.isRising)
    .slice(0, 4);

  const exploreCity = () => {
    setFilters((prev) => ({ ...prev, city: 'Delhi NCR', searchQuery: '', category: 'all' }));
    navigateTo('city-page', { citySlug: 'delhi' });
  };

  const exploreBudget = () => {
    setFilters((prev) => ({ ...prev, priceRange: 'under-5k', searchQuery: '', category: 'all', city: 'all' }));
    navigateTo('explore');
  };

  const exploreRising = () => {
    setFilters((prev) => ({ ...prev, sortBy: 'rising', searchQuery: '', category: 'all', city: 'all' }));
    navigateTo('explore');
  };

  const scrollCards = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    ref.current?.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-8 sm:py-12 bg-white font-sans w-full max-w-full overflow-hidden">
      {/* 1. City Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4A338]" />
              <span>Capital Region Spotlight</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top Influencers in Delhi NCR
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              Verified lifestyle, fashion, food & tech creators based in Delhi, Noida & Gurgaon
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex gap-1">
              <button type="button" onClick={() => scrollCards(cityScrollRef, 'left')} aria-label="Previous Delhi NCR influencers" className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={() => scrollCards(cityScrollRef, 'right')} aria-label="Next Delhi NCR influencers" className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button onClick={exploreCity} className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer">
              <span>Explore All Delhi NCR Influencers</span><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        <div ref={cityScrollRef} className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
          {cityCreators.length > 0 ? cityCreators.map((creator) => (
            <div key={creator.id} className="shrink-0 snap-start"><CreatorCard creator={creator} variant="carousel" /></div>
          )) : (
            <div className="col-span-full text-center py-6">
              <p className="text-sm text-slate-400 font-medium">No creators found in Delhi NCR.</p>
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
                Budget-Friendly Influencers (Under ₹5,000 & Barter)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                High-converting micro-influencers with engaged niche communities and affordable pricing
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex gap-1">
                <button type="button" onClick={() => scrollCards(budgetScrollRef, 'left')} aria-label="Previous budget influencers" className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-white flex items-center justify-center text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => scrollCards(budgetScrollRef, 'right')} aria-label="Next budget influencers" className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-white flex items-center justify-center text-slate-600"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <button onClick={exploreBudget} className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer">
                <span>View All Budget Creators</span><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          <div ref={budgetScrollRef} className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
            {budgetCreators.length > 0 ? budgetCreators.map((creator) => (
              <div key={creator.id} className="shrink-0 snap-start"><CreatorCard creator={creator} variant="carousel" /></div>
            )) : (
              <div className="col-span-full text-center py-6">
                <p className="text-sm text-slate-400 font-medium">No budget-friendly creators found.</p>
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
              Rising Stars & Viral Creators
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {risingCreators.length > 0 ? risingCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          )) : (
            <div className="col-span-full text-center py-6">
              <p className="text-sm text-slate-400 font-medium">No rising creators found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
