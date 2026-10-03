import React, { useEffect, useRef, useState } from 'react';
import { MapPin, IndianRupee, Rocket, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';
import { apiUrl } from '../../config/api';

const CITY_PAGE_SIZE = 10;
const BUDGET_PAGE_SIZE = 10;
const RISING_PAGE_SIZE = 4;

async function fetchCreatorPage(filters: Record<string, string>, page: number, pageSize: number) {
  const params = new URLSearchParams({ ...filters, limit: String(pageSize), offset: String(page * pageSize) });
  const response = await fetch(apiUrl(`/api/creators?${params}`));
  const data = await response.json();
  return {
    creators: (data.creators || []).map((creator: any) => ({ ...creator, avatar: creator.avatar ? apiUrl(creator.avatar) : creator.avatar })),
    total: Number(data.total) || 0,
  };
}

export const RegionalShowcases: React.FC = () => {
  const { setFilters, navigateTo } = usePlatform();
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const budgetScrollRef = useRef<HTMLDivElement>(null);
  const [cityCreators, setCityCreators] = useState<any[]>([]);
  const [budgetCreators, setBudgetCreators] = useState<any[]>([]);
  const [risingCreators, setRisingCreators] = useState<any[]>([]);
  const [cityPage, setCityPage] = useState(0);
  const [budgetPage, setBudgetPage] = useState(0);
  const [risingPage, setRisingPage] = useState(0);
  const [cityTotal, setCityTotal] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [risingTotal, setRisingTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchCreatorPage({ city: 'delhi' }, cityPage, CITY_PAGE_SIZE).then((data) => {
      if (!cancelled) { setCityCreators(data.creators); setCityTotal(data.total); }
    }).catch(() => { if (!cancelled) { setCityCreators([]); setCityTotal(0); } });
    return () => { cancelled = true; };
  }, [cityPage]);

  useEffect(() => {
    let cancelled = false;
    fetchCreatorPage({ maxPrice: '5000' }, budgetPage, BUDGET_PAGE_SIZE).then((data) => {
      if (!cancelled) { setBudgetCreators(data.creators); setBudgetTotal(data.total); }
    }).catch(() => { if (!cancelled) { setBudgetCreators([]); setBudgetTotal(0); } });
    return () => { cancelled = true; };
  }, [budgetPage]);

  useEffect(() => {
    let cancelled = false;
    fetchCreatorPage({ isRising: 'true' }, risingPage, RISING_PAGE_SIZE).then((data) => {
      if (!cancelled) { setRisingCreators(data.creators); setRisingTotal(data.total); }
    }).catch(() => { if (!cancelled) { setRisingCreators([]); setRisingTotal(0); } });
    return () => { cancelled = true; };
  }, [risingPage]);

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
    <div className="space-y-12 sm:space-y-16 py-10 sm:py-16 bg-[#071328] font-sans w-full max-w-full overflow-hidden text-white border-b border-slate-800/80">
      {/* 1. City Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Top Influencers in Delhi NCR
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
              Verified lifestyle, fashion, food & tech creators based in Delhi, Noida & Gurgaon
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex gap-1.5">
              <button type="button" onClick={() => scrollCards(cityScrollRef, 'left')} aria-label="Previous Delhi NCR influencers" className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={() => scrollCards(cityScrollRef, 'right')} aria-label="Next Delhi NCR influencers" className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button onClick={exploreCity} className="text-xs sm:text-sm font-black text-[#D4A338] hover:text-amber-300 flex items-center gap-1 shrink-0 group cursor-pointer">
              <span>Explore All Delhi NCR</span><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        <div ref={cityScrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
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
      <section className="bg-[#091b3b]/60 py-10 sm:py-14 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Budget-Friendly Influencers (Under ₹5,000 & Barter)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
                High-converting micro-influencers with engaged communities and affordable pricing
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex gap-1.5">
                <button type="button" onClick={() => scrollCards(budgetScrollRef, 'left')} aria-label="Previous budget influencers" className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => scrollCards(budgetScrollRef, 'right')} aria-label="Next budget influencers" className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <button onClick={exploreBudget} className="text-xs sm:text-sm font-black text-[#D4A338] hover:text-amber-300 flex items-center gap-1 shrink-0 group cursor-pointer">
                <span>View All</span><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          <div ref={budgetScrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
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
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Rising Stars & Viral Creators
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
              High-growth influencers with industry-leading
            </p>
          </div>

          <button
            onClick={exploreRising}
            className="text-xs sm:text-sm font-black text-[#D4A338] hover:text-amber-300 flex items-center gap-1 shrink-0 group cursor-pointer self-start sm:self-auto"
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
