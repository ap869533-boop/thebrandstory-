import React, { useEffect, useState, useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';
import { Creator } from '../../types';

export const NearbyInfluencersSection: React.FC = () => {
  const { filters, navigateTo, creators } = usePlatform();
  const [nearby, setNearby] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const city = filters.city && filters.city !== 'all' ? filters.city : '';

  useEffect(() => {
    if (!city) {
      setNearby([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const stored = sessionStorage.getItem('sc_home_coords');
        let lat = '';
        let lng = '';
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.lat && parsed?.lng) {
              lat = String(parsed.lat);
              lng = String(parsed.lng);
            }
          } catch {
            // ignore
          }
        }
        const qs = new URLSearchParams({ city, limit: '10' });
        if (lat && lng) {
          qs.set('lat', lat);
          qs.set('lng', lng);
        }
        const res = await fetch(apiUrl(`/api/creator-content/nearby?${qs.toString()}`));
        const data = await res.json();
        
        if (!cancelled && data.success && Array.isArray(data.creators) && data.creators.length > 0) {
          const fullCreators = data.creators.map((c: any) => {
             const full = creators.find((x) => x.id === c.id || x.username === c.username);
             if (full) return { ...full, distanceKm: c.distanceKm };
             return {
               id: c.id,
               name: c.name,
               username: c.username,
               avatar: c.avatar,
               currentCity: c.currentCity || city,
               primaryCategory: c.primaryCategory || 'Influencer',
               followers: c.followers || 0,
               startingPrice: c.startingPrice || 0,
               isVerified: c.isVerified || false,
               distanceKm: c.distanceKm,
               status: 'active',
               bio: '',
               languages: [],
               platforms: { instagram: { handle: c.username, followers: c.followers || 0 } }
             } as Creator;
          });
          setNearby(fullCreators);
        } else if (!cancelled) {
          const fallback = creators
            .filter((c) => c.status === 'active' && c.currentCity && c.currentCity.toLowerCase().includes(city.toLowerCase()))
            .slice(0, 10);
          setNearby(fallback);
        }
      } catch {
        if (!cancelled) setNearby([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [city, creators]);

  if (!city) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-slate-100 font-sans w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-extrabold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>NEARBY INFLUENCERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Creators near {city}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Real profiles from the database matching your selected location.</p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => navigateTo('explore')}
              className="text-xs font-bold text-[#b88628] hover:text-[#D4A338] flex items-center gap-1 shrink-0 group cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {loading && <p className="text-xs text-slate-500 mb-4">Finding nearby influencers...</p>}
        {!loading && nearby.length === 0 && (
          <div className="w-full text-center py-8">
            <p className="text-sm text-slate-400 font-medium">No influencers found near {city} yet.</p>
          </div>
        )}
        
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none no-scrollbar w-full max-w-full"
        >
          {nearby.map((creator) => (
            <div key={creator.id} className="snap-start shrink-0 relative">
               <CreatorCard creator={creator} variant="carousel" />
               {(creator as any).distanceKm != null && (
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 z-10 shadow-lg">
                   {(creator as any).distanceKm} km away
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
