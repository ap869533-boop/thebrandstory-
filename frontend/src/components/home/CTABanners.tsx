import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users, CheckCircle2, Building2 } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const CTABanners: React.FC = () => {
  const { navigateTo, openOnboardingModal, requireRole } = usePlatform();

  return (
    <div className="py-12 bg-slate-50/80 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Brand Lead Capture Banner (Section 14) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-slate-950 to-zinc-900 text-white p-8 shadow-xl flex flex-col justify-between space-y-6 border border-slate-800">
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A338]/15 border border-[#D4A338]/30 text-[#D4A338] text-[11px] font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                For Brands, Agencies & Restaurants
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Need Influencers For Your Next Product Launch?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                Post your campaign brief in under 2 minutes. Receive curated creator proposals, rate cards, and audience demographics within 4 hours.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="text-[#D4A338]">✓</span> Zero Middleman Markups</span>
                <span className="flex items-center gap-1"><span className="text-[#D4A338]">✓</span> Verified Trust Scores</span>
                <span className="flex items-center gap-1"><span className="text-[#D4A338]">✓</span> Free Quote Dispatch</span>
              </div>
            </div>

            <div className="relative z-10 pt-2">
              <button
                onClick={() => {
                  if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                  navigateTo('post-requirement');
                }}
                className="px-6 py-3 bg-[#D4A338] hover:bg-[#b88628] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#D4A338]/20 transition flex items-center gap-2 cursor-pointer group"
              >
                <span>Post Campaign Brief & Get Quotes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* 2. Creator Onboarding CTA Banner (Section 15) */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 shadow-xl flex flex-col justify-between space-y-6 border border-slate-800">
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A338]/15 border border-[#D4A338]/30 text-[#D4A338] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                100% Free Creator Listing
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Are You a Creator? List Yourself FREE Today
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                Get discovered by thousands of active brands, marketing teams, and local businesses across India. Build your authenticated Trust Score and receive direct paid enquiries.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="text-[#D4A338]">✓</span> Instant Public Profile</span>
                <span className="flex items-center gap-1"><span className="text-[#D4A338]">✓</span> No Agency Commission</span>
                <span className="flex items-center gap-1"><span className="text-[#D4A338]">✓</span> Direct WhatsApp / Email Leads</span>
              </div>
            </div>

            <div className="relative z-10 pt-2">
              <button
                onClick={openOnboardingModal}
                className="px-6 py-3 bg-[#D4A338] hover:bg-[#b88628] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#D4A338]/20 transition flex items-center gap-2 cursor-pointer group"
              >
                <span>List Yourself — FREE in 60s</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
