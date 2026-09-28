import React, { useEffect, useState } from 'react';
import { Award, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';
import { apiUrl } from '../../config/api';

const PAGE_SIZE = 10;

export const TopCreatorsSection: React.FC = () => {
  const { navigateTo, setFilters } = usePlatform();
  const [topCreators, setTopCreators] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ isTop20: 'true', sortBy: 'followers', limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
    fetch(apiUrl(`/api/creators?${params}`))
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setTopCreators((data.creators || []).map((creator: any) => ({ ...creator, avatar: creator.avatar ? apiUrl(creator.avatar) : creator.avatar })));
        setTotal(Number(data.total) || 0);
      })
      .catch(() => { if (!cancelled) { setTopCreators([]); setTotal(0); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const handleViewAllTop20 = () => {
    setFilters((prev) => ({
      ...prev,
      sortBy: 'followers',
      category: 'all',
      city: 'all',
    }));
    navigateTo('explore');
  };

  return (
    <section className="py-8 sm:py-14 bg-[#071328] border-b border-slate-800/80 font-sans w-full max-w-full overflow-hidden text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-extrabold uppercase tracking-wider mb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>India's Premier Creator Rankings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Top 20 Influencers in India
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Curated leaders with verified engagement & proven campaign ROI
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0 || loading}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={(page + 1) * PAGE_SIZE >= total || loading}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleViewAllTop20}
              className="text-xs sm:text-sm font-black text-[#D4A338] hover:text-amber-300 flex items-center gap-1 shrink-0 group cursor-pointer"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none no-scrollbar w-full max-w-full">
          {topCreators.length > 0 ? topCreators.map((creator) => (
            <div key={creator.id} className="snap-start shrink-0">
              <CreatorCard creator={creator} variant="carousel" />
            </div>
          )) : (
            <div className="w-full text-center py-8">
              <p className="text-sm text-slate-400 font-medium">{loading ? 'Loading top creators…' : 'No top creators found yet.'}</p>
            </div>
          )}
        </div>
        {total > PAGE_SIZE && <p className="text-center text-xs text-slate-400 mt-2">Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}</p>}
      </div>
    </section>
  );
};
