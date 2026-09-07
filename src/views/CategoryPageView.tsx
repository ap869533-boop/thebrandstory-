import React from 'react';
import { Layers, ShieldCheck, ArrowLeft, Sparkles, Users } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CATEGORIES_LIST } from '../data/initialData';
import { CreatorCard } from '../components/common/CreatorCard';

export const CategoryPageView: React.FC = () => {
  const { viewParams, creators, navigateTo, openAIMatcherModal, setFilters } = usePlatform();

  const categorySlug = viewParams.categorySlug || 'fashion';
  const categoryData = CATEGORIES_LIST.find((c) => c.slug === categorySlug) || CATEGORIES_LIST[0];

  // Filter creators for this category
  const categoryCreators = creators.filter(
    (c) =>
      c.primaryCategory.toLowerCase() === categoryData.name.toLowerCase() ||
      c.subCategories.some((sc) => sc.toLowerCase() === categoryData.name.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('home')}
          className="text-xs font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Realistic Category Header Hero with Big Image & Overlaid Text */}
        <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[300px] border border-white/15 p-6 sm:p-10 flex flex-col justify-between shadow-2xl">
          {/* Background image with multi-layer gradients */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            <img
              src={categoryData.image}
              alt={categoryData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-white/15 text-blue-300 border border-white/20 text-xs font-black uppercase">
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
              <Users className="w-4 h-4 text-blue-400" />
              <span>{categoryData.count}+ Registered Creators</span>
            </div>

            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, category: categoryData.name }));
                openAIMatcherModal();
              }}
              className="px-5 py-2.5 bg-black hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/40 transition flex items-center gap-2 cursor-pointer border border-blue-400/40"
            >
              <Sparkles className="w-4 h-4" />
              AI Match {categoryData.name} Creators
            </button>
          </div>
        </div>

        {/* Creators Grid with realistic portrait cards */}
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
        </div>
      </div>
    </div>
  );
};
