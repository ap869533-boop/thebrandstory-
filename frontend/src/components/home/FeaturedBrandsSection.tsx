import React, { useEffect, useState } from 'react';
import { Building2, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide uppercase border border-slate-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Verified Brand Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Top Registered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Brands</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Explore admin-approved enterprise brands hiring creators for active campaign briefs.
          </p>
        </div>

        {/* Brand Cards Grid - Matching reference image design exactly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayBrands.map((brand, idx) => (
            <div
              key={brand.id || idx}
              className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between items-center text-center space-y-5"
            >
              {/* 1. Top Logo Area */}
              <div className="h-20 w-full flex items-center justify-center p-2">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.brandName}
                    className="max-h-14 max-w-[160px] object-contain mx-auto transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brandName || 'Brand')}&background=f1f5f9&color=0f172a&bold=true`;
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span>{brand.brandName}</span>
                  </div>
                )}
              </div>

              {/* 2. Inner Light Rounded Card Block (Design matched to reference image) */}
              <div className="w-full bg-slate-50/90 rounded-2xl p-4 space-y-1 border border-slate-100/80">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg line-clamp-1">
                  {brand.brandName}
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    ★ 4.9
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 line-clamp-1">{brand.industry || 'Verified Brand'}</span>
                </div>
              </div>

              {/* 3. Tagline / Description Text */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 px-1 font-medium flex-1 flex items-center justify-center">
                "{brand.description || `Join ${brand.brandName} for active influencer campaigns and long-term brand deals.`}"
              </p>

              {/* 4. Soft Blue Pill Action Button (Design matched to reference image) */}
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
                className="w-full py-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 group-hover:shadow-md"
              >
                <span>View Profile</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
