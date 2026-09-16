import React, { useRef } from 'react';
import { Award, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';
import { matchesCityLocation } from '../../utils/location';

export const TopCreatorsSection: React.FC = () => {
  const { creators, navigateTo, setFilters, filters } = usePlatform();
  const scrollRef = useRef<HTMLDivElement>(null);

  const cityActive = filters.city && filters.city !== 'all';

  // Top 20 creators ranked by followers and Featured status — filtered by selected city
  const topCreators = creators
    .filter((c) => {
      if (c.status !== 'active') return false;
      const baseMatch = c.isTop20 || c.followers >= 50000 || c.isFeatured;
      if (!baseMatch) return false;
      // Apply city filter from hero dropdown strictly by actual location
      if (cityActive) {
        if (!matchesCityLocation(c.currentCity || '', filters.city)) return false;
      }
      return true;
    })
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleViewAllTop20 = () => {
    setFilters((prev) => ({
      ...prev,
      sortBy: 'followers',
      category: 'all',
      city: filters.city || 'all',
    }));
    navigateTo('explore');
  };

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-slate-100 font-sans w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-extrabold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>{cityActive ? `${filters.city} Creator Rankings` : "India's Premier Creator Rankings"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {cityActive ? `Top Influencers in ${filters.city}` : 'Top 20 Influencers in India'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {cityActive
                ? `Curated creators from ${filters.city} with verified engagement`
                : 'Curated leaders with verified engagement & proven campaign ROI'}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleViewAllTop20}
              className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none no-scrollbar w-full max-w-full"
        >
          {topCreators.length > 0 ? topCreators.map((creator) => (
            <div key={creator.id} className="snap-start shrink-0">
              <CreatorCard creator={creator} variant="carousel" />
            </div>
          )) : (
            <div className="w-full text-center py-8">
              <p className="text-sm text-slate-400 font-medium">No top creators found in {filters.city}. Try selecting a different city.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
