import React, { useEffect, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';
import { BrandProfile } from '../../types';

export const FeaturedBrandsSection: React.FC = () => {
  const { navigateTo } = usePlatform();
  const [featuredBrands, setFeaturedBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/brands/featured'))
      .then(r => r.json())
      .then(d => {
        if (d.success) setFeaturedBrands(d.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || featuredBrands.length === 0) {
    return null; // Don't show if empty or loading
  }

  return (
    <div className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wide uppercase border border-blue-200">
              <Star className="w-3.5 h-3.5" />
              <span>Partner Ecosystem</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Brands</span>
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              Discover top brands and agencies actively collaborating with creators on our platform. Find your next long-term partnership.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredBrands.map((brand) => (
            <div 
              key={brand.id}
              className="group bg-white rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Cover Area */}
              <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative">
                {brand.coverUrl && (
                  <img src={brand.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
                )}
                {/* Logo overlay */}
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md border border-slate-100">
                    <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.brandName} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
                {/* Featured Badge */}
                {brand.isFeatured && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Top Brand</span>
                  </div>
                )}
              </div>

              <div className="pt-10 p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{brand.brandName}</h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{brand.industry || 'General Business'} • {brand.city || 'Pan India'}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-6 flex-1">
                  {brand.description || `Explore collaboration opportunities with ${brand.brandName} on India's biggest influencer platform.`}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Verified</span>
                  </div>
                  <button
                    onClick={() => {
                      if (brand.website) {
                        window.open(brand.website, '_blank');
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
