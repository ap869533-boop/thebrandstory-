/// <reference types="vite/client" />

/**
 * Central API Configuration for Frontend
 * Live Production Backend Domain: https://thebrandsstory.com
 */
export const LIVE_DOMAIN = 'http://localhost:8000';

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  // Empty string enables relative URLs: works on localhost, IP, and any VPS domain automatically
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper function to generate full API URLs for fetch calls.
 * Example: apiUrl('/api/creators') -> 'https://thebrandsstory.com/api/creators'
 */
export const apiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};
