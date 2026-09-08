import React from 'react';
import { MapPin, ArrowRight, Building, Sparkles } from 'lucide-react';
import { CITIES_LIST } from '../../data/initialData';
import { usePlatform } from '../../context/PlatformContext';

export const CityBrowser: React.FC = () => {
  const { setFilters, navigateTo, cities } = usePlatform();

  const handleCityClick = (cityName: string, citySlug: string) => {
    setFilters((prev) => ({
      ...prev,
      city: cityName,
      searchQuery: '',
    }));
    navigateTo('city-page', { citySlug });
  };

  return (
    <section className="py-14 bg-black text-white relative overflow-hidden border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-extrabold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Hyper-Local Creator Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Discover Influencers Across Major Indian Cities
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Find verified regional voices with authentic audience concentration in Tier 1 & Tier 2 cities
            </p>
          </div>

          <button
            onClick={() => navigateTo('explore')}
            className="text-xs font-bold text-[#D4A338] hover:text-[#b88628] flex items-center gap-1 shrink-0 group cursor-pointer"
          >
            <span>Explore All 500+ Cities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Realistic Big Image City Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(cities && cities.length > 0 ? cities : CITIES_LIST).map((city, idx) => (
            <div
              key={idx}
              onClick={() => handleCityClick(city.name, city.slug)}
              className="group relative h-52 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-[#D4A338] flex flex-col justify-between p-3.5"
            >
              {/* Big High-Res Landmark Photo */}
              <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Top Row: State Tag & Tier Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="backdrop-blur-md bg-black/50 border border-white/20 text-[10px] font-bold text-white uppercase px-2 py-0.5 rounded-md">
                  {city.state}
                </span>
                <span className="backdrop-blur-md bg-[#D4A338] text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                  Tier {city.tier}
                </span>
              </div>

              {/* Bottom Row: City Name & Count directly on image */}
              <div className="relative z-10">
                <div className="flex items-center gap-1 text-rose-400 mb-0.5">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">India</span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#D4A338] transition truncate drop-shadow-md">
                  {city.name}
                </h3>
                <p className="text-[11px] text-[#D4A338] font-bold mt-0.5 flex items-center justify-between">
                  <span>{city.count || city.influencersCount}+ Creators</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
