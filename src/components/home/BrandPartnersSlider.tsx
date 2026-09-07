import React from 'react';
import { usePlatform } from '../../context/PlatformContext';

export const BrandPartnersSlider: React.FC = () => {
  const { partnerBrands } = usePlatform();

  if (!partnerBrands || partnerBrands.length === 0) return null;

  // Triplicate the array for uninterrupted full-screen infinite marquee loop
  const displayBrands = [...partnerBrands, ...partnerBrands, ...partnerBrands];

  return (
    <section className="py-3 sm:py-5 bg-slate-50/80 border-b border-slate-200/80 font-sans overflow-hidden w-full">
      {/* 100% Full Width Edge-to-Edge Slider Container */}
      <div className="w-full overflow-hidden py-0.5 sm:py-1">
        <div className="animate-marquee flex items-center gap-2.5 sm:gap-4">
          {displayBrands.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="w-28 sm:w-44 md:w-56 h-14 sm:h-20 md:h-24 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300 overflow-hidden flex items-center justify-center shrink-0 group cursor-default p-0 relative"
            >
              {/* 100% Edge-to-Edge Full Image */}
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-xs sm:text-sm">
                  {brand.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
