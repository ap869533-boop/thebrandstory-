import React, { useRef } from 'react';
import { Award, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';

export const TopCreatorsSection: React.FC = () => {
  const { creators, navigateTo, setFilters } = usePlatform();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Top 20 creators ranked by Trust Score and Featured status
  const topCreators = creators
    .filter((c) => c.isTop20 || c.trustScore >= 92 || c.isFeatured)
    .sort((a, b) => b.trustScore - a.trustScore)
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
      sortBy: 'trust_score',
      category: 'all',
      city: 'all',
    }));
    navigateTo('explore');
  };

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-extrabold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>India’s Premier Creator Rankings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top 20 Influencers in India
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated leaders with highest thebrandsstory. Trust Scores, verified engagement & proven campaign ROI
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
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
          className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {topCreators.map((creator) => (
            <div key={creator.id} className="snap-start shrink-0">
              <CreatorCard creator={creator} variant="carousel" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
