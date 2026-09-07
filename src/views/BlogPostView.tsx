import React from 'react';
import { ArrowLeft, Calendar, User, Clock, Share2, Sparkles, ShieldCheck } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { BLOG_POSTS_DATA } from '../data/initialData';

export const BlogPostView: React.FC = () => {
  const { viewParams, navigateTo, openAIMatcherModal } = usePlatform();
  const slug = viewParams.slug || 'how-to-hire-influencers-delhi-ncr-2025';
  const post = BLOG_POSTS_DATA.find((p) => p.slug === slug) || BLOG_POSTS_DATA[0];

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('blog')}
          className="text-xs font-bold text-slate-600 hover:text-[#D4A338] flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Guides</span>
        </button>

        {/* Post Container */}
        <article className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <span className="px-3 py-1 bg-blue-50 text-[#b88628] font-bold text-xs uppercase rounded-full">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt || post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>
          </div>

          {/* Cover */}
          <div className="rounded-2xl overflow-hidden h-72 sm:h-96">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <p className="font-semibold text-slate-900 text-base">
              {post.excerpt}
            </p>
            <p>
              In modern Indian digital commerce, influencer discovery has shifted dramatically from opaque agency rosters to open technology marketplaces. Brands require authentic local reach, verified Trust Scores, and transparent rate cards to guarantee high return on ad spend.
            </p>
            <h2 className="text-xl font-bold text-slate-900 pt-4">Key Takeaways for Brands & Creators</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Always verify audience geography: Ensure at least 85%+ followers originate from the targeted Indian cities.</li>
              <li>Filter by engagement rates rather than vanity follower counts: Nano and Micro creators often deliver 3x higher engagement than macro celebrities.</li>
              <li>Audit with the thebrandsstory. Trust Score to eliminate engagement pod manipulation.</li>
            </ul>
          </div>

          {/* CTA Box */}
          <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-blue-900 text-sm">Ready to hire verified creators?</h3>
              <p className="text-xs text-[#b88628]">Explore 50,000+ creators across 500+ Indian cities on thebrandsstory.</p>
            </div>
            <button
              onClick={() => navigateTo('explore')}
              className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
            >
              Explore Influencers
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
