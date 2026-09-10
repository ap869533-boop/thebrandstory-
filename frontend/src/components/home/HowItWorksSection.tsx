import React, { useState } from 'react';
import { Search, Send, CheckCircle2, UserPlus, ShieldCheck, Sparkles, IndianRupee, ArrowRight, Zap, Target, Lock, MessageSquare } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const HowItWorksSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brands' | 'creators'>('brands');
  const { navigateTo, openOnboardingModal, openTrustScoreModal, requireRole } = usePlatform();

  return (
    <section className="py-16 bg-black text-white border-b border-zinc-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4A338]/15 border border-[#D4A338]/30 text-[#D4A338] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#D4A338]" />
            <span>Simple, Transparent & Scalable</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How thebrandsstory. Marketplace Works
          </h2>
          <p className="text-sm text-zinc-400">
            A frictionless ecosystem connecting India’s brands with verified creators in minutes.
          </p>

          {/* Toggle Switch */}
          <div className="pt-4 flex justify-center">
            <div className="backdrop-blur-md bg-white/10 p-1.5 rounded-2xl flex items-center gap-1 border border-white/15 shadow-lg">
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'brands'
                    ? 'bg-[#D4A338] text-black shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                For Brands & Businesses
              </button>
              <button
                onClick={() => setActiveTab('creators')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'creators'
                    ? 'bg-[#D4A338] text-black shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                For Influencers & Creators
              </button>
            </div>
          </div>
        </div>

        {/* 3 Step Workflow */}
        {activeTab === 'brands' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                1
              </div>
              <h3 className="text-lg font-black text-white">Search, Filter & Compare</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Filter 50,000+ creators by city, category, engagement rate, starting price, and thebrandsstory. Trust Score. Compare up to 4 creators side-by-side with full media kit analytics.
              </p>
            </div>

            <div className="p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                2
              </div>
              <h3 className="text-lg font-black text-white">Direct Enquiry or Post Brief</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Send single or bulk enquiries to creators with zero platform fees, or post your campaign requirement on the live board and get custom creator pitches directly.
              </p>
            </div>

            <div className="p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                3
              </div>
              <h3 className="text-lg font-black text-white">Execute Campaign & Scale</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Lock transparent commercials (Reels, Stories, UGC, Barter), receive timely high-quality content deliverables, and build lasting long-term ambassador partnerships.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                1
              </div>
              <h3 className="text-lg font-black text-white">Create Verified Media Kit</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Sign up free in 2 minutes. Link your Instagram/YouTube accounts, set transparent rate cards for Reels, Stories, UGC & Barter, and get your TrustScore™ verification badge.
              </p>
            </div>

            <div className="p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                2
              </div>
              <h3 className="text-lg font-black text-white">Pitch on Live Brand Briefs</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Browse real-time brand requirements posted by top brands and local businesses. Submit custom pitch quotes directly and showcase your relevant audience reach.
              </p>
            </div>

            <div className="p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                3
              </div>
              <h3 className="text-lg font-black text-white">Get Direct Brand Deals (0% Cut)</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Receive direct booking messages from verified brand managers. Keep 100% of what you earn with zero agency commission cuts.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          {activeTab === 'brands' ? (
            <button
              onClick={() => {
                if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                navigateTo('post-requirement');
              }}
              className="px-6 py-3.5 bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs rounded-2xl shadow-xl shadow-[#D4A338]/20 transition inline-flex items-center gap-2 cursor-pointer border border-[#D4A338]/40"
            >
              <span>Post Your Campaign Brief — Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={openOnboardingModal}
              className="px-6 py-3.5 bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs rounded-2xl shadow-xl shadow-[#D4A338]/20 transition inline-flex items-center gap-2 cursor-pointer border border-[#D4A338]/40"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>Join As Influencer — 100% Free</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
