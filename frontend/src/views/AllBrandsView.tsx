import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Search } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { apiUrl } from '../config/api';
import { BrandProfile } from '../types';
import { BrandCampaignCard } from '../components/common/BrandCampaignCard';

const PAGE_SIZE = 12;

export const AllBrandsView: React.FC = () => {
  const { navigateTo } = usePlatform();
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrentRequest = true;
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    if (search.trim()) params.set('searchQuery', search.trim());

    setLoading(true);
    setError('');
    const timer = window.setTimeout(() => {
      fetch(apiUrl(`/api/brands/featured?${params.toString()}`))
        .then(response => {
          if (!response.ok) throw new Error(`Brand request failed (${response.status})`);
          return response.json();
        })
        .then(data => {
          if (!data.success || !Array.isArray(data.brands)) {
            throw new Error(data.error || 'The brand list response was invalid');
          }
          if (isCurrentRequest) {
            setBrands(data.brands);
            setTotal(Number(data.total) || 0);
          }
        })
        .catch(fetchError => {
          console.error('Failed to load brands:', fetchError);
          if (isCurrentRequest) {
            setBrands([]);
            setTotal(0);
            setError('Brands could not be loaded. Please try again later.');
          }
        })
        .finally(() => {
          if (isCurrentRequest) setLoading(false);
        });
    }, 250);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timer);
    };
  }, [search, page]);

  return (
    <section className="min-h-[70vh] bg-[#071328] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-[#D4A338]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A338]/50 bg-[#0d224b] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#D4A338]">
            <Building2 className="h-4 w-4" />
            Brand Directory
          </div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Explore All Brands
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
            Discover registered brands and find collaboration opportunities.
          </p>
        </div>

        <label className="mx-auto mb-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-700 bg-[#0d224b] px-4 py-3 focus-within:border-[#D4A338]">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search by brand name, industry, or city"
            aria-label="Search brands by name, industry, or city"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
          />
        </label>

        {!loading && !error && (
          <p className="mb-4 text-sm text-slate-400">
            {total.toLocaleString('en-IN')} {total === 1 ? 'brand' : 'brands'} found
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-slate-300">Loading brands...</p>
        ) : error ? (
          <p role="alert" className="py-12 text-center text-rose-300">{error}</p>
        ) : brands.length === 0 ? (
          <p className="py-12 text-center text-slate-300">
            {search.trim() ? 'No brands match your search.' : 'No brand profiles to display yet.'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {brands.map(brand => (
                <BrandCampaignCard key={brand.id} brand={brand} compact />
              ))}
            </div>

            {total > PAGE_SIZE && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() => setPage(current => Math.max(0, current - 1))}
                  className="rounded-full border border-slate-700 px-5 py-2.5 font-bold text-white transition hover:border-[#D4A338] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-slate-300">
                  Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  type="button"
                  disabled={(page + 1) * PAGE_SIZE >= total || loading}
                  onClick={() => setPage(current => current + 1)}
                  className="rounded-full border border-slate-700 px-5 py-2.5 font-bold text-white transition hover:border-[#D4A338] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
