/// <reference types="vite/client" />

/**
 * Central API Configuration for Frontend
 * Live Production Backend Domain: https://thebrandsstory.com
 */
export const LIVE_DOMAIN = 'https://thebrandsstory.com';

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
  if (endpoint.startsWith('http://thebrandsstory.com/')) {
    const path = endpoint.slice('http://thebrandsstory.com/'.length);
    return `https://thebrandsstory.com/${path.startsWith('uploads/') ? `api/${path}` : path}`;
  }
  if (endpoint.startsWith('https://') || endpoint.startsWith('http://')) {
    return endpoint;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (path.startsWith('/uploads/')) return `${API_BASE_URL}/api${path}`;
  return `${API_BASE_URL}${path}`;
};

export async function readApiResponse(response: Response): Promise<any> {
  const body = await response.text();
  if (!body) {
    return { success: false, error: `Server returned ${response.status} without a response body.` };
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return {
      success: false,
      error: `Server returned an invalid HTML or non-JSON response (${response.status}).`
    };
  }
}
