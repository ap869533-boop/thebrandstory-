import React from 'react';
import { usePlatform } from '../../context/PlatformContext';

export const BrandPartnersSlider: React.FC = () => {
  const { partnerBrands } = usePlatform();

  if (!partnerBrands || partnerBrands.length === 0) return null;

  // Triplicate array for infinite smooth marquee
  const displayBrands = [...partnerBrands, ...partnerBrands, ...partnerBrands];

  return (
    <section className="py-4 sm:py-6 bg-[#061226] border-b border-slate-800/80 font-sans overflow-hidden w-full">
      <div className="w-full overflow-hidden py-1">
        <div className="animate-marquee flex items-center gap-3 sm:gap-5">
          {displayBrands.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="brand-slider-card w-28 sm:w-44 md:w-52 h-14 sm:h-20 bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden flex items-center justify-center shrink-0 p-3 relative"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="brand-slider-fallback w-full h-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-xs sm:text-sm">
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
