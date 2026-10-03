import React, { useState } from 'react';
import { Search, Send, CheckCircle2, UserPlus, ShieldCheck, Sparkles, IndianRupee, ArrowRight, Zap, Target, Lock, MessageSquare } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const HowItWorksSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brands' | 'creators'>('brands');
  const { navigateTo, openOnboardingModal, requireRole } = usePlatform();

  return (
    <section className="py-16 sm:py-20 bg-[#061226] text-white border-b border-slate-800/80 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            How thebrandsstory. Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            A frictionless ecosystem connecting India’s brands with verified creators in minutes.
          </p>

          {/* Toggle Switch */}
          <div className="pt-4 flex justify-center">
            <div className="bg-[#0d224b]/80 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1 border border-slate-700 shadow-lg">
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'brands'
                    ? 'bg-[#D4A338] text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                For Brands & Businesses
              </button>
              <button
                onClick={() => setActiveTab('creators')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'creators'
                    ? 'bg-[#D4A338] text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
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
            <div className="p-7 rounded-3xl bg-[#091b3b]/70 border border-slate-700/80 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-[#0c244f] transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                1
              </div>
              <h3 className="text-lg font-black text-white">Search, Filter & Compare</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Discover creators across 50+ categories and 100+ cities in India with live engagement metrics and transparent pricing.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#091b3b]/70 border border-slate-700/80 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-[#0c244f] transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                2
              </div>
              <h3 className="text-lg font-black text-white">Post Requirements or Direct Connect</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Publish a campaign brief with your budget, deliverables, and timeline, or send direct inquiries to selected influencers.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#091b3b]/70 border border-slate-700/80 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-[#0c244f] transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                3
              </div>
              <h3 className="text-lg font-black text-white">0% Commission Collaboration</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Review pitches, negotiate deliverables directly, and execute campaigns with zero agency commissions or hidden markups.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-7 rounded-3xl bg-[#091b3b]/70 border border-slate-700/80 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-[#0c244f] transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                1
              </div>
              <h3 className="text-lg font-black text-white">List Your Profile Free</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Create a verified media kit showcasing your portfolio, audience demographics, categories, and collaboration rates.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#091b3b]/70 border border-slate-700/80 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-[#0c244f] transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                2
              </div>
              <h3 className="text-lg font-black text-white">Pitch for Live Brand Deals</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Browse real-time brand briefs and submit tailored pitches directly to brand marketing teams and business owners.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#091b3b]/70 border border-slate-700/80 space-y-4 relative group hover:border-[#D4A338]/50 hover:bg-[#0c244f] transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A338]/20 border border-[#D4A338]/40 text-[#D4A338] flex items-center justify-center font-black text-lg shadow-md">
                3
              </div>
              <h3 className="text-lg font-black text-white">Direct Brand Payouts</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Deliver content, grow your personal brand, and keep 100% of your earnings with zero platform cuts or deductions.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
