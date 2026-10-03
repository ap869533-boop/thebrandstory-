import React, { useEffect, useState, useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight, ArrowRight, Navigation, Loader2 } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';
import { CreatorCard } from '../common/CreatorCard';
import { Creator } from '../../types';

type GeoStatus = 'idle' | 'prompt' | 'loading' | 'ready' | 'denied' | 'unsupported' | 'error';

export const NearbyInfluencersSection: React.FC = () => {
  const { navigateTo, creators } = usePlatform();
  const [nearby, setNearby] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPage, setNearbyPage] = useState(0);
  const [nearbyTotal, setNearbyTotal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mapCreators = (apiCreators: any[]): Creator[] =>
    apiCreators.map((c: any) => {
      const full = creators.find((x) => x.id === c.id || x.username === c.username);
      if (full) return { ...full, distanceKm: c.distanceKm };
      return {
        id: c.id,
        name: c.name,
        username: c.username,
        avatar: c.avatar,
        currentCity: c.currentCity || '',
        primaryCategory: c.primaryCategory || 'Influencer',
        followers: c.followers || 0,
        startingPrice: c.startingPrice || 0,
        isVerified: c.isVerified || false,
        distanceKm: c.distanceKm,
        status: 'active',
        bio: '',
        languages: [],
        platforms: { instagram: { handle: c.username, followers: c.followers || 0 } },
      } as unknown as Creator;
    });

  const fetchNearby = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        limit: '10',
        offset: String(nearbyPage * 10),
      });
      const res = await fetch(apiUrl(`/api/creator-content/nearby?${qs.toString()}`));
      const data = await res.json();
      if (data.success && Array.isArray(data.creators)) {
        setNearby(mapCreators(data.creators));
        setNearbyTotal(Number(data.total) || 0);
      } else {
        setNearby(creators.slice(0, 8));
        setNearbyTotal(creators.length);
      }
    } catch {
      setNearby(creators.slice(0, 8));
      setNearbyTotal(creators.length);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }
    sessionStorage.setItem('sc_nearby_geo_prompted', '1');
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const next = { lat: latitude, lng: longitude };
        sessionStorage.setItem('sc_nearby_coords', JSON.stringify(next));
        setCoords(next);
        setGeoStatus('ready');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          sessionStorage.setItem('sc_nearby_geo_denied', '1');
          setGeoStatus('denied');
        } else {
          setGeoStatus('error');
        }
      },
      { timeout: 15000, maximumAge: 300000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }
    if (sessionStorage.getItem('sc_nearby_geo_denied') === '1') {
      setGeoStatus('denied');
      return;
    }
    const stored = sessionStorage.getItem('sc_nearby_coords');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.lat && parsed?.lng) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          setGeoStatus('ready');
          return;
        }
      } catch {
        // fall through to prompt
      }
    }
    if (sessionStorage.getItem('sc_nearby_geo_prompted') === '1') {
      setGeoStatus('prompt');
      return;
    }

    requestLocation();
  }, []);

  useEffect(() => {
    if (!coords) {
      // Fallback display top creators
      if (creators.length > 0 && nearby.length === 0) {
        setNearby(creators.slice(0, 8));
      }
      return;
    }
    void fetchNearby(coords.lat, coords.lng);
  }, [coords, nearbyPage, creators]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const displayCreators = nearby.length > 0 ? nearby : creators.slice(0, 8);

  return (
    <section className="py-8 sm:py-14 bg-[#071328] border-b border-slate-800/80 text-white font-sans w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Nearby Influencers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Creators closest to you, based on your live location.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => navigateTo('explore')}
              className="text-xs sm:text-sm font-black text-[#D4A338] hover:text-amber-300 flex items-center gap-1 shrink-0 group cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {(geoStatus === 'prompt' || geoStatus === 'denied' || geoStatus === 'error' || geoStatus === 'unsupported') && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#0c1e3d]/70 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-300">
              {geoStatus === 'unsupported' && 'Location is not supported in this browser.'}
              {geoStatus === 'denied' && 'Location access was denied. Allow it to see influencers near you.'}
              {geoStatus === 'error' && 'We could not read your location. Try again to see nearby influencers.'}
              {geoStatus === 'prompt' && 'Allow location access to discover influencers near your city.'}
            </p>
            {geoStatus !== 'unsupported' && (
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('sc_nearby_geo_denied');
                  sessionStorage.removeItem('sc_nearby_geo_prompted');
                  requestLocation();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 text-xs font-black cursor-pointer shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                Use my location
              </button>
            )}
          </div>
        )}

        {(geoStatus === 'loading' || loading) && (
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A338]" />
            Finding nearby influencers...
          </p>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none no-scrollbar w-full max-w-full"
        >
          {displayCreators.map((creator) => (
            <div key={creator.id} className="snap-start shrink-0">
              <CreatorCard creator={creator} variant="carousel" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
