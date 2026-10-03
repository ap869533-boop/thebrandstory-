import React, { useEffect, useRef, useState } from 'react';
import { Building2, Users, Gift, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';
import { BrandProfile } from '../../types';

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

    fetch(apiUrl('/api/brands/featured'))
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

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section className="py-12 sm:py-20 bg-[#071328] border-b border-slate-800/80 text-white relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* ⭐ VERIFIED BRAND ECOSYSTEM Badge (Photo 3) */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0d224b]/90 text-[#D4A338] text-xs font-black tracking-wider uppercase border border-[#D4A338]/50 shadow-sm mb-3">
          <Building2 className="w-3.5 h-3.5 text-[#D4A338]" />
          <span>BRAND ECOSYSTEM</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Brands & Campaign Hiring
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium max-w-2xl mx-auto mb-6">
          Brand information and campaign totals from registered brand profiles and approved campaigns.
        </p>

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
          className="relative w-full overflow-x-auto scroll-smooth py-4 no-scrollbar flex justify-start sm:justify-center"
        >
          <div className="flex gap-6 items-stretch mx-auto">
            {featuredBrands.map((brand, idx) => (
              <div
                key={`${brand.id || 'brand'}-${idx}`}
                className="group snap-start bg-white rounded-[28px] border-2 border-[#D4A338]/60 hover:border-[#D4A338] p-6 shadow-2xl hover:-translate-y-1.5 cursor-pointer transition-all duration-300 flex flex-col items-center text-center w-[300px] sm:w-[320px] shrink-0 relative overflow-hidden"
              >
                {/* Brand Logo with Gold Ring Halo */}
                <div className="relative flex items-center justify-center mt-2">
                  <div className="absolute inset-0 rounded-full bg-[#D4A338]/20 blur-xl"></div>
                  <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-b from-[#D4A338] via-amber-200 to-[#D4A338] shadow-md flex items-center justify-center overflow-hidden">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.brandName}
                        className="w-full h-full rounded-full object-cover bg-slate-900"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brandName || 'Brand')}&background=0f172a&color=fff&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#0f172a] text-[#D4A338] flex items-center justify-center">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Name */}
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mt-4 mb-0.5 tracking-tight">
                  {brand.brandName}
                </h3>
                {brand.approvalStatus === 'pending' && (
                  <span className="mb-2 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    Registration under review
                  </span>
                )}
                
                {/* Industry Subtitle */}
                <p className="text-[11px] font-black tracking-wider uppercase text-slate-400 mb-2">
                  {brand.industry || 'Industry not added yet'}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-9 mb-4">
                  {brand.description?.trim() || 'Brand bio not added yet.'}
                </p>
                {brand.city && (
                  <p className="text-[10px] font-semibold text-slate-500 -mt-2 mb-3">
                    {brand.city}
                  </p>
                )}

                {/* Campaign totals include approved campaigns only. */}
                <div className="grid grid-cols-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 mb-5 overflow-hidden w-full text-left divide-x divide-slate-200/80">
                  <div className="p-2.5 flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      <Users className="w-2.5 h-2.5" /> HIRING
                    </div>
                    <div className="font-black text-slate-900 text-sm leading-tight break-words">
                      {Number(brand.totalHiringCount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      {brand.totalCampaignCount || 0} campaigns
                    </div>
                  </div>

                  <div className="p-2.5 flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      <Gift className="w-2.5 h-2.5" /> BUDGET RANGE
                    </div>
                    {brand.campaignBudgetMin !== null && brand.campaignBudgetMin !== undefined ? (
                      <>
                        <div className="font-black text-emerald-600 text-xs leading-tight break-words">
                          {formatCurrency(brand.campaignBudgetMin)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5 break-words">
                          to {formatCurrency(brand.campaignBudgetMax ?? brand.campaignBudgetMin)}
                        </div>
                      </>
                    ) : (
                      <div className="font-bold text-slate-500 text-xs leading-tight">Not specified</div>
                    )}
                  </div>

                  <div className="p-2.5 flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      <Calendar className="w-2.5 h-2.5" /> DEADLINE
                    </div>
                    {brand.lastHiringDate ? (
                      <div className="font-black text-slate-900 text-xs leading-tight">
                        {formatDate(brand.lastHiringDate)}
                      </div>
                    ) : (
                      <div className="font-bold text-slate-500 text-xs leading-tight">Not specified</div>
                    )}
                  </div>
                </div>

                {/* View Brand Button */}
                <button
                  onClick={() => {
                    navigateTo('brand-detail', {
                      id: brand.id,
                      brandName: brand.brandName,
                      companyName: brand.brandName,
                      logoUrl: brand.logoUrl,
                      description: brand.description,
                      industry: brand.industry,
                      city: brand.city,
                      website: brand.website
                    });
                  }}
                  className="w-full py-3 bg-[#0a1835] hover:bg-black text-white font-extrabold text-xs sm:text-sm rounded-full transition flex items-center justify-center gap-2 shadow-md shadow-slate-900/20 group-hover:shadow-lg cursor-pointer mt-auto"
                >
                  <span>View Brand</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {!loading && featuredBrands.length === 0 && (
          <p className="py-8 text-sm text-slate-300">
            {loadError || 'No brand profiles to display yet.'}
          </p>
        )}

        {/* Bottom thebrandsstory.com badge (Photo 3) */}
        <div className="pt-6">
          <div className="inline-block px-6 py-2 rounded-full bg-[#0d224b]/90 border border-slate-700 text-slate-300 text-xs font-bold shadow-inner">
            thebrandsstory.com
          </div>
        </div>

      </div>
    </section>
  );
};
