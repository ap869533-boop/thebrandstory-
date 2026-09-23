import React, { useEffect, useRef, useState } from 'react';
import { Building2, Star, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';
import { BrandProfile } from '../../types';

// Fallback sample approved brands matching the user reference design if database is empty
const SAMPLE_APPROVED_BRANDS: Partial<BrandProfile>[] = [
  {
    id: 'sample-1',
    brandName: 'Infosys BPM',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    description: 'Join us to navigate your next digital transformation journey.',
    industry: 'Technology & IT Services',
    city: 'Bangalore',
    website: 'https://infosysbpm.com',
    approvalStatus: 'approved',
    isFeatured: true,
  },
  {
    id: 'sample-2',
    brandName: 'NTT DATA, Inc.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/NTT_Data_logo.svg',
    description: 'This is the place where you grow and innovate together.',
    industry: 'Enterprise Solutions',
    city: 'Mumbai',
    website: 'https://nttdata.com',
    approvalStatus: 'approved',
    isFeatured: true,
  },
  {
    id: 'sample-3',
    brandName: 'Reliance Retail',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Reliance_Retail_Logo.svg',
    description: "Building India's largest retail company with nationwide creator campaigns.",
    industry: 'Retail & Consumer Products',
    city: 'Mumbai',
    website: 'https://relianceretail.com',
    approvalStatus: 'approved',
    isFeatured: true,
  },
  {
    id: 'sample-4',
    brandName: 'Nykaa Beauty',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Nykaa_Logo.svg',
    description: "India's premier online beauty and fashion destination for lifestyle creators.",
    industry: 'Beauty & Fashion',
    city: 'Delhi NCR',
    website: 'https://nykaa.com',
    approvalStatus: 'approved',
    isFeatured: true,
  }
];

export const FeaturedBrandsSection: React.FC = () => {
  const { navigateTo } = usePlatform();
  const [featuredBrands, setFeaturedBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const brandScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(apiUrl('/api/brands/featured'))
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.brands) && d.brands.length > 0) {
          // Filter to strictly ensure only admin-approved brands are rendered
          const approvedOnly = d.brands.filter((b: any) => b.approvalStatus === 'approved');
          setFeaturedBrands(approvedOnly.length > 0 ? approvedOnly : (SAMPLE_APPROVED_BRANDS as BrandProfile[]));
        } else {
          setFeaturedBrands(SAMPLE_APPROVED_BRANDS as BrandProfile[]);
        }
        setLoading(false);
      })
      .catch(() => {
        setFeaturedBrands(SAMPLE_APPROVED_BRANDS as BrandProfile[]);
        setLoading(false);
      });
  }, []);

  const displayBrands = featuredBrands.length > 0 ? featuredBrands : (SAMPLE_APPROVED_BRANDS as BrandProfile[]);
  const scrollBrands = (direction: 'left' | 'right') => {
    brandScrollRef.current?.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <div className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-7">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide uppercase border border-slate-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Verified Brand Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Top Brands Hiring Influencers
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Explore admin-approved enterprise brands hiring creators for active campaign briefs.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          <button type="button" onClick={() => scrollBrands('left')} aria-label="Previous brands" className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => scrollBrands('right')} aria-label="Next brands" className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Manual carousel: cards stay on screen until the visitor moves them. */}
        <div ref={brandScrollRef} className="relative w-full overflow-x-auto scroll-smooth py-10 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <div className="flex gap-6 items-stretch w-max">
            {displayBrands.map((brand, idx) => (
              <div
                key={`${brand.id || 'brand'}-${idx}`}
                className={`group snap-start bg-white rounded-[24px] border ${
                  brand.brandName === 'Reliance Retail' ? 'border-red-50 hover:border-red-100 bg-gradient-to-b from-white to-red-50/10' : 'border-[#D4A338]/30 hover:border-[#D4A338]/80 hover:shadow-[0_20px_40px_rgba(212,163,56,0.15)]'
                } p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-pointer transition-all duration-500 flex flex-col items-center text-center w-[280px] sm:w-[320px] shrink-0 relative overflow-hidden`}
              >
                {/* Premium Gradient Header */}
                
                {/* Hover side glow */}
                <div className="absolute -left-16 top-1/4 w-40 h-40 bg-[#f4c95d]/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                {/* Logo Area with glow */}
                <div className="relative flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${
                    brand.brandName === 'Infosys BPM' ? 'bg-blue-500' :
                    brand.brandName === 'Reliance Retail' ? 'bg-red-500' : 'bg-slate-500'
                  }`}></div>
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-white border overflow-hidden ${
                    brand.brandName === 'Infosys BPM' ? 'border-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]' :
                    brand.brandName === 'Reliance Retail' ? 'border-red-100 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-100 shadow-[0_0_15px_rgba(100,116,139,0.15)]'
                  } group-hover:scale-105 transition-transform duration-500`}>
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.brandName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brandName || 'Brand')}&background=f1f5f9&color=0f172a&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-800 text-base sm:text-lg mt-4 mb-1">
                  {brand.brandName}
                </h3>
                
                {/* Subtitle */}
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 line-clamp-1">
                  {brand.industry}
                </p>

                {brand.totalHiringCount ? (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">
                      {brand.totalHiringCount > 999 ? (brand.totalHiringCount / 1000).toFixed(1).replace(/\.0$/, '') + 'K+' : brand.totalHiringCount + '+'} actively hiring
                    </p>
                  </div>
                ) : (
                  <div className="mb-3"></div>
                )}
                
                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1 px-2 line-clamp-3">
                  {brand.description || 'Verified enterprise brand hiring creators for multiple campaigns.'}
                </p>

                {/* Action */}
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
                  className="mt-auto px-5 py-2.5 bg-[#0f172a] hover:bg-black text-white text-xs font-bold rounded-full transition flex items-center gap-1.5 shadow-md shadow-slate-900/10 group-hover:shadow-lg group-hover:-translate-y-0.5"
                >
                  View Brand
                  <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
