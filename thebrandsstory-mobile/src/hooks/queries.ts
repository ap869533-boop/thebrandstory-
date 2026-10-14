import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';

export type CreatorSummary = Record<string, any> & { id: string; username?: string };

export type CreatorFilterParams = {
  searchQuery?: string;
  category?: string;
  city?: string;
  followerRange?: string;
  priceRange?: string;
  verifiedOnly?: boolean;
  sortBy?: string;
  limit?: number;
  offset?: number;
};

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: () => apiRequest<{ stats?: Record<string, string> }>('/api/stats'),
    staleTime: 10 * 60_000,
  });
}

export function useFeaturedCreators(limit = 10) {
  return useQuery({
    queryKey: ['creators', 'featured', limit],
    queryFn: () => apiRequest<{ creators?: CreatorSummary[]; total?: number }>(`/api/creators?limit=${limit}&sortBy=trust_score`),
    staleTime: 5 * 60_000,
  });
}

export function useCreators(params: CreatorFilterParams = {}) {
  return useQuery({
    queryKey: ['creators', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        limit: String(params.limit || 20),
        offset: String(params.offset || 0),
        sortBy: params.sortBy || 'trust_score',
      });
      if (params.searchQuery?.trim()) searchParams.set('searchQuery', params.searchQuery.trim());
      if (params.category && params.category !== 'all') searchParams.set('category', params.category);
      if (params.city && params.city !== 'all') searchParams.set('city', params.city);
      if (params.verifiedOnly) searchParams.set('isVerified', 'true');

      const followerBounds: Record<string, [number, number?]> = {
        '1k-10k': [1000, 10000],
        '10k-50k': [10000, 50000],
        '50k-100k': [50000, 100000],
        '100k-500k': [100000, 500000],
        '500k-1m': [500000, 1000000],
        '1m+': [1000000],
      };
      if (params.followerRange && followerBounds[params.followerRange]) {
        const bounds = followerBounds[params.followerRange];
        searchParams.set('minFollowers', String(bounds[0]));
        if (bounds[1]) searchParams.set('maxFollowers', String(bounds[1]));
      }

      const priceBounds: Record<string, [number?, number?]> = {
        'under-5k': [undefined, 5000],
        '5k-10k': [5000, 10000],
        '10k-25k': [10000, 25000],
        '25k-50k': [25000, 50000],
        '50k+': [50000],
      };
      if (params.priceRange && priceBounds[params.priceRange]) {
        const bounds = priceBounds[params.priceRange];
        if (bounds[0]) searchParams.set('minPrice', String(bounds[0]));
        if (bounds[1]) searchParams.set('maxPrice', String(bounds[1]));
      }

      return apiRequest<{ creators?: CreatorSummary[]; total?: number }>(`/api/creators?${searchParams.toString()}`);
    },
    staleTime: 3 * 60_000,
  });
}

export function useCreatorSearch(searchQuery: string) {
  return useCreators({ searchQuery });
}

export function useNearbyCreators(lat?: number, lng?: number, limit = 10) {
  return useQuery({
    queryKey: ['creators', 'nearby', lat, lng, limit],
    enabled: typeof lat === 'number' && typeof lng === 'number',
    queryFn: () => {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        limit: String(limit),
      });
      return apiRequest<{ creators?: any[]; total?: number }>(`/api/creator-content/nearby?${params}`);
    },
    staleTime: 5 * 60_000,
  });
}

export function useOpenCampaigns() {
  return useQuery({
    queryKey: ['campaigns', 'public'],
    queryFn: () => apiRequest<{ campaigns?: any[] }>('/api/campaigns?scope=public&limit=30'),
  });
}

export function useCreatorProfile(username?: string) {
  return useQuery({
    queryKey: ['creator', username],
    enabled: Boolean(username),
    queryFn: () => apiRequest<{ creator?: any }>(`/api/creators/${encodeURIComponent(username!)}`),
  });
}

export function useFeaturedBrands(searchQuery: string) {
  return useQuery({
    queryKey: ['brands', 'featured', searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '30' });
      if (searchQuery.trim()) params.set('searchQuery', searchQuery.trim());
      return apiRequest<{ brands?: any[] }>(`/api/brands/featured?${params}`);
    },
  });
}

export function useBrandProfileById(id?: string) {
  return useQuery({
    queryKey: ['brand', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const params = new URLSearchParams({ searchQuery: id!, limit: '100' });
      const data = await apiRequest<{ brands?: any[] }>(`/api/brands/featured?${params}`);
      const match = (data.brands || []).find((item: any) => String(item.id) === id || String(item.userId) === id || item.brandName?.toLowerCase() === id?.toLowerCase());
      if (!match) throw new Error('This brand could not be found.');
      return match;
    },
  });
}

export function useMyCampaigns(enabled: boolean) {
  return useQuery({
    queryKey: ['campaigns', 'mine'],
    enabled,
    queryFn: () => apiRequest<{ campaigns?: any[] }>('/api/campaigns?scope=mine&limit=50'),
  });
}

export function usePartnerBrands() {
  return useQuery({
    queryKey: ['partner-brands'],
    queryFn: () =>
      apiRequest<{ brands?: { id: string; name: string; logoUrl: string; category?: string; website?: string }[] }>(
        '/api/partner-brands'
      ),
    staleTime: 10 * 60_000,
  });
}
