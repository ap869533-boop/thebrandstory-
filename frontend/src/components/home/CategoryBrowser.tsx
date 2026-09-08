import React from 'react';
import { Layers, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { CATEGORIES_LIST } from '../../data/initialData';
import { usePlatform } from '../../context/PlatformContext';

const CATEGORY_ICONS: Record<string, string> = {
  Fashion: '👗',
  Beauty: '💄',
  Food: '🍕',
  Travel: '✈️',
  Lifestyle: '🌿',
  Fitness: '💪',
  Technology: '💻',
  Gaming: '🎮',
  Finance: '📈',
  Automotive: '🏎️',
  'Real Estate': '🏢',
  Education: '🎓',
  Parenting: '👶',
  Comedy: '🎭',
  Entertainment: '🎬',
  Luxury: '💎',
  Photography: '📸',
  Business: '💼',
  Healthcare: '🩺',
  Motivation: '⚡',
  Jewellery: '💍',
  'Home & Interiors': '🛋️',
  Wedding: '💒',
  Events: '🎪',
  'Local Creators': '📍',
};

export const CategoryBrowser: React.FC = () => {
  const { setFilters, navigateTo, categories } = usePlatform();

  const handleCategoryClick = (categoryName: string, categorySlug: string) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryName,
      searchQuery: '',
    }));
    navigateTo('category-page', { categorySlug });
  };

  return (
    <section className="py-14 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse By Creator Niches</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Explore Influencer Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Handpicked talent with verified demographics in India's top industry verticals
            </p>
          </div>

          <button
            onClick={() => navigateTo('explore')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 group cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Realistic Big Image Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).slice(0, 12).map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleCategoryClick(cat.name, cat.slug)}
              className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-blue-400 flex flex-col justify-between p-3.5"
            >
              {/* Big High-Res Background Image */}
              <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Top Row: Floating Emoji Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl backdrop-blur-md bg-white/20 border border-white/20 flex items-center justify-center text-lg shadow-md">
                  {CATEGORY_ICONS[cat.name] || '✨'}
                </div>
                <span className="backdrop-blur-md bg-black/40 border border-white/15 text-[10px] font-bold text-white/90 px-2 py-0.5 rounded-full">
                  {cat.count}+
                </span>
              </div>

              {/* Bottom Row: Text directly on Image */}
              <div className="relative z-10">
                <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition truncate drop-shadow-md">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                  <span>Verified Creators</span>
                  <ArrowRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
