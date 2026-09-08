import React from 'react';
import { BookOpen, ArrowRight, Calendar, User, Sparkles } from 'lucide-react';
import { BLOG_POSTS_DATA } from '../data/initialData';
import { usePlatform } from '../context/PlatformContext';

export const BlogView: React.FC = () => {
  const { navigateTo, blogPosts } = usePlatform();

  const displayPosts = blogPosts && blogPosts.length > 0 ? blogPosts : BLOG_POSTS_DATA;

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#b88628] text-xs font-bold uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Influencer Intelligence & Industry Reports</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Creator Economy Guides & Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Actionable data, rate benchmarks, and scaling playbooks for Indian brands and creators.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigateTo('blog-post', { slug: post.slug })}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-lg transition duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#D4A338] transition leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{post.readTime}</span>
                  <span className="text-[#D4A338] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                    Read Guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
