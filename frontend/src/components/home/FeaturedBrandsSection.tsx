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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Brands & Campaign Hiring
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium max-w-2xl mx-auto mb-6">
          Brand information and campaign totals from registered brand profiles and approved campaigns.
        </p>

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigateTo('all-brands')}
            className="rounded-full border border-[#D4A338]/70 bg-[#0d224b] px-5 py-2.5 text-sm font-bold text-[#D4A338] transition hover:bg-[#D4A338] hover:text-slate-950"
          >
            View All Brands
          </button>
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => scrollBrands('left')}
            aria-label="Previous brands"
            className="w-10 h-10 rounded-full bg-[#0d224b] border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBrands('right')}
            aria-label="Next brands"
            className="w-10 h-10 rounded-full bg-[#0d224b] border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

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
