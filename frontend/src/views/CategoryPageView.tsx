import React from 'react';
import { Layers, ArrowLeft, Users } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CATEGORIES_LIST } from '../data/initialData';
import { CreatorCard } from '../components/common/CreatorCard';

export const CategoryPageView: React.FC = () => {
  const { viewParams, creators, navigateTo, setFilters, categories } = usePlatform();

  const categorySlug = viewParams.categorySlug || 'fashion';
  const allCategories = categories && categories.length > 0 ? categories : CATEGORIES_LIST;
  const categoryData = allCategories.find((c) => c.slug === categorySlug) || allCategories[0];

  // Filter creators for this category
  const categoryCreators = creators.filter(
    (c) =>
      c.status === 'active' &&
      (c.primaryCategory.toLowerCase() === categoryData.name.toLowerCase() ||
        c.subCategories.some((sc) => sc.toLowerCase() === categoryData.name.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#051126] text-white">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Realistic Category Header Hero with Big Image & Overlaid Text */}
        <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[300px] border border-white/15 p-6 sm:p-10 flex flex-col justify-between shadow-2xl">
          {/* Background image with multi-layer gradients */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            <img
              src={categoryData.image}
              alt={categoryData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#051126] via-[#051126]/80 to-[#051126]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051126] via-transparent to-black/40" />
          </div>

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-white/15 text-[#D4A338] border border-white/20 text-xs font-black uppercase">
              <span>{categoryData.icon || '✨'}</span>
              <span>{categoryData.name} Category Spotlight</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Top {categoryData.name} Influencers in India
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {categoryData.description || `Discover ${categoryData.count}+ verified ${categoryData.name.toLowerCase()} content creators, vloggers, and brand ambassadors across India.`}
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Users className="w-4 h-4 text-[#D4A338]" />
              <span>{categoryData.count}+ Registered Creators</span>
            </div>

            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, category: categoryData.name, searchQuery: '', city: 'all' }));
                navigateTo('explore');
              }}
              className="px-5 py-2.5 bg-[#D4A338] hover:bg-[#b88628] text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All {categoryData.name} Creators</span>
            </button>
          </div>
        </div>

        {/* Creators Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-white text-base">
              Verified {categoryData.name} Talent ({categoryCreators.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>

          {categoryCreators.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-medium text-sm">No creators found in this category yet.</p>
              <button
                onClick={() => navigateTo('explore')}
                className="px-4 py-2 bg-[#D4A338] text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition hover:bg-[#b88628]"
              >
                Browse All Creators
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
