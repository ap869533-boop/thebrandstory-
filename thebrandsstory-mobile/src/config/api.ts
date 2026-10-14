import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { create, isAxiosError, type AxiosRequestConfig, type AxiosError } from 'axios';
import { Platform } from 'react-native';

export function resolveApiBaseUrl(): string {
  if (__DEV__) {
    // 1. In Expo Go/Dev Client, hostUri is the IP of the machine running Metro
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:8000`;
      }
    }
  }

  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.1.6:8000';
    }
    return 'http://localhost:8000';
  }

  return 'https://thebrandsstory.com';
}

export const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_KEY = 'tbs_auth_token';

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 8_000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = resolveApiBaseUrl();
  return `${base}${cleanPath.startsWith('/uploads/') ? `/api${cleanPath}` : cleanPath}`;
}

export async function getAuthToken() {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(TOKEN_KEY) || null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiRequest<T = any>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  const fullUrl = apiUrl(path);
  if (__DEV__) {
    console.log(`[API Request] -> ${options.method || 'GET'} ${fullUrl}`);
  }
  try {
    const response = await apiClient.request<T>({
      ...options,
      url: fullUrl,
      headers: options.data ? { 'Content-Type': 'application/json', ...options.headers } : options.headers,
    });
    const payload: unknown = response.data;
    if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
      const message =
        'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'message' in payload && typeof payload.message === 'string'
          ? payload.message
          : 'The request could not be completed.';
      throw new ApiError(message, response.status);
    }
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.warn(`[API Error] <- ${fullUrl}`, (error as any)?.message || error);
    }
    if (error instanceof ApiError) throw error;
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      throw new ApiError(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Network request failed.',
        axiosError.response?.status
      );
    }
    throw error;
  }
}

export function mediaUrl(path?: string | null) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path.replace('http://thebrandsstory.com/', 'https://thebrandsstory.com/');
  return apiUrl(path);
}
