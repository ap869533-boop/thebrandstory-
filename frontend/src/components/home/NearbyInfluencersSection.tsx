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
      });
      const res = await fetch(apiUrl(`/api/creator-content/nearby?${qs.toString()}`));
      const data = await res.json();
      if (data.success && Array.isArray(data.creators)) {
        setNearby(mapCreators(data.creators));
      } else {
        setNearby([]);
      }
    } catch {
      setNearby([]);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }
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
    setGeoStatus('prompt');
  }, []);

  useEffect(() => {
    if (!coords) return;
    void fetchNearby(coords.lat, coords.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when coordinates are known
  }, [coords]);

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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nearby Influencers</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Creators closest to you, based on your live location.
            </p>
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

        {(geoStatus === 'prompt' || geoStatus === 'denied' || geoStatus === 'error' || geoStatus === 'unsupported') && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {geoStatus === 'unsupported' && 'Location is not supported in this browser.'}
              {geoStatus === 'denied' && 'Location access was denied. Allow it to see influencers near you.'}
              {geoStatus === 'error' && 'We could not read your location. Try again to see nearby influencers.'}
              {geoStatus === 'prompt' && 'Allow location to discover influencers near you.'}
            </p>
            {geoStatus !== 'unsupported' && (
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('sc_nearby_geo_denied');
                  requestLocation();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4A338] hover:bg-[#b88628] text-black text-xs font-bold cursor-pointer shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                Use my location
              </button>
            )}
          </div>
        )}

        {(geoStatus === 'loading' || loading) && (
          <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Finding nearby influencers...
          </p>
        )}
        {geoStatus === 'ready' && !loading && nearby.length === 0 && (
          <div className="w-full text-center py-8">
            <p className="text-sm text-slate-400 font-medium">No influencers found near you yet.</p>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none no-scrollbar w-full max-w-full"
        >
          {nearby.map((creator) => (
            <div key={creator.id} className="snap-start shrink-0">
              <CreatorCard creator={creator} variant="carousel" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
