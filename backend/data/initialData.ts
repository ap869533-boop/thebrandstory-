import { Creator, PlatformStatsConfig } from '../types';

export const INITIAL_CREATORS: Creator[] = [];
export const CATEGORIES_LIST: any[] = [];
export const CITIES_LIST: any[] = [];
export const INDUSTRIES_LIST: any[] = [];
export const BLOG_POSTS: any[] = [];
export const INITIAL_CAMPAIGNS: any[] = [];
export const INITIAL_BRAND_PARTNERS: any[] = [];
export const INITIAL_STATS: PlatformStatsConfig = {
  creatorsDisplay: '0',
  citiesDisplay: '0',
  categoriesDisplay: '0',
  brandConnectionsDisplay: '0',
  customOverride: false,
  lastUpdated: new Date().toISOString(),
};
