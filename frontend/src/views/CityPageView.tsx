import React from 'react';
import { MapPin, ShieldCheck, ArrowLeft, Sparkles, Filter, Users } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CITIES_LIST } from '../data/initialData';
import { CreatorCard } from '../components/common/CreatorCard';

export const CityPageView: React.FC = () => {
  const { viewParams, creators, navigateTo, setFilters, cities } = usePlatform();

  const citySlug = viewParams.citySlug || 'delhi-ncr';
  const allCities = cities && cities.length > 0 ? cities : CITIES_LIST;
  const cityData = allCities.find((c) => c.slug === citySlug) || allCities[0];

  // Filter creators for this city
  const cityCreators = creators.filter(
    (c) =>
      c.currentCity.toLowerCase().includes(cityData.name.toLowerCase()) ||
      c.preferredCities.some((pc) => pc.toLowerCase().includes(cityData.name.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('home')}
          className="text-xs font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Realistic City Header Hero with Big Image & Overlaid Text */}
        <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[300px] border border-white/15 p-6 sm:p-10 flex flex-col justify-between shadow-2xl">
          {/* Background image with multi-layer gradients */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            <img
              src={cityData.image}
              alt={cityData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-white/15 text-rose-300 border border-white/20 text-xs font-black uppercase">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{cityData.state}, India Hub • Tier {cityData.tier}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Top Influencers in {cityData.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Discover {cityData.count || cityData.influencersCount}+ verified local creators, content producers, and regional ambassadors based in {cityData.name}.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{cityData.count || cityData.influencersCount}+ Local Creators in {cityData.name}</span>
            </div>

            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, city: cityData.name, searchQuery: '', category: 'all' }));
                navigateTo('explore');
              }}
              className="px-5 py-2.5 bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All {cityData.name} Creators</span>
            </button>
          </div>
        </div>

        {/* Creators Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-white text-base">
              Verified Creators in {cityData.name} ({cityCreators.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cityCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
