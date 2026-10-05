import React, { useEffect, useRef, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';
import { BrandProfile } from '../../types';
import { BrandCampaignCard } from '../common/BrandCampaignCard';

export const FeaturedBrandsSection: React.FC = () => {
  const { authUser, navigateTo } = usePlatform();
  const [featuredBrands, setFeaturedBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const brandScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCurrentRequest = true;
    setLoading(true);
    setLoadError('');

    fetch(apiUrl('/api/brands/featured?limit=10&offset=0'))
      .then(response => {
        if (!response.ok) throw new Error(`Brand request failed (${response.status})`);
        return response.json();
      })
      .then(d => {
        if (!d.success || !Array.isArray(d.brands)) {
          throw new Error(d.error || 'The brand list response was invalid');
        }
        if (isCurrentRequest) setFeaturedBrands(d.brands);
      })
      .catch(error => {
        console.error('Failed to load featured brands:', error);
        if (isCurrentRequest) setLoadError('Brand profiles could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [authUser?.id]);

  const scrollBrands = (direction: 'left' | 'right') => {
    brandScrollRef.current?.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section className="py-12 sm:py-20 bg-[#071328] border-b border-slate-800/80 text-white relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-3 flex flex-nowrap items-center justify-between gap-1 sm:gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Brands & Campaign Hiring
          </h2>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => scrollBrands('left')}
              aria-label="Previous brands"
              className="flex h-5 w-5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#0d224b] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBrands('right')}
              aria-label="Next brands"
              className="flex h-5 w-5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#0d224b] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('all-brands')}
              className="whitespace-nowrap rounded-full border border-[#D4A338]/70 bg-[#0d224b] px-1 py-1 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-bold text-[#D4A338] transition hover:bg-[#D4A338] hover:text-slate-950"
            >
              View All Brands
            </button>
          </div>
        </div>

        <p className="max-w-2xl text-left text-xs sm:text-xs md:text-sm text-slate-400 font-medium mb-6">
          Brand information and campaign totals from registered brand profiles and approved campaigns.
        </p>

        {/* Brand Cards Carousel (Matching Photo 3) */}
        <div
          ref={brandScrollRef}
          className="relative w-full overflow-x-auto scroll-smooth py-4 no-scrollbar flex justify-start"
        >
          <div className="flex gap-6 items-stretch mx-auto">
            {featuredBrands.map((brand, idx) => (
              <BrandCampaignCard key={`${brand.id || 'brand'}-${idx}`} brand={brand} />
            ))}
          </div>
        </div>
        {!loading && featuredBrands.length === 0 && (
          <p className="py-8 text-sm text-slate-300">
            {loadError || 'No brand profiles to display yet.'}
          </p>
        )}

      </div>
    </section>
  );
};
